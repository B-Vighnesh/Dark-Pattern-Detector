package com.example.demo.security;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import java.util.Collections;

public class GoogleTokenVerifier {

    // Use the *client ID* assigned to your web application in Google Cloud Console
    private static final String CLIENT_ID = "824307065796-gqvk08dm58i01pmmrbrens2ke0v927fj.apps.googleusercontent.com";

    private static final GoogleIdTokenVerifier verifier =
            new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            )
                    .setAudience(Collections.singletonList(CLIENT_ID))
                    .build();

    /**
     * Verifies the given ID token string.
     * Returns the user's email if valid and email is verified; otherwise null.
     */
    public static String verifyTokenAndGetEmail(String idTokenString) {
        if (idTokenString == null || idTokenString.isBlank()) {
            return null;
        }
        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                return null;
            }
            GoogleIdToken.Payload payload = idToken.getPayload();
            Boolean emailVerified = payload.getEmailVerified();
            if (Boolean.TRUE.equals(emailVerified)) {
                return payload.getEmail();
            }
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
