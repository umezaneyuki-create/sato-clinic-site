package jp.satoclinic.backend.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminAuthController {
    private final String username;
    private final String password;

    public AdminAuthController(@Value("${clinic.admin.username}") String username,
                               @Value("${clinic.admin.password}") String password) {
        this.username = username;
        this.password = password;
    }

    @GetMapping("/session")
    public Map<String, Boolean> session(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return Map.of("authenticated", session != null && Boolean.TRUE.equals(session.getAttribute("adminAuthenticated")));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest credentials, HttpServletRequest request) {
        if (credentials == null || !username.equals(credentials.username()) || !password.equals(credentials.password())) {
            return ResponseEntity.status(401).body(Map.of("message", "IDまたはパスワードを確認してください。"));
        }
        HttpSession session = request.getSession(true);
        request.changeSessionId();
        session.setAttribute("adminAuthenticated", true);
        return ResponseEntity.ok(Map.of("authenticated", true));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        return ResponseEntity.noContent().build();
    }

    public record LoginRequest(String username, String password) {}
}
