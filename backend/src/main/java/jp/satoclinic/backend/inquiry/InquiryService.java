package jp.satoclinic.backend.inquiry;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InquiryService {
    private final InquiryMapper mapper;
    private final InquiryMailService mailService;

    public InquiryService(InquiryMapper mapper, InquiryMailService mailService) {
        this.mapper = mapper;
        this.mailService = mailService;
    }

    public List<InquiryItem> findAll(String view) {
        return mapper.findAll(List.of("all", "sent", "deleted").contains(view) ? view : "all");
    }

    public List<InquiryReply> findSentReplies() { return mapper.findSentReplies(); }
    public List<InquiryReply> findDraftReplies() { return mapper.findDraftReplies(); }

    public InquiryItem findById(String id) {
        InquiryItem item = mapper.findById(id);
        if (item != null) item.setReplies(mapper.findReplies(id));
        return item;
    }

    public InquiryItem receive(InquiryRequest request) {
        InquiryItem item = new InquiryItem();
        item.setId(UUID.randomUUID().toString());
        item.setName(request.name().trim());
        item.setEmail(request.email().trim());
        item.setPhone(blankToNull(request.phone()));
        item.setCategory(request.category());
        item.setSubject(request.subject().trim());
        item.setContent(request.content().trim());
        mapper.insert(item);
        return mapper.findById(item.getId());
    }

    public void sendReceipt(InquiryItem inquiry) { mailService.sendReceipt(inquiry); }
    public void sendClinicNotification(InquiryItem inquiry) { mailService.sendClinicNotification(inquiry); }

    public boolean updateStatus(String id, String status) {
        if (status == null || !List.of("未対応", "対応中", "対応済み").contains(status)) return false;
        return mapper.updateStatus(id, status) > 0;
    }

    public boolean softDelete(String id) { return mapper.softDelete(id) > 0; }
    public boolean restore(String id) { return mapper.restore(id) > 0; }
    public boolean permanentlyDelete(String id) { return mapper.permanentlyDelete(id) > 0; }

    @Transactional
    public InquiryReply saveReply(String inquiryId, ReplyRequest request) {
        InquiryItem inquiry = mapper.findById(inquiryId);
        if (inquiry == null || inquiry.getDeletedAt() != null) return null;
        if ("送信".equals(request.action())) {
            if (inquiry.getEmail() == null || inquiry.getEmail().isBlank()) {
                throw new IllegalStateException("返信先のメールアドレスが登録されていません。");
            }
            mailService.sendReply(inquiry, request.subject().trim(), request.content().trim());
        }
        InquiryReply reply = request.id() == null || request.id().isBlank()
                ? new InquiryReply() : mapper.findReply(request.id(), inquiryId);
        if (reply == null) return null;
        if (reply.getId() == null) {
            reply.setId(UUID.randomUUID().toString());
            reply.setInquiryId(inquiryId);
        }
        reply.setSubject(request.subject().trim());
        reply.setContent(request.content().trim());
        reply.setStatus("送信".equals(request.action()) ? "送信済み" : "下書き");
        reply.setSentAt("送信".equals(request.action()) ? LocalDateTime.now() : null);
        if (mapper.findReply(reply.getId(), inquiryId) == null) mapper.insertReply(reply);
        else mapper.updateReply(reply);
        if ("送信".equals(request.action()) && "未対応".equals(inquiry.getStatus())) {
            mapper.updateStatus(inquiryId, "対応中");
        }
        return mapper.findReply(reply.getId(), inquiryId);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
