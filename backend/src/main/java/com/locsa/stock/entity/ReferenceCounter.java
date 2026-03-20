package com.locsa.stock.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reference_counters")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferenceCounter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String prefix;

    private int year;

    @Builder.Default
    private long lastSequence = 0;
}
