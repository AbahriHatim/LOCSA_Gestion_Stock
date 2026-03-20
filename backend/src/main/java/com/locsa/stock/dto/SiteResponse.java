package com.locsa.stock.dto;

import com.locsa.stock.entity.City;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SiteResponse {
    private Long id;
    private String name;
    private City city;
    private boolean active;
}
