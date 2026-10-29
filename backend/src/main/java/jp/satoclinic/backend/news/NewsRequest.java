package jp.satoclinic.backend.news;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record NewsRequest(
        @NotBlank @Size(max = 255) String title,
        @NotBlank String body,
        @NotBlank @Size(max = 100) String category,
        @NotNull LocalDate date,
        @NotBlank @Pattern(regexp = "公開|非公開") String status,
        @Size(max = 2048) String relatedUrl,
        @Size(max = 512) String thumbnailPath
) {}
