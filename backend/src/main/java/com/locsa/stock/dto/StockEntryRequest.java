package com.locsa.stock.dto;

import com.locsa.stock.entity.City;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class StockEntryRequest {

    @NotNull(message = "Product name is required")
    private String productName;

    @NotNull(message = "Entry date is required")
    private LocalDate dateEntry;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Long quantity;

    private String comment;

    private City city; // optional — backend overrides with user's city for non-admin

    private com.locsa.stock.entity.Category category; // used when auto-creating product

    // Cat B: source station
    private String station;

    // Cat A: electric generator details
    private String code;
    private String serialNumber;
    private String brand;
    private String power;
}
