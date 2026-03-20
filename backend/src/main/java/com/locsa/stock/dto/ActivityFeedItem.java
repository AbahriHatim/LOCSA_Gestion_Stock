package com.locsa.stock.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ActivityFeedItem {
    private String type; // ENTRY or EXIT
    private String productName;
    private Long quantity;
    private String city;
    private String performedBy;
    private LocalDate date;
    private String reference;
}
