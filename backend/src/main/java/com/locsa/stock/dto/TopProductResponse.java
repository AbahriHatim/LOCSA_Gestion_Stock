package com.locsa.stock.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopProductResponse {
    private String productName;
    private long totalEntries;
    private long totalExits;
    private long totalMovement;
}
