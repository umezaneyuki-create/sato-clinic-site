package jp.satoclinic.backend.inquiry;

import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inquiries")
public class PublicInquiryController {
    private static final System.Logger LOGGER = System.getLogger(PublicInquiryController.class.getName());
    private final InquiryService service;

    public PublicInquiryController(InquiryService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<?> submit(@Valid @RequestBody InquiryRequest request) {
        if (!request.consent()) return ResponseEntity.badRequest().body(Map.of("message", "個人情報の取扱いへの同意が必要です。"));
        if (request.website() != null && !request.website().isBlank()) return ResponseEntity.accepted().body(Map.of("accepted", true));
        try {
            InquiryItem item = service.receive(request);
            boolean receiptSent = true;
            boolean clinicNoticeSent = true;
            try { service.sendReceipt(item); } catch (Exception exception) {
                receiptSent = false;
                LOGGER.log(System.Logger.Level.WARNING, "Inquiry receipt email could not be delivered.");
            }
            try { service.sendClinicNotification(item); } catch (Exception exception) {
                clinicNoticeSent = false;
                LOGGER.log(System.Logger.Level.WARNING, "Clinic inquiry notification email could not be delivered.");
            }
            return ResponseEntity.ok(Map.of("accepted", true, "id", item.getId(),
                    "receiptSent", receiptSent, "clinicNoticeSent", clinicNoticeSent));
        } catch (Exception exception) {
            return ResponseEntity.status(503).body(Map.of("message", "お問い合わせを保存できませんでした。時間をおいて再度お試しください。"));
        }
    }
}
