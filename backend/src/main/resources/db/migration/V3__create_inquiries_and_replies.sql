CREATE TABLE inquiries (
    id CHAR(36) NOT NULL,
    received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(254) NULL,
    phone VARCHAR(32) NULL,
    category VARCHAR(40) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    status ENUM('未対応', '対応中', '対応済み') NOT NULL DEFAULT '未対応',
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_inquiries_received_at (received_at DESC),
    INDEX idx_inquiries_status_deleted (status, deleted_at),
    INDEX idx_inquiries_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE inquiry_replies (
    id CHAR(36) NOT NULL,
    inquiry_id CHAR(36) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status ENUM('下書き', '送信済み') NOT NULL DEFAULT '下書き',
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_inquiry_replies_inquiry (inquiry_id, created_at DESC),
    INDEX idx_inquiry_replies_status (status, sent_at DESC),
    CONSTRAINT fk_inquiry_replies_inquiry FOREIGN KEY (inquiry_id)
        REFERENCES inquiries (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
