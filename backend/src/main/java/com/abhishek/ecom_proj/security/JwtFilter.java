package com.abhishek.ecom_proj.security;

import com.abhishek.ecom_proj.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {

        private final JwtService jwtService;

        public JwtFilter(JwtService jwtService) {
                this.jwtService = jwtService;
        }

        @Override
        protected void doFilterInternal(
                        HttpServletRequest request,
                        HttpServletResponse response,
                        FilterChain filterChain)
                        throws ServletException, IOException {

                String requestUri = request.getRequestURI();

                System.out.println(
                                "========================================");

                System.out.println(
                                "JWT FILTER: "
                                                + request.getMethod()
                                                + " "
                                                + requestUri);

                // =====================================================
                // OPTIONS
                // =====================================================

                if ("OPTIONS".equalsIgnoreCase(
                                request.getMethod())) {

                        System.out.println(
                                        "OPTIONS REQUEST");

                        filterChain.doFilter(
                                        request,
                                        response);

                        return;
                }

                // =====================================================
                // GET AUTHORIZATION HEADER
                // =====================================================

                String authHeader = request.getHeader("Authorization");

                System.out.println(
                                "AUTHORIZATION HEADER PRESENT: "
                                                + (authHeader != null));

                // =====================================================
                // NO TOKEN
                // =====================================================

                if (authHeader == null ||
                                authHeader.trim().isEmpty()) {

                        System.out.println(
                                        "NO AUTHORIZATION HEADER");

                        filterChain.doFilter(
                                        request,
                                        response);

                        return;
                }

                // =====================================================
                // BEARER CHECK
                // =====================================================

                if (!authHeader.startsWith("Bearer ")) {

                        System.out.println(
                                        "INVALID AUTHORIZATION HEADER");

                        filterChain.doFilter(
                                        request,
                                        response);

                        return;
                }

                // =====================================================
                // EXTRACT TOKEN
                // =====================================================

                String token = authHeader.substring(7).trim();

                if (token.isEmpty()) {

                        System.out.println(
                                        "EMPTY JWT TOKEN");

                        filterChain.doFilter(
                                        request,
                                        response);

                        return;
                }

                System.out.println(
                                "JWT TOKEN RECEIVED");

                // =====================================================
                // VALIDATE JWT
                // =====================================================

                try {

                        if (!jwtService.isTokenValid(token)) {

                                System.out.println(
                                                "JWT TOKEN IS INVALID OR EXPIRED");

                                SecurityContextHolder.clearContext();

                                filterChain.doFilter(
                                                request,
                                                response);

                                return;
                        }

                        // =================================================
                        // EXTRACT EMAIL
                        // =================================================

                        String email = jwtService.extractUsername(token);

                        System.out.println(
                                        "JWT EMAIL: "
                                                        + email);

                        if (email == null ||
                                        email.trim().isEmpty()) {

                                System.out.println(
                                                "JWT EMAIL IS MISSING");

                                SecurityContextHolder.clearContext();

                                filterChain.doFilter(
                                                request,
                                                response);

                                return;
                        }

                        // =================================================
                        // ONLY CREATE AUTHENTICATION IF NOT ALREADY SET
                        // =================================================

                        if (SecurityContextHolder
                                        .getContext()
                                        .getAuthentication() == null) {

                                // =============================================
                                // EXTRACT ROLE
                                // =============================================

                                String role = jwtService.extractRole(token);

                                System.out.println("========================================");
                                System.out.println("JWT DEBUG");
                                System.out.println("EMAIL: " + email);
                                System.out.println("ROLE FROM JWT: [" + role + "]");

                                if (role == null || role.trim().isEmpty()) {
                                        System.out.println("JWT ROLE IS MISSING");
                                        SecurityContextHolder.clearContext();
                                        filterChain.doFilter(request, response);
                                        return;
                                }

                                role = role.trim().toUpperCase();

                                if (role.startsWith("ROLE_")) {
                                        role = role.substring(5);
                                }

                                String authorityName = "ROLE_" + role;

                                System.out.println("FINAL AUTHORITY: [" + authorityName + "]");

                                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                                email,
                                                null,
                                                Collections.singletonList(
                                                                new SimpleGrantedAuthority(authorityName)));

                                SecurityContextHolder.getContext()
                                                .setAuthentication(authentication);

                                System.out.println("AUTHENTICATION: "
                                                + SecurityContextHolder.getContext().getAuthentication());

                                System.out.println("AUTHORITIES: "
                                                + authentication.getAuthorities());

                                System.out.println("========================================");
                        }

                } catch (Exception e) {

                        SecurityContextHolder.clearContext();

                        System.out.println(
                                        "========================================");

                        System.out.println(
                                        "JWT VALIDATION FAILED");

                        System.out.println(
                                        "ERROR TYPE: "
                                                        + e.getClass().getSimpleName());

                        System.out.println(
                                        "ERROR MESSAGE: "
                                                        + e.getMessage());

                        System.out.println(
                                        "========================================");
                }

                // =====================================================
                // CONTINUE
                // =====================================================

                filterChain.doFilter(
                                request,
                                response);
        }
}