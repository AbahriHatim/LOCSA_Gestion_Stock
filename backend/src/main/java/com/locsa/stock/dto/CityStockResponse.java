package com.locsa.stock.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CityStockResponse {
    private String city;
    private Long totalEntries;
    private Long totalExits;
    private Long currentStock;
}
