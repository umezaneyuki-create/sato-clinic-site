CREATE TABLE news (
    id CHAR(36) NOT NULL,
    status ENUM('公開', '非公開') NOT NULL DEFAULT '非公開',
    published_at DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    related_url VARCHAR(2048) NULL,
    thumbnail_path VARCHAR(512) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_news_status_date (status, published_at DESC),
    INDEX idx_news_updated_at (updated_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
