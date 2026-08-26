package com.abhishek.ecom_proj.service;

import com.abhishek.ecom_proj.model.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    // =========================================================
    // JWT SECRET
    // MUST BE THE SAME SECRET USED FOR VALIDATION
    // =========================================================

    private static final String SECRET_KEY =
            "mySuperSecretKeyForEcommerceProject123456789";

    // 1 hour
    private static final long EXPIRATION_TIME =
            1000L * 60 * 60;

    // =========================================================
    // SIGNING KEY
    // =========================================================

    private SecretKey getSigningKey() {

        return Keys.hmacShaKeyFor(
                SECRET_KEY.getBytes(StandardCharsets.UTF_8)
        );
    }

    // =========================================================
    // GENERATE TOKEN
    // =========================================================

    public String generateToken(User user) {

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + EXPIRATION_TIME
                        )
                )
                .signWith(getSigningKey())
                .compact();
    }

    // =========================================================
    // EXTRACT USERNAME / EMAIL
    // =========================================================

    public String extractUsername(String token) {

        return extractAllClaims(token)
                .getSubject();
    }

    // =========================================================
    // EXTRACT ROLE
    // =========================================================

    public String extractRole(String token) {

        return extractAllClaims(token)
                .get("role", String.class);
    }

    // =========================================================
    // VALIDATE TOKEN
    // =========================================================

    public boolean isTokenValid(String token) {

        try {

            Claims claims = extractAllClaims(token);

            return claims.getSubject() != null
                    && claims.getExpiration() != null
                    && claims.getExpiration()
                            .after(new Date());

        } catch (Exception e) {

            System.out.println(
                    "JWT validation error: "
                            + e.getMessage()
            );

            return false;
        }
    }

    // =========================================================
    // EXTRACT ALL CLAIMS
    // =========================================================

    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}