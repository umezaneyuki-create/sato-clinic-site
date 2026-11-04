package jp.satoclinic.backend.inquiry;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ReplyRequest(
        @Size(max = 36) String id,
        @NotBlank @Size(max = 255) String subject,
        @NotBlank @Size(max = 10000) String content,
        @NotBlank @Pattern(regexp = "下書き|送信") String action
) {}
