package com.example.demo.controller;

import com.example.demo.model.Message;
import com.example.demo.security.GoogleTokenVerifier;
import com.example.demo.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feedback")
@CrossOrigin(origins = "http://localhost:5173")
public class FeedbackController {
    @Autowired
    FeedbackService feedbackService;
    @GetMapping("/form")
    public String feedbackForm(@AuthenticationPrincipal OAuth2User user) {
        String email = user.getAttribute("email");
        // now you have verified Google email
        return "Welcome " + email + ", please submit your feedback.";
    }
    @PostMapping("/add")
    public ResponseEntity<?> addFeedback(
            @RequestBody Message message,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid Authorization header");
        }

        String idToken = authorizationHeader.substring(7).trim();
        String verifiedEmail = GoogleTokenVerifier.verifyTokenAndGetEmail(idToken);
        if (verifiedEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid or expired Google ID token");
        }

        // Overwrite the mail field with verified email
        message.setMail(verifiedEmail);
        Message savedMessage = feedbackService.add(message);

        return ResponseEntity.ok(savedMessage);
    }


    @GetMapping("/admin/get")
    public ResponseEntity<List<Message>> getFeedbacks()
    {
        return new ResponseEntity<>(feedbackService.getAll(),HttpStatus.OK);
    }
}
