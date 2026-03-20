package com.locsa.stock.dto;

import com.locsa.stock.entity.Category;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity must be non-negative")
    private Long quantity;

    private Category category = Category.C;

    @Min(value = 0, message = "Le seuil minimum doit être >= 0")
    private Long minQuantity = 0L;
}
