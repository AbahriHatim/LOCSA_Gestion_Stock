package com.locsa.stock.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductHistoryItem {
    private String type;       // ENTRY, EXIT, INVENTORY
    private String reference;
    private LocalDate date;
    private Long quantity;
    private String city;
    private String createdBy;
    private String details;    // beneficiary / station / comment
    private Long difference;   // only for INVENTORY type
}
