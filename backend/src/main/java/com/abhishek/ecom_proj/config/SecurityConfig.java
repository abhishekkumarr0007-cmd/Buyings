package com.abhishek.ecom_proj.config;

import com.abhishek.ecom_proj.security.JwtFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

        private final JwtFilter jwtFilter;

        public SecurityConfig(JwtFilter jwtFilter) {
                this.jwtFilter = jwtFilter;
        }

        // =========================================================
        // PASSWORD ENCODER
        // =========================================================

        @Bean
        public PasswordEncoder passwordEncoder() {

                return new BCryptPasswordEncoder();
        }

        // =========================================================
        // CORS
        // =========================================================

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration configuration = new CorsConfiguration();

                configuration.setAllowedOrigins(
                                List.of(
                                                "http://localhost:5173",
                                                "http://localhost:3000"));

                configuration.setAllowedMethods(
                                List.of(
                                                "GET",
                                                "POST",
                                                "PUT",
                                                "DELETE",
                                                "PATCH",
                                                "OPTIONS"));

                configuration.setAllowedHeaders(
                                List.of(
                                                "Authorization",
                                                "Content-Type",
                                                "Accept",
                                                "Origin",
                                                "X-Requested-With"));

                configuration.setExposedHeaders(
                                List.of(
                                                "Authorization"));

                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration(
                                "/**",
                                configuration);

                return source;
        }

        // =========================================================
        // SECURITY
        // =========================================================

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http) throws Exception {

                http

                                // -------------------------------------------------
                                // CORS
                                // -------------------------------------------------

                                .cors(cors -> cors.configurationSource(
                                                corsConfigurationSource()))

                                // -------------------------------------------------
                                // CSRF
                                // -------------------------------------------------

                                .csrf(csrf -> csrf.disable())

                                // -------------------------------------------------
                                // SESSION
                                // -------------------------------------------------

                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))

                                // -------------------------------------------------
                                // AUTHORIZATION
                                // -------------------------------------------------

                                .authorizeHttpRequests(auth -> auth

                                                // PUBLIC AUTH
                                                .requestMatchers(
                                                                "/auth/signup",
                                                                "/auth/login",
                                                                "/auth/forgot-password",
                                                                "/auth/verify-otp",
                                                                "/auth/reset-password")
                                                .permitAll()

                                                // CHANGE PASSWORD
                                                .requestMatchers(
                                                                "/auth/change-password")
                                                .authenticated()
                                                .requestMatchers(HttpMethod.POST, "/api/contact")
                                                .authenticated()

                                                .requestMatchers("/api/contact/**")
                                                .hasRole("ADMIN")
                                                // PUBLIC PRODUCTS
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/products",
                                                                "/api/products/**",
                                                                "/api/product/**")
                                                .permitAll()

                                                // ADMIN
                                                .requestMatchers(
                                                                "/admin/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/product")
                                                .hasRole("ADMIN")

                                                .requestMatchers(
                                                                HttpMethod.PUT,
                                                                "/api/product/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers(
                                                                HttpMethod.DELETE,
                                                                "/api/product/**")
                                                .hasRole("ADMIN")

                                                // -------------------------------------------------
                                                // ORDERS
                                                // -------------------------------------------------

                                                // Admin-only order endpoints
                                                .requestMatchers("/orders/admin/**")
                                                .hasRole("ADMIN")

                                                // Admin-only return/exchange status update
                                                // Admin-only return/exchange endpoints
                                                

                                                // All other order endpoints require login only
                                                .requestMatchers("/orders/**")
                                                .authenticated()

                                                // EVERYTHING ELSE
                                                .anyRequest().authenticated())

                                // -------------------------------------------------
                                // JWT FILTER
                                // -------------------------------------------------

                                .addFilterBefore(
                                                jwtFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}