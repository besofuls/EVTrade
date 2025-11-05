package com.evtrading.swp391.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class DocuSealService {

    private static final Logger log = LoggerFactory.getLogger(DocuSealService.class);

    @Value("${docuseal.api.url:https://api.docuseal.com}")
    private String apiBaseUrl;

    @Value("${docuseal.api.key:}")
    private String apiKey;

    // Default to submissions API; can be overridden to /api/envelopes if needed
    @Value("${docuseal.api.createEnvelopePath:/submissions}")
    private String createPath;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    public record Signer(String role, String email, String name) {
        public Signer {
            if (email == null || email.isBlank()) {
                throw new IllegalArgumentException("DocuSeal signer email is required");
            }
        }
        public String roleOr(String fallback) {
            return role != null && !role.isBlank() ? role : fallback;
        }
    }

    public static class CreateResult {
        public final String envelopeId; // submission/envelope id
        public final String signingUrl; // link for signer to open
        public final Map<String, String> signingUrlsByRole;
        public final Map<String, String> signingUrlsByEmail;
        public final Map<String, Object> raw;

        public CreateResult(String envelopeId,
                            String signingUrl,
                            Map<String, String> signingUrlsByRole,
                            Map<String, String> signingUrlsByEmail,
                            Map<String, Object> raw) {
            this.envelopeId = envelopeId;
            this.signingUrl = signingUrl;
            this.signingUrlsByRole = signingUrlsByRole == null ? Map.of() : Map.copyOf(signingUrlsByRole);
            this.signingUrlsByEmail = signingUrlsByEmail == null ? Map.of() : Map.copyOf(signingUrlsByEmail);
            this.raw = raw;
        }

        public String signingUrlForRole(String role) {
            if (role == null || signingUrlsByRole.isEmpty()) {
                return null;
            }
            return signingUrlsByRole.get(normalizeRoleKey(role));
        }

        public String signingUrlForEmail(String email) {
            if (email == null || signingUrlsByEmail.isEmpty()) {
                return null;
            }
            return signingUrlsByEmail.get(email.toLowerCase(Locale.ROOT));
        }
    }

    public CreateResult createEnvelope(String templateId, String signerEmail, String signerName, String content) {
        Map<String, Object> variables = new HashMap<>();
        if (content != null && !content.isBlank()) {
            variables.put("content", content);
        }
        return createEnvelope(
                templateId,
                List.of(new Signer("First Party", signerEmail, signerName)),
                variables,
                null
        );
    }

    public CreateResult createEnvelope(String templateId,
                                       List<Signer> signers,
                                       Map<String, Object> variables,
                                       Map<String, Object> metadata) {
        if (apiKey == null || apiKey.isBlank() || apiBaseUrl == null || apiBaseUrl.isBlank()) {
            throw new IllegalStateException("DocuSeal API credentials are not configured");
        }
        if (signers == null || signers.isEmpty()) {
            throw new IllegalArgumentException("At least one signer is required");
        }
        if (templateId == null || templateId.isBlank()) {
            throw new IllegalArgumentException("DocuSeal template id is required");
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("template_id", tryParseInt(templateId));
        payload.putIfAbsent("templateId", templateId);
        payload.put("send_email", true);
        if (variables != null && !variables.isEmpty()) {
            payload.put("variables", variables);
        }
        if (metadata != null && !metadata.isEmpty()) {
            payload.put("metadata", metadata);
        }

        List<Map<String, Object>> submitters = new ArrayList<>();
        List<Map<String, Object>> recipients = new ArrayList<>();
        for (int i = 0; i < signers.size(); i++) {
            Signer signer = signers.get(i);
            String role = signer.roleOr("Signer " + (i + 1));

            Map<String, Object> submitter = new LinkedHashMap<>();
            submitter.put("role", role);
            submitter.put("email", signer.email());
            if (signer.name() != null && !signer.name().isBlank()) {
                submitter.put("name", signer.name());
            }
            submitter.put("routing_order", i + 1);
            submitters.add(submitter);

            Map<String, Object> recipient = new LinkedHashMap<>();
            recipient.put("role", role);
            recipient.put("email", signer.email());
            if (signer.name() != null && !signer.name().isBlank()) {
                recipient.put("name", signer.name());
            }
            recipient.put("order", i + 1);
            recipients.add(recipient);
        }
        payload.put("submitters", submitters);
        payload.put("recipients", recipients);
        payload.put("signers", recipients);

        // backwards compatibility for tenants expecting a single signer object
        if (!recipients.isEmpty()) {
            payload.put("signer", recipients.get(0));
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("X-Auth-Token", apiKey);
        headers.setBearerAuth(apiKey);

        String url = normalizeUrl(apiBaseUrl, createPath);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
        try {
            return doCreate(url, entity, signers);
        } catch (HttpStatusCodeException e) {
            if (e.getStatusCode().value() == 404) {
                String fallback = "/submissions".equalsIgnoreCase(createPath) ? "/api/envelopes" : "/submissions";
                try {
                    return doCreate(normalizeUrl(apiBaseUrl, fallback), entity, signers);
                } catch (HttpStatusCodeException e2) {
                    throw new RuntimeException("DocuSeal create error (fallback): " + e2.getStatusCode() + " " + e2.getResponseBodyAsString(), e2);
                } catch (Exception e2) {
                    throw new RuntimeException("DocuSeal create error (fallback): " + e2.getMessage(), e2);
                }
            }
            throw new RuntimeException("DocuSeal create error: " + e.getStatusCode() + " " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            throw new RuntimeException("DocuSeal create error: " + e.getMessage(), e);
        }
    }

    private CreateResult doCreate(String url, HttpEntity<Map<String, Object>> entity, List<Signer> signers) throws Exception {
        ResponseEntity<String> response = restTemplate.exchange(URI.create(url), HttpMethod.POST, entity, String.class);
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("DocuSeal create failed: " + response.getStatusCode());
        }

        Map<String, Object> body = Collections.emptyMap();
        String raw = response.getBody();
        if (log.isDebugEnabled()) {
            log.debug("DocuSeal create response: status={} headers={} body={}", response.getStatusCode(), response.getHeaders(), raw);
        }
        try {
            if (raw != null && !raw.isBlank()) {
                body = mapper.readValue(raw, new TypeReference<>() {});
            }
        } catch (Exception parseEx) {
            // tolerate non-JSON response and continue
            if (log.isDebugEnabled()) log.debug("DocuSeal response body not JSON: {}", parseEx.getMessage());
        }

        String id = findId(body);
        if (id == null) {
            // Try Location header: .../submissions/{id} or .../envelopes/{id}
            String loc = Optional.ofNullable(response.getHeaders().getFirst("Location")).orElse(null);
            if (loc != null) {
                int slash = loc.lastIndexOf('/') + 1;
                if (slash > 0 && slash < loc.length()) {
                    id = loc.substring(slash);
                }
            }
            if (id == null) {
                // Try other potential headers just in case
                String hdr = Optional.ofNullable(response.getHeaders().getFirst("X-Submission-Id")).orElse(null);
                if (hdr == null) hdr = response.getHeaders().getFirst("X-Envelope-Id");
                if (hdr != null && !hdr.isBlank()) id = hdr;
            }
        }

        SigningUrls signingUrls = extractSigningUrls(body, signers);
        String signingUrl = findSigningUrl(body);
        if (signingUrl == null) {
            signingUrl = firstNonNull(signingUrls.byRole.values());
            if (signingUrl == null) {
                signingUrl = firstNonNull(signingUrls.byEmail.values());
            }
        }
        return new CreateResult(id, signingUrl, signingUrls.byRole, signingUrls.byEmail, body);
    }

    private SigningUrls extractSigningUrls(Map<String, Object> body, List<Signer> expectedSigners) {
        Map<String, String> byRole = new LinkedHashMap<>();
        Map<String, String> byEmail = new LinkedHashMap<>();

        collectSigningUrlsFromMap(body, byRole, byEmail);
        Object data = body != null ? body.get("data") : null;
        if (data instanceof Map<?, ?> dataMap) {
            @SuppressWarnings("unchecked")
            Map<String, Object> asMap = (Map<String, Object>) dataMap;
            collectSigningUrlsFromMap(asMap, byRole, byEmail);
        }

        return new SigningUrls(byRole, byEmail);
    }

    @SuppressWarnings("unchecked")
    private void collectSigningUrlsFromMap(Map<String, Object> source,
                                           Map<String, String> byRole,
                                           Map<String, String> byEmail) {
        if (source == null) {
            return;
        }
        for (String key : List.of("submitters", "recipients", "signers")) {
            Object value = source.get(key);
            if (value instanceof List<?> list) {
                for (Object item : list) {
                    if (item instanceof Map<?, ?> itemMapRaw) {
                        Map<String, Object> itemMap = (Map<String, Object>) itemMapRaw;
                        String role = stringValue(itemMap.get("role"));
                        String email = stringValue(itemMap.get("email"));
                        String link = extractLinkFromMap(itemMap);
                        if (role != null && link != null) {
                            byRole.putIfAbsent(normalizeRoleKey(role), link);
                        }
                        if (email != null && link != null) {
                            byEmail.putIfAbsent(email.toLowerCase(Locale.ROOT), link);
                        }
                    }
                }
            }
        }

        Object signingUrlsObj = source.get("signing_urls");
        if (signingUrlsObj instanceof Map<?, ?> urlsRaw) {
            Map<String, Object> urls = (Map<String, Object>) urlsRaw;
            for (Map.Entry<String, Object> entry : urls.entrySet()) {
                String link = stringValue(entry.getValue());
                if (link != null) {
                    byRole.putIfAbsent(normalizeRoleKey(entry.getKey()), link);
                }
            }
        }
    }

    private String extractLinkFromMap(Map<String, Object> map) {
        if (map == null) {
            return null;
        }
        for (String key : List.of("link", "signing_url", "sign_url", "url")) {
            String value = stringValue(map.get(key));
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private String stringValue(Object value) {
        if (value instanceof String s && !s.isBlank()) {
            return s;
        }
        return null;
    }

    private static String firstNonNull(Collection<String> values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private static String normalizeUrl(String base, String path) {
        String b = base.endsWith("/") ? base.substring(0, base.length()-1) : base;
        String p = path.startsWith("/") ? path : "/" + path;
        return b + p;
    }

    private static Integer tryParseInt(String v) {
        try { return v == null ? null : Integer.parseInt(v); } catch (NumberFormatException e) { return null; }
    }

    private static String normalizeRoleKey(String role) {
        if (role == null) {
            return null;
        }
        String trimmed = role.trim();
        return trimmed.isEmpty() ? null : trimmed.toLowerCase(Locale.ROOT);
    }

    private static final class SigningUrls {
        final Map<String, String> byRole;
        final Map<String, String> byEmail;

        SigningUrls(Map<String, String> byRole, Map<String, String> byEmail) {
            this.byRole = byRole;
            this.byEmail = byEmail;
        }
    }

    @SuppressWarnings("unchecked")
    private String findId(Map<String, Object> body) {
        Object id = body.get("id");
        if (id == null) id = body.get("envelope_id");
        if (id == null) id = body.get("submission_id");
        if (id == null) {
            // Sometimes APIs wrap under a named object
            Object sub = body.get("submission");
            if (sub instanceof Map<?,?> m) {
                Object v = ((Map<String, Object>) m).get("id");
                if (v == null) v = ((Map<String, Object>) m).get("submission_id");
                if (v != null) id = v;
            }
            Object env = body.get("envelope");
            if (id == null && env instanceof Map<?,?> m2) {
                Object v2 = ((Map<String, Object>) m2).get("id");
                if (v2 == null) v2 = ((Map<String, Object>) m2).get("envelope_id");
                if (v2 != null) id = v2;
            }
        }
        if (id == null) {
            // sometimes nested
            Map<String, Object> data = (Map<String, Object>) body.get("data");
            if (data != null) {
                id = data.get("id");
                if (id == null) id = data.get("submission_id");
                if (id == null) id = data.get("envelope_id");
                if (id == null) {
                    Object sub = data.get("submission");
                    if (sub instanceof Map<?,?> m) {
                        Object v = ((Map<String, Object>) m).get("id");
                        if (v == null) v = ((Map<String, Object>) m).get("submission_id");
                        if (v != null) id = v;
                    }
                    Object env = data.get("envelope");
                    if (id == null && env instanceof Map<?,?> m2) {
                        Object v2 = ((Map<String, Object>) m2).get("id");
                        if (v2 == null) v2 = ((Map<String, Object>) m2).get("envelope_id");
                        if (v2 != null) id = v2;
                    }
                }
            }
        }
        return id == null ? null : String.valueOf(id);
    }

    @SuppressWarnings("unchecked")
    private String findSigningUrl(Map<String, Object> body) {
        // common locations
        String[] keys = {"signing_url", "sign_url", "url", "link"};
        for (String k : keys) {
            Object v = body.get(k);
            if (v instanceof String s && !s.isBlank()) return s;
        }
        // check submitters array
        Object submitters = body.get("submitters");
        if (submitters instanceof List<?> list && !list.isEmpty()) {
            Object first = list.get(0);
            if (first instanceof Map<?, ?> m) {
                for (String k : keys) {
                    Object v = ((Map<String, Object>) m).get(k);
                    if (v instanceof String s && !s.isBlank()) return s;
                }
            }
        }
        // nested data
        Object data = body.get("data");
        if (data instanceof Map<?,?> m) {
            for (String k : keys) {
                Object v = ((Map<String, Object>) m).get(k);
                if (v instanceof String s && !s.isBlank()) return s;
            }
        }
        return null;
    }
}
