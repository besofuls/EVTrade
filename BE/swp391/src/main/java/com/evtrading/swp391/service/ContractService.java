package com.evtrading.swp391.service;

import com.evtrading.swp391.dto.ContractCreateDTO;
import com.evtrading.swp391.dto.ContractDTO;
import com.evtrading.swp391.entity.Contract;
import com.evtrading.swp391.entity.Order;
import com.evtrading.swp391.entity.Profile;
import com.evtrading.swp391.entity.User;
import com.evtrading.swp391.repository.ContractRepository;
import com.evtrading.swp391.repository.OrderRepository;
import com.evtrading.swp391.repository.ProfileRepository;
import com.evtrading.swp391.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
public class ContractService {

    private final ContractRepository contractRepository;
    private final OrderRepository orderRepository;
    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final DocuSealService docuSealService;

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_SIGNED = "SIGNED";
    private static final String STATUS_DECLINED = "DECLINED";
    private static final String DOCUSEAL_ROLE_SELLER = "First Party";
    private static final String DOCUSEAL_ROLE_BUYER = "Second Party";

    public ContractService(ContractRepository contractRepository,
                           OrderRepository orderRepository,
                           ProfileRepository profileRepository,
                           UserRepository userRepository,
                           DocuSealService docuSealService) {
        this.contractRepository = contractRepository;
        this.orderRepository = orderRepository;
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.docuSealService = docuSealService;
    }

    private Optional<Contract> findContractByParticipantEmail(String email) {
        if (email == null || email.isBlank()) {
            return Optional.empty();
        }
        Optional<Contract> sellerMatch = contractRepository.findTopBySellerEmailOrderByUpdateAtDesc(email);
        if (sellerMatch.isPresent()) {
            return sellerMatch;
        }
        Optional<Contract> buyerMatch = contractRepository.findTopByBuyerEmailOrderByUpdateAtDesc(email);
        if (buyerMatch.isPresent()) {
            return buyerMatch;
        }
        return Optional.empty();
    }

    private String resolveDisplayName(User user) {
        if (user == null) {
            return null;
        }
        Optional<Profile> profileOpt = profileRepository.findByUser_UserID(user.getUserID());
        return firstNonBlank(profileOpt.map(Profile::getFullName).orElse(null), user.getUsername(), user.getEmail());
    }

