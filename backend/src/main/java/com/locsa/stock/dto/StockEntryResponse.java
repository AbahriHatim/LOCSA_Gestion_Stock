package com.locsa.stock.dto;

import com.locsa.stock.entity.City;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StockEntryResponse {
    private Long id;
    private String productName;
    private LocalDate dateEntry;
    private Long quantity;
    private String comment;
    private String createdBy;
    private City city;
    private String productCategory;
    // Cat B
    private String station;
    // Cat A
    private String code;
    private String serialNumber;
    private String brand;
    private String power;
    private String reference;
    private LocalDateTime createdAt;
}
