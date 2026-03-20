package com.locsa.stock.service;

import com.locsa.stock.entity.AuditAction;
import com.locsa.stock.entity.AuditLog;
import com.locsa.stock.entity.City;
import com.locsa.stock.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void log(String entityType, Long entityId, String action, String performedBy, String details, City city) {
        AuditLog auditLog = AuditLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .action(AuditAction.valueOf(action))
                .performedBy(performedBy)
                .details(details)
                .city(city)
                .build();
        auditLogRepository.save(auditLog);
    }
}