    private String firstNonBlank(String... values) {
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

    private boolean applyParticipantUpdate(Contract contract,
                                           String participantEmail,
                                           String participantRole,
                                           String rawStatus,
                                           String eventType,
                                           Date signedAt) {
        boolean matched = false;
        String normalizedRole = normalizeRoleKey(participantRole);
        String normalizedEmail = participantEmail != null ? participantEmail.trim() : null;
        String normalizedStatus = normalizeParticipantStatus(rawStatus, eventType);

        if (isSellerParty(contract, normalizedEmail, normalizedRole)) {
            matched = true;
            if (normalizedStatus != null) {
                contract.setSellerStatus(normalizedStatus);
                if (STATUS_SIGNED.equalsIgnoreCase(normalizedStatus)) {
                    contract.setSellerSignedAt(signedAt != null ? signedAt : new Date());
                } else if (STATUS_DECLINED.equalsIgnoreCase(normalizedStatus)) {
                    contract.setSellerSignedAt(null);
                }
            }
        }

        if (isBuyerParty(contract, normalizedEmail, normalizedRole)) {
            matched = true;
            if (normalizedStatus != null) {
                contract.setBuyerStatus(normalizedStatus);
                if (STATUS_SIGNED.equalsIgnoreCase(normalizedStatus)) {
                    contract.setBuyerSignedAt(signedAt != null ? signedAt : new Date());
                } else if (STATUS_DECLINED.equalsIgnoreCase(normalizedStatus)) {
                    contract.setBuyerSignedAt(null);
                }
            }
        }
        return matched;
    }

    private boolean isSellerParty(Contract contract, String participantEmail, String participantRoleNormalized) {
        return matchesEmail(contract.getSellerEmail(), participantEmail) ||
                matchesRole(participantRoleNormalized, DOCUSEAL_ROLE_SELLER);
    }

    private boolean isBuyerParty(Contract contract, String participantEmail, String participantRoleNormalized) {
        return matchesEmail(contract.getBuyerEmail(), participantEmail) ||
                matchesRole(participantRoleNormalized, DOCUSEAL_ROLE_BUYER);
    }

    private boolean matchesEmail(String storedEmail, String participantEmail) {
        return storedEmail != null && participantEmail != null && storedEmail.equalsIgnoreCase(participantEmail);
    }

    private boolean matchesRole(String participantRoleNormalized, String referenceRole) {
        return participantRoleNormalized != null &&
                participantRoleNormalized.equals(normalizeRoleKey(referenceRole));
    }

    private String normalizeRoleKey(String role) {
        return role == null ? null : role.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeParticipantStatus(String rawStatus, String eventType) {
        String statusLower = rawStatus != null ? rawStatus.trim().toLowerCase(Locale.ROOT) : "";
        if (!statusLower.isEmpty()) {
            if (statusLower.contains("declin")) {
                return STATUS_DECLINED;
            }
            if (statusLower.contains("complete") || statusLower.contains("sign")) {
                return STATUS_SIGNED;
            }
            if (statusLower.contains("pending") || statusLower.contains("wait")) {
                return STATUS_PENDING;
            }
        }
        if (eventType != null) {
            String eventLower = eventType.toLowerCase(Locale.ROOT);
            if (eventLower.contains("declin")) {
                return STATUS_DECLINED;
            }
            if (eventLower.contains("completed") || eventLower.contains("signed")) {
                return STATUS_SIGNED;
            }
        }
        return statusLower.isEmpty() ? null : STATUS_PENDING;
    }

    private void applyEnvelopeStatus(Contract contract, String rawStatus, String eventType) {
        if (rawStatus == null) {
            return;
        }
        String lower = rawStatus.toLowerCase(Locale.ROOT);
        if (lower.contains("declin")) {
            contract.setSellerStatus(STATUS_DECLINED);
            contract.setBuyerStatus(STATUS_DECLINED);
            contract.setStatus("DECLINED");
            return;
        }
        if (lower.contains("complete") || lower.contains("signed")) {
            if (!isSignedStatus(contract.getSellerStatus()) && !isSignedStatus(contract.getBuyerStatus())) {
                contract.setSellerStatus(STATUS_SIGNED);
                contract.setBuyerStatus(STATUS_SIGNED);
            }
        }
        if (lower.contains("pending") || lower.contains("progress")) {
            if (!"DECLINED".equalsIgnoreCase(contract.getStatus())) {
                contract.setStatus("PENDING_BOTH");
            }
        }
    }

    private void applyEnvelopeEvent(Contract contract, String eventType) {
        if (eventType == null) {
            return;
        }
        String ev = eventType.toLowerCase(Locale.ROOT);
        if (ev.contains("declin")) {
            contract.setSellerStatus(STATUS_DECLINED);
            contract.setBuyerStatus(STATUS_DECLINED);
            contract.setStatus("DECLINED");
            return;
        }
        if (ev.contains("partially_completed")) {
            return;
        }
        if (ev.contains("completed")) {
            if (!isSignedStatus(contract.getSellerStatus()) && !isSignedStatus(contract.getBuyerStatus())) {
                contract.setSellerStatus(STATUS_SIGNED);
                contract.setBuyerStatus(STATUS_SIGNED);
            }
        }
    }

    private void updateOverallStatus(Contract contract) {
        if (isDeclinedStatus(contract.getSellerStatus()) || isDeclinedStatus(contract.getBuyerStatus())) {
            contract.setStatus("DECLINED");
            return;
        }
        boolean sellerSigned = isSignedStatus(contract.getSellerStatus());
        boolean buyerSigned = isSignedStatus(contract.getBuyerStatus());
        if (sellerSigned && buyerSigned) {
            contract.setStatus("SIGNED_BOTH");
        } else if (sellerSigned) {
            contract.setStatus("SIGNED_SELLER");
        } else if (buyerSigned) {
            contract.setStatus("SIGNED_BUYER");
        } else if (!"DECLINED".equalsIgnoreCase(contract.getStatus())) {
            contract.setStatus("PENDING_BOTH");
        }
    }

    private boolean isSignedStatus(String status) {
        return status != null && STATUS_SIGNED.equalsIgnoreCase(status);
    }

    private boolean isDeclinedStatus(String status) {
        return status != null && STATUS_DECLINED.equalsIgnoreCase(status);
    }

    private boolean isFullySigned(Contract contract) {
        return isSignedStatus(contract.getSellerStatus()) && isSignedStatus(contract.getBuyerStatus());
    }

    private boolean isCompletionEvent(String eventType) {
        if (eventType == null) {
            return false;
        }
        String ev = eventType.toLowerCase(Locale.ROOT);
        return ev.contains("completed") || ev.contains("signed");
    }

    @Transactional
    public ContractDTO createDraftAndSend(ContractCreateDTO req, String currentUsername) {
        if (currentUsername == null || currentUsername.isBlank()) {
            throw new SecurityException("Authentication required");
        }
        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + req.getOrderId()));

        User current = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + currentUsername));
        User buyer = order.getBuyer();
        User seller = order.getListing() != null ? order.getListing().getUser() : null;
        if (buyer == null || seller == null) {
            throw new IllegalStateException("Order " + order.getOrderID() + " does not have buyer and seller information");
        }

        boolean isBuyer = buyer.getUserID().equals(current.getUserID());
        boolean isSeller = seller.getUserID().equals(current.getUserID());
        boolean isStaff = current.getRole() != null && current.getRole().getRoleName() != null &&
                ("ADMIN".equalsIgnoreCase(current.getRole().getRoleName()) || "MODERATOR".equalsIgnoreCase(current.getRole().getRoleName()));
        if (!isBuyer && !isSeller && !isStaff) {
            throw new SecurityException("Not allowed to send contract for this order");
        }

        Optional<Contract> existingOpt = contractRepository.findByOrder(order);
        Contract contract = existingOpt.orElseGet(Contract::new);
        String templateId = firstNonBlank(req.getTemplateId(), contract.getDocusealTemplateID());
        if (templateId == null || templateId.isBlank()) {
            throw new IllegalArgumentException("DocuSeal template id is required");
        }

        String sellerEmail = firstNonBlank(req.getSellerEmail(), seller.getEmail());
        String buyerEmail = firstNonBlank(req.getBuyerEmail(), buyer.getEmail());
        if (sellerEmail == null || sellerEmail.isBlank() || buyerEmail == null || buyerEmail.isBlank()) {
            throw new IllegalArgumentException("Buyer and seller email must be provided");
        }

        String sellerName = firstNonBlank(req.getSellerName(), resolveDisplayName(seller));
        String buyerName = firstNonBlank(req.getBuyerName(), resolveDisplayName(buyer));

        Map<String, Object> variables = req.getVariables() != null ? new HashMap<>(req.getVariables()) : new HashMap<>();
        if (req.getContent() != null && !req.getContent().isBlank()) {
            variables.putIfAbsent("content", req.getContent());
        }

        Map<String, Object> metadata = req.getMetadata() != null ? new HashMap<>(req.getMetadata()) : new HashMap<>();

        Date now = new Date();
        if (contract.getContractID() == null) {
            contract.setCreateAt(now);
        }
        contract.setOrder(order);
        contract.setContent(req.getContent());
        contract.setDocusealTemplateID(templateId);
        contract.setSellerEmail(sellerEmail);
        contract.setSellerName(sellerName);
        contract.setSellerStatus(STATUS_PENDING);
        contract.setSellerSigningUrl(null);
        contract.setSellerSignedAt(null);
        contract.setBuyerEmail(buyerEmail);
        contract.setBuyerName(buyerName);
        contract.setBuyerStatus(STATUS_PENDING);
        contract.setBuyerSigningUrl(null);
        contract.setBuyerSignedAt(null);
        contract.setSignedFileUrl(null);
        contract.setSignedAt(null);
        contract.setStatus("Draft");
        contract.setUpdateAt(now);
        contract = contractRepository.save(contract);

        metadata.putIfAbsent("contract_id", contract.getContractID());
        metadata.putIfAbsent("order_id", order.getOrderID());
        metadata.putIfAbsent("seller_id", seller.getUserID());
        metadata.putIfAbsent("buyer_id", buyer.getUserID());
        metadata.putIfAbsent("seller_role", DOCUSEAL_ROLE_SELLER);
        metadata.putIfAbsent("buyer_role", DOCUSEAL_ROLE_BUYER);
        metadata.putIfAbsent("seller_email", sellerEmail);
        metadata.putIfAbsent("buyer_email", buyerEmail);
        metadata.putIfAbsent("initiated_by", current.getUsername());
        metadata.putIfAbsent("generated_at", OffsetDateTime.now(ZoneOffset.UTC).toString());

        List<DocuSealService.Signer> signers = new ArrayList<>();
        signers.add(new DocuSealService.Signer(DOCUSEAL_ROLE_SELLER, sellerEmail, sellerName));
        signers.add(new DocuSealService.Signer(DOCUSEAL_ROLE_BUYER, buyerEmail, buyerName));

        DocuSealService.CreateResult result = docuSealService.createEnvelope(templateId, signers, variables, metadata);

        contract.setDocusealEnvelopeID(result.envelopeId);
        String fallbackUrl = result.signingUrl;
        String sellerUrl = firstNonBlank(result.signingUrlForRole(DOCUSEAL_ROLE_SELLER), result.signingUrlForEmail(sellerEmail), fallbackUrl);
        String buyerUrl = firstNonBlank(result.signingUrlForRole(DOCUSEAL_ROLE_BUYER), result.signingUrlForEmail(buyerEmail), fallbackUrl);
        contract.setSellerSigningUrl(sellerUrl);
        contract.setBuyerSigningUrl(buyerUrl);
        contract.setSellerStatus(STATUS_PENDING);
        contract.setBuyerStatus(STATUS_PENDING);
        contract.setStatus("PENDING_BOTH");
        contract.setUpdateAt(new Date());
        contract = contractRepository.save(contract);

        return toDTO(contract);
    }

    @Transactional(readOnly = true)
    public ContractDTO getByOrderId(Integer orderId) {
        return contractRepository.findByOrder_OrderID(orderId)
                .map(this::toDTO)
                .orElse(null);
    }

    @Transactional
    public void handleWebhookUpdate(String envelopeId,
                                    String status,
                                    String signedFileUrl,
                                    Date signedAt,
                                    String participantEmail,
                                    String participantRole,
                                    String eventType) {
        Contract contract = contractRepository.findByDocusealEnvelopeID(envelopeId)
                .orElseThrow(() -> new IllegalArgumentException("Contract not found for envelope: " + envelopeId));

        boolean participantUpdated = applyParticipantUpdate(contract, participantEmail, participantRole, status, eventType, signedAt);

        if (signedFileUrl != null && !signedFileUrl.isBlank()) {
            contract.setSignedFileUrl(signedFileUrl);
        }

        if (signedAt != null && (participantUpdated || isCompletionEvent(eventType))) {
            if (participantUpdated && isFullySigned(contract)) {
                contract.setSignedAt(signedAt);
            } else if (!participantUpdated) {
                contract.setSignedAt(signedAt);
            }
        }

        if (!participantUpdated && status != null) {
            applyEnvelopeStatus(contract, status, eventType);
        }

        if (eventType != null) {
            applyEnvelopeEvent(contract, eventType);
        }

        updateOverallStatus(contract);
        contract.setUpdateAt(new Date());
        contractRepository.save(contract);
    }

    /**
     * Fallback for form.* webhooks that miss submission_id: locate the most recent Draft contract by participant email.
     */
    @Transactional
    public void handleWebhookFallbackByEmail(String email, String status, String signedFileUrl, Date signedAt) {
        findContractByParticipantEmail(email).ifPresent(contract -> {
            boolean updated = applyParticipantUpdate(contract, email, null, status, null, signedAt);
            if (signedFileUrl != null && !signedFileUrl.isBlank()) {
                contract.setSignedFileUrl(signedFileUrl);
            }
            if (signedAt != null && (updated && isFullySigned(contract))) {
                contract.setSignedAt(signedAt);
            }
            if (!updated && status != null) {
                applyEnvelopeStatus(contract, status, null);
            }
            updateOverallStatus(contract);
            contract.setUpdateAt(new Date());
            contractRepository.save(contract);
        });
    }

    /**
     * Backwards-compatible overload: some callers may supply eventType as an extra string param.
     */
    @Transactional
    public void handleWebhookFallbackByEmail(String email, String status, String signedFileUrl, String eventType, Date signedAt) {
        findContractByParticipantEmail(email).ifPresent(contract -> {
            boolean updated = applyParticipantUpdate(contract, email, null, status, eventType, signedAt);
            if (signedFileUrl != null && !signedFileUrl.isBlank()) {
                contract.setSignedFileUrl(signedFileUrl);
            }
            if (signedAt != null && updated && isFullySigned(contract)) {
                contract.setSignedAt(signedAt);
            }
            if (!updated && status != null) {
                applyEnvelopeStatus(contract, status, eventType);
            }
            if (eventType != null) {
                applyEnvelopeEvent(contract, eventType);
            }
            updateOverallStatus(contract);
            contract.setUpdateAt(new Date());
            contractRepository.save(contract);
        });
    }

    /**
     * Fallback by email but also set envelopeId/submissionId when provided (to link future events by id).
     */
    @Transactional
    public void handleWebhookFallbackByEmailWithId(String email, String envelopeId, String status, String signedFileUrl, Date signedAt) {
        findContractByParticipantEmail(email).ifPresent(contract -> {
            if (contract.getDocusealEnvelopeID() == null && envelopeId != null && !envelopeId.isBlank()) {
                contract.setDocusealEnvelopeID(envelopeId);
            }
            boolean updated = applyParticipantUpdate(contract, email, null, status, null, signedAt);
            if (signedFileUrl != null && !signedFileUrl.isBlank()) {
                contract.setSignedFileUrl(signedFileUrl);
            }
            if (signedAt != null && updated && isFullySigned(contract)) {
                contract.setSignedAt(signedAt);
            }
            if (!updated && status != null) {
                applyEnvelopeStatus(contract, status, null);
            }
            updateOverallStatus(contract);
            contract.setUpdateAt(new Date());
            contractRepository.save(contract);
        });
    }

    private ContractDTO toDTO(Contract c) {
        ContractDTO dto = new ContractDTO();
        dto.setContractId(c.getContractID());
        dto.setOrderId(c.getOrder() != null ? c.getOrder().getOrderID() : null);
        dto.setTemplateId(c.getDocusealTemplateID());
        dto.setEnvelopeId(c.getDocusealEnvelopeID());
        dto.setStatus(c.getStatus());
        dto.setSignedFileUrl(c.getSignedFileUrl());
        dto.setSignedAt(c.getSignedAt());
    dto.setUpdateAt(c.getUpdateAt());
        dto.setSellerEmail(c.getSellerEmail());
        dto.setSellerName(c.getSellerName());
        dto.setSellerStatus(c.getSellerStatus());
        dto.setSellerSigningUrl(c.getSellerSigningUrl());
        dto.setSellerSignedAt(c.getSellerSignedAt());
        dto.setBuyerEmail(c.getBuyerEmail());
        dto.setBuyerName(c.getBuyerName());
        dto.setBuyerStatus(c.getBuyerStatus());
        dto.setBuyerSigningUrl(c.getBuyerSigningUrl());
        dto.setBuyerSignedAt(c.getBuyerSignedAt());
        return dto;
    }
}
