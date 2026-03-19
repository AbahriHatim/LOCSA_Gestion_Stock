package com.locsa.stock.dto;

import com.locsa.stock.entity.City;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class StockExitRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Exit date is required")
    private LocalDate dateExit;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Long quantity;

    @NotBlank(message = "Beneficiary is required")
    private String beneficiary;

    private String comment;

    private City city; // optional — backend overrides with user's city for non-admin
}
