package com.locsa.stock.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuditLogResponse {
    private Long id;
    private String entityType;
    private Long entityId;
    private String action;
    private String performedBy;
    private LocalDateTime performedAt;
    private String details;
    private String city;
}
