package com.locsa.stock.controller;

import com.locsa.stock.dto.AuditLogResponse;
import com.locsa.stock.dto.PageResponse;
import com.locsa.stock.entity.AuditLog;
import com.locsa.stock.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<PageResponse<AuditLogResponse>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String entityType) {

        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> auditPage;

        if (entityType != null && !entityType.isBlank()) {
            auditPage = auditLogRepository.findByEntityTypeOrderByPerformedAtDesc(entityType, pageable);
        } else {
            auditPage = auditLogRepository.findAllByOrderByPerformedAtDesc(pageable);
        }

        List<AuditLogResponse> content = auditPage.getContent()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        PageResponse<AuditLogResponse> result = PageResponse.of(auditPage, content);
        return ResponseEntity.ok(result);
    }

    private AuditLogResponse toResponse(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getEntityType(),
                log.getEntityId(),
                log.getAction() != null ? log.getAction().name() : null,
                log.getPerformedBy(),
                log.getPerformedAt(),
                log.getDetails(),
                log.getCity() != null ? log.getCity().name() : null
        );
    }
}
