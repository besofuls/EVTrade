package com.evtrading.swp391.controller;

import com.evtrading.swp391.dto.ContractCreateDTO;
import com.evtrading.swp391.dto.ContractDTO;
import com.evtrading.swp391.service.ContractService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contracts")
public class ContractController {

    private final ContractService contractService;

    public ContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    @PostMapping("/send")
    public ResponseEntity<ContractDTO> createAndSend(@RequestBody ContractCreateDTO req,
                                                     Authentication authentication) {
        String currentUsername = authentication != null ? authentication.getName() : null;
        ContractDTO dto = contractService.createDraftAndSend(req, currentUsername);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ContractDTO> getByOrder(@PathVariable Integer orderId) {
        ContractDTO dto = contractService.getByOrderId(orderId);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }
}
