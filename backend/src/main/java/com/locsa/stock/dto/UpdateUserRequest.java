package com.locsa.stock.dto;

import com.locsa.stock.entity.City;
import com.locsa.stock.entity.Role;
import lombok.Data;

@Data
public class UpdateUserRequest {
    private String username;   // optional
    private Role role;         // optional
    private City city;         // optional
}
