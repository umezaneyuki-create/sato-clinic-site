package jp.satoclinic.backend.inquiry;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record InquiryRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Email @Size(max = 254) String email,
        @Size(max = 32) String phone,
        @NotBlank @Pattern(regexp = "診療について|予防接種|健康診断|予約について|その他") String category,
        @NotBlank @Size(max = 200) String subject,
        @NotBlank @Size(max = 10000) String content,
        boolean consent,
        @Size(max = 200) String website
) {}
