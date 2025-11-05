package com.evtrading.swp391.controller;

import com.evtrading.swp391.service.ContractService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/api/contracts")
public class ContractWebhookController {

    private final ContractService contractService;
    private final ObjectMapper mapper = new ObjectMapper();
    private static final Logger log = LoggerFactory.getLogger(ContractWebhookController.class);

    @Value("${docuseal.webhook.headerName:}")
    private String webhookHeaderName;
    @Value("${docuseal.webhook.headerValue:}")
    private String webhookHeaderValue;

    public ContractWebhookController(ContractService contractService) {
        this.contractService = contractService;
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(HttpServletRequest request, @RequestBody(required = false) String body) {
        if (webhookHeaderName != null && !webhookHeaderName.isBlank()) {
            String got = request.getHeader(webhookHeaderName);
            if (got == null || !got.equals(webhookHeaderValue)) {
                log.warn("Webhook rejected: invalid secret header {}", webhookHeaderName);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid webhook secret");
            }
        }
        try {
            Map<String, Object> json = parseBodyFlexible(request, body);
            try {
                // Log full payload at debug level to help map DocuSeal fields
                if (log.isDebugEnabled()) log.debug("Webhook raw parsed JSON: {}", mapper.writeValueAsString(json));
            } catch (Exception ignored) { }

            String envelopeId = extractId(json);
            String status = extractStatus(json);
            String signedFileUrl = extractCombinedUrl(json);
            Date signedAt = extractCompletedAt(json);
            String email = extractEmail(json);
            String role = extractRole(json);
            String eventType = extractEventType(json);

            if (envelopeId != null) {
                boolean updatedById = false;
                try {
                    contractService.handleWebhookUpdate(envelopeId, status, signedFileUrl, signedAt, email, role, eventType);
                    updatedById = true;
                    log.info("Webhook processed for envelope/submission {} status={} role={} email={} signedUrl={} signedAt={}", envelopeId, status, role, email, signedFileUrl, signedAt);
                } catch (Exception ex) {
                    log.info("Webhook id {} not found, will try fallback by email. err={}", envelopeId, ex.getMessage());
                }
                if (!updatedById) {
                    // Fallback if cannot locate by id
                    if (email != null && !email.isBlank()) {
                        contractService.handleWebhookFallbackByEmailWithId(email, envelopeId, status, signedFileUrl, signedAt);
                        log.info("Webhook fallback by email processed for {} status={} with id {}", email, status, envelopeId);
                    } else {
                        log.info("Webhook received but neither id matched nor email present. event_type={}, keys={}", json.get("event_type"), json.keySet());
                    }
                }
            } else {
                // Fallback: some form.* events provide submitter email but not submission_id
                if (email != null && !email.isBlank()) {
                    try {
                        // no id present; still update by email
                        contractService.handleWebhookFallbackByEmail(email, status, signedFileUrl, eventType, signedAt);
                        log.info("Webhook fallback by email processed for {} status={} (no id)", email, status);
                    } catch (Exception ignored) {
                        log.info("Webhook received but no envelope/submission id found. event_type={}, keys={}", json.get("event_type"), json.keySet());
                    }
                } else {
                    log.info("Webhook received but no envelope/submission id found. event_type={}, keys={}", json.get("event_type"), json.keySet());
                }
            }
            return ResponseEntity.ok("ok");
        } catch (Exception e) {
            // Be tolerant: don't fail the webhook; just log and return 200
            log.warn("Webhook parse/update error: {}", e.getMessage(), e);
            return ResponseEntity.ok("ignored");
        }
    }

    @SuppressWarnings("unchecked")
    private static String extractEmail(Map<String, Object> json) {
        Object data = json.get("data");
        if (data instanceof Map<?,?> m) {
            Object v = ((Map<String, Object>) m).get("email");
            if (v instanceof String s && !s.isBlank()) return s;
            v = ((Map<String, Object>) m).get("submitter_email");
            if (v instanceof String s2 && !s2.isBlank()) return s2;
            v = ((Map<String, Object>) m).get("signer_email");
            if (v instanceof String s && !s.isBlank()) return s;
        }
        Object v = json.get("email");
        if (v == null) v = json.get("submitter_email");
        if (v == null) v = json.get("signer_email");
        return v instanceof String s && !s.isBlank() ? s : null;
    }

    private static String extractRole(Map<String, Object> json) {
        Object data = json.get("data");
        if (data instanceof Map<?,?> m) {
            Object v = m.get("role");
            if (v instanceof String s && !s.isBlank()) return s;
            v = m.get("submitter_role");
            if (v instanceof String s && !s.isBlank()) return s;
            v = m.get("signer_role");
            if (v instanceof String s && !s.isBlank()) return s;
        }
        Object v = json.get("role");
        if (v == null) v = json.get("submitter_role");
        if (v == null) v = json.get("signer_role");
        return v instanceof String s && !s.isBlank() ? s : null;
    }

    private static String extractEventType(Map<String, Object> json) {
        Object v = json.get("event_type");
        if (v instanceof String s && !s.isBlank()) {
            return s;
        }
        Object type = json.get("type");
        return type instanceof String s && !s.isBlank() ? s : null;
    }
    private Map<String, Object> parseBodyFlexible(HttpServletRequest request, String body) throws Exception {
        try {
            if (body != null && !body.isBlank()) {
                // Try JSON first
                return mapper.readValue(body, new TypeReference<Map<String, Object>>() {});
            }
        } catch (Exception ex) {
            // fall through to other formats
        }

        String contentType = request.getContentType() == null ? "" : request.getContentType();
        if (contentType.contains("application/x-www-form-urlencoded")) {
            // Some providers send payload as a 'payload' param
            String payload = request.getParameter("payload");
            if (payload != null && !payload.isBlank()) {
                try { return mapper.readValue(payload, new TypeReference<Map<String, Object>>() {}); } catch (Exception ignored) {}
            }
            // Or send flat params; convert to map
            Map<String, String[]> params = request.getParameterMap();
            Map<String, Object> flat = new java.util.HashMap<>();
            params.forEach((k, v) -> flat.put(k, v != null && v.length == 1 ? v[0] : v));
            return flat;
        }

        // Default empty map
        return Map.of();
    }

    @SuppressWarnings("unchecked")
    private static String extractId(Map<String, Object> json) {
        // Prefer submission_id over generic id, to avoid capturing form.id instead of submission id
        Object id = json.get("submission_id");
        if (id == null) id = json.get("envelope_id");
        if (id == null) id = json.get("id");
        if (id == null) {
            Object data = json.get("data");
            if (data instanceof Map<?,?> m) {
                id = ((Map<String, Object>) m).get("submission_id");
                if (id == null) id = ((Map<String, Object>) m).get("envelope_id");
                if (id == null) id = ((Map<String, Object>) m).get("id");
            }
        }
        return id == null ? null : String.valueOf(id);
    }

    @SuppressWarnings("unchecked")
    private static String extractStatus(Map<String, Object> json) {
        Object s = json.get("status");
        if (s == null) {
            Object data = json.get("data");
            if (data instanceof Map<?,?> m) s = ((Map<String, Object>) m).get("status");
        }
        if (s == null) {
            Object event = json.get("event_type");
            if (event instanceof String ev) {
                if (ev.contains("completed")) return "Signed";
                if (ev.contains("declined")) return "Declined";
            }
        }
        return s == null ? null : String.valueOf(s);
    }

    @SuppressWarnings("unchecked")
    private static String extractCombinedUrl(Map<String, Object> json) {
        Object data = json.get("data");
        if (data instanceof Map<?,?> m) {
            Object url = ((Map<String, Object>) m).get("combined_document_url");
            if (url instanceof String s && !s.isBlank()) return s;
            url = ((Map<String, Object>) m).get("signed_file_url");
            if (url instanceof String s2 && !s2.isBlank()) return s2;
        }
        Object url = json.get("combined_document_url");
        return url instanceof String s ? s : null;
    }

    private static Date extractCompletedAt(Map<String, Object> json) {
        Object data = json.get("data");
        Object v = null;
        if (data instanceof Map<?,?> m) v = m.get("completed_at");
        if (v == null) v = json.get("completed_at");
        if (v instanceof String s) {
            try {
                java.time.OffsetDateTime odt = java.time.OffsetDateTime.parse(s);
                return Date.from(odt.toInstant());
            } catch (Exception ignored) {
                try {
                    java.time.Instant ins = java.time.Instant.parse(s);
                    return Date.from(ins);
                } catch (Exception ignored2) { /* ignore */ }
            }
        }
        return null;
    }
}
