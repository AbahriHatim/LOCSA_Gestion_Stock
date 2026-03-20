package com.locsa.stock.dto;

import com.locsa.stock.entity.City;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SiteRequest {

    @NotBlank(message = "Le nom du site est requis")
    private String name;

    @NotNull(message = "La ville est requise")
    private City city;

    private boolean active = true;
}
