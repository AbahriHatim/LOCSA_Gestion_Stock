package com.locsa.stock.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    @NotBlank(message = "Le nouveau mot de passe est requis")
    @Size(min = 4, message = "Minimum 4 caractères")
    private String newPassword;
}
