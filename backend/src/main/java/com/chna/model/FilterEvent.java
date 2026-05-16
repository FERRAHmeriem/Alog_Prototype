package com.chna.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FilterEvent {
    private int filterId;
    private String status;
    private Object payload;
    private String timestamp;
}
