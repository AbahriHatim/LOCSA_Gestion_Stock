package com.locsa.stock.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String entityType;

    private Long entityId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditAction action;

    @Column(nullable = false)
    private String performedBy;

    @Column(updatable = false)
    private LocalDateTime performedAt;

    @Column(length = 2000)
    private String details;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private City city;

    @PrePersist
    protected void onCreate() {
        this.performedAt = LocalDateTime.now();
    }
}
