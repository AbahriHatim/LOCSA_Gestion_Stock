package com.locsa.stock.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Long quantity;

    @Column(columnDefinition = "bigint default 0")
    @Builder.Default
    private Long minQuantity = 0L;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "varchar(5) default 'C'")
    @Builder.Default
    private Category category = Category.C;
}
