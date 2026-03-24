package com.locsa.stock.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String role;
    private String city; // null for ADMIN
    private boolean active;
    private String avatarUrl; // e.g. "/api/users/3/avatar" or null
}
