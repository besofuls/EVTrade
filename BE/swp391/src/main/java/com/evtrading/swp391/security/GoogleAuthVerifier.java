package com.evtrading.swp391.security;

import org.springframework.stereotype.Service;
import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import jakarta.annotation.PostConstruct;

import java.util.Collections;

@Service
public class GoogleAuthVerifier {
    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String clientId;

      @Autowired
  private org.springframework.core.env.Environment env;
    @PostConstruct
    public void debug() {
        System.out.println(">>> GOOGLE CLIENT ID (@Value) = [" + clientId + "]");
    System.out.println(">>> GOOGLE CLIENT ID (env)    = [" + env.getProperty("security.oauth2.google.client-id") + "]");
    }

    public GoogleIdToken.Payload verify(String idToken) {
        try {
            var verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(clientId))
                    .build();

            GoogleIdToken token = verifier.verify(idToken);
            return token != null ? token.getPayload() : null;
        } catch (Exception e) {
            return (Payload) ResponseEntity.status(HttpStatus.SC_UNAUTHORIZED);
        }
    }
}