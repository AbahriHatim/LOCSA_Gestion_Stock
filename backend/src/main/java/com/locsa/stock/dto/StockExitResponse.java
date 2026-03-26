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
public class StockExitResponse {
    private Long id;
    private String productName;
    private LocalDate dateExit;
    private Long quantity;
    private String beneficiary;
    private String comment;
    private String createdBy;
    private City city;
    private String productCategory;
    // Cat B
    private String siteName;
    private String gasoilType;
    private String immatriculation;
    // Cat A
    private String code;
    private String serialNumber;
    private String reference;
    private LocalDateTime createdAt;
}
