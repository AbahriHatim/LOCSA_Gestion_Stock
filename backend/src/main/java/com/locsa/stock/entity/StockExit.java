package com.locsa.stock.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "stock_exits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockExit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private LocalDate dateExit;

    @Column(nullable = false)
    private Long quantity;

    @Column(nullable = false)
    private String beneficiary;

    @Column(length = 500)
    private String comment;

    @Column(nullable = false)
    private String createdBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(20) default 'TANGER'")
    @Builder.Default
    private City city = City.TANGER;

    // Cat B: destination site
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id")
    private Site site;

    // Cat A: electric generator details
    @Column(length = 100)
    private String code;

    @Column(length = 100)
    private String serialNumber;

    // Cat B: gasoil type — GE (groupe électrogène) or VEHICULE
    @Column(length = 20)
    private String gasoilType;

    // Cat B - VEHICULE: vehicle registration plate
    @Column(length = 50)
    private String immatriculation;

    @Column(unique = true)
    private String reference;
}
