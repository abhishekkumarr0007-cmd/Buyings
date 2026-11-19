
package com.abhishek.ecom_proj.config;

import javax.sql.DataSource;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

@Configuration
public class DatabaseConfig {

    @Bean
    public DataSource dataSource() {

        String databaseUrl = System.getenv("DATABASE_URL");
        String username = System.getenv("DATABASE_USERNAME");
        String password = System.getenv("DATABASE_PASSWORD");

        HikariConfig config = new HikariConfig();

        // Local development fallback
        if (databaseUrl == null || databaseUrl.isBlank()) {
            config.setJdbcUrl("jdbc:postgresql://localhost:5432/ecom");
            config.setUsername(
                username != null ? username : "postgres"
            );
            config.setPassword(
                password != null ? password : ""
            );
        } else {

            // Support both PostgreSQL and JDBC URL formats
            if (databaseUrl.startsWith("postgresql://")) {
                databaseUrl = databaseUrl.replaceFirst(
                    "postgresql://", "jdbc:postgresql://"
                );
            }

            config.setJdbcUrl(databaseUrl);
            config.setUsername(username);
            config.setPassword(password);
        }

        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setConnectionTimeout(30000);

        return new HikariDataSource(config);
    }
}
