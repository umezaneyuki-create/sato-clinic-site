package jp.satoclinic.backend.inquiry;

import java.time.LocalDateTime;
import java.util.List;

public class InquiryItem {
    private String id;
    private LocalDateTime receivedAt;
    private String name;
    private String email;
    private String phone;
    private String category;
    private String subject;
    private String content;
    private String status;
    private LocalDateTime deletedAt;
    private Boolean replied;
    private List<InquiryReply> replies;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public LocalDateTime getReceivedAt() { return receivedAt; }
    public void setReceivedAt(LocalDateTime receivedAt) { this.receivedAt = receivedAt; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }
    public Boolean getReplied() { return replied; }
    public void setReplied(Boolean replied) { this.replied = replied; }
    public List<InquiryReply> getReplies() { return replies; }
    public void setReplies(List<InquiryReply> replies) { this.replies = replies; }
}
