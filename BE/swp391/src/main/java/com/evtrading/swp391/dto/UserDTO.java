package com.evtrading.swp391.dto;

import lombok.Data;
import java.util.Date;

@Data
public class UserDTO {
    private Integer id;
    private String username;
    private String email;
    private String role;
    private String status;
    private Date createdAt;
}
