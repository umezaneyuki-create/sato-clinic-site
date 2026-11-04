package jp.satoclinic.backend.inquiry;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class InquiryMailService {
    private final JavaMailSender mailSender;
    private final String from;
    private final String clinicAddress;
    private final boolean enabled;

    public InquiryMailService(JavaMailSender mailSender,
                              @Value("${clinic.inquiry.from-email}") String from,
                              @Value("${clinic.inquiry.notification-email}") String clinicAddress,
                              @Value("${clinic.inquiry.mail-enabled:false}") boolean enabled) {
        this.mailSender = mailSender;
        this.from = from;
        this.clinicAddress = clinicAddress;
        this.enabled = enabled;
    }

    public void sendReceipt(InquiryItem inquiry) {
        if (!enabled) return;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(inquiry.getEmail());
        message.setSubject("【佐藤医院】お問い合わせを受け付けました（草案）");
        message.setText("お問い合わせありがとうございます。\n"
                + "以下の内容で受け付けました。\n\n"
                + "件名：" + inquiry.getSubject() + "\n"
                + "お問い合わせ種別：" + inquiry.getCategory() + "\n\n"
                + "内容を確認のうえ、担当者よりご連絡いたします。\n"
                + "お急ぎの場合は、お電話（00-0000-0000）でお問い合わせください。\n\n"
                + "※このメール文面はポートフォリオ用草案です。実運用前に医院での確認が必要です。");
        mailSender.send(message);
    }

    public void sendClinicNotification(InquiryItem inquiry) {
        if (!enabled) return;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(clinicAddress);
        message.setSubject("【佐藤医院】新しいお問い合わせ（草案）");
        message.setText("新しいお問い合わせを受け付けました。\n\n"
                + "受付番号：" + inquiry.getId() + "\n"
                + "氏名：" + inquiry.getName() + "\n"
                + "メール：" + inquiry.getEmail() + "\n"
                + "電話番号：" + (inquiry.getPhone() == null ? "未入力" : inquiry.getPhone()) + "\n"
                + "種別：" + inquiry.getCategory() + "\n"
                + "件名：" + inquiry.getSubject() + "\n\n"
                + "本文：\n" + inquiry.getContent() + "\n\n"
                + "※この通知文面はポートフォリオ用草案です。実運用前に医院での確認が必要です。");
        mailSender.send(message);
    }

    public void sendReply(InquiryItem inquiry, String subject, String content) {
        if (!enabled) throw new IllegalStateException("メール送信が有効になっていません。");
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(inquiry.getEmail());
        message.setSubject(subject);
        message.setText(content);
        mailSender.send(message);
    }
}
