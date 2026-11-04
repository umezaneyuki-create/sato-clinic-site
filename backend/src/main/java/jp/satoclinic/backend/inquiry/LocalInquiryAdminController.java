package jp.satoclinic.backend.inquiry;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/inquiries")
public class LocalInquiryAdminController {
    private final InquiryService service;

    public LocalInquiryAdminController(InquiryService service) { this.service = service; }

    @GetMapping
    public List<InquiryItem> list(@RequestParam(defaultValue = "all") String view) { return service.findAll(view); }

    @GetMapping("/sent-replies")
    public List<InquiryReply> sentReplies() { return service.findSentReplies(); }

    @GetMapping("/draft-replies")
    public List<InquiryReply> draftReplies() { return service.findDraftReplies(); }

    @GetMapping("/{id}")
    public ResponseEntity<InquiryItem> get(@PathVariable String id) {
        InquiryItem item = service.findById(id);
        return item == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(item);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> status(@PathVariable String id, @RequestBody Map<String, String> request) {
        boolean updated = service.updateStatus(id, request.get("status"));
        return updated ? ResponseEntity.noContent().build() : ResponseEntity.badRequest().body(Map.of("message", "対応状況を更新できませんでした。"));
    }

    @PostMapping("/{id}/replies")
    public ResponseEntity<?> reply(@PathVariable String id, @Valid @RequestBody ReplyRequest request) {
        try {
            InquiryReply saved = service.saveReply(id, request);
            return saved == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(saved);
        } catch (IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        } catch (Exception exception) {
            return ResponseEntity.status(503).body(Map.of("message", "メールを送信できませんでした。返信は未送信のままです。"));
        }
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<Void> restore(@PathVariable String id) {
        return service.restore(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDelete(@PathVariable String id) {
        return service.softDelete(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<Void> permanentlyDelete(@PathVariable String id) {
        return service.permanentlyDelete(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
