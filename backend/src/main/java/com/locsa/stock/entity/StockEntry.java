package com.locsa.stock.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private LocalDate dateEntry;

    @Column(nullable = false)
    private Long quantity;

    @Column(length = 500)
    private String comment;

    @Column(nullable = false)
    private String createdBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(20) default 'TANGER'")
    @Builder.Default
    private City city = City.TANGER;

    // Cat B: source station
    @Column(length = 200)
    private String station;

    // Cat A: electric generator details
    @Column(length = 100)
    private String code;

    @Column(length = 100)
    private String serialNumber;

    @Column(length = 100)
    private String brand;

    @Column(length = 100)
    private String power;

    @Column(unique = true)
    private String reference;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
