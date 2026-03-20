package com.locsa.stock.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductCityStockResponse {
    private String productName;
    private Long stockTanger;
    private Long stockMeknes;
    private Long stockCasablanca;
    private Long totalStock;
}
