package com.locsa.stock.dto;

import com.locsa.stock.entity.City;
import jakarta.validation.constraints.Min;
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

    private String beneficiary;

    private String comment;

    private City city; // optional — backend overrides with user's city for non-admin

    // Cat B: destination site (GE only)
    private Long siteId;

    // Cat B: gasoil type — "GE" or "VEHICULE"
    private String gasoilType;

    // Cat B - VEHICULE: vehicle registration plate
    private String immatriculation;

    // Cat A: electric generator details
    private String code;
    private String serialNumber;
}
