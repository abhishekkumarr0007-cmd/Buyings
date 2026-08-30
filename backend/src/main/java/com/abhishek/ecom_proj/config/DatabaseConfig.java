package com.abhishek.ecom_proj.config;

import javax.sql.DataSource;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

@Configuration
public class DatabaseConfig {

```
@Bean
public DataSource dataSource() {

    String databaseUrl = System.getenv("DATABASE_URL");

    // Local development
    if (databaseUrl == null || databaseUrl.isBlank()) {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:postgresql://localhost:5432/ecom");
        config.setUsername(
                System.getenv().getOrDefault("DATABASE_USERNAME", "postgres")
        );
        config.setPassword(
                System.getenv().getOrDefault("DATABASE_PASSWORD", "Abhi1234raj")
        );
        return new HikariDataSource(config);
    }

    // Render gives: postgresql://username:password@host/database
    if (databaseUrl.startsWith("postgresql://")) {
        databaseUrl = databaseUrl.substring("postgresql://".length());
    }

    int atIndex = databaseUrl.indexOf('@');
    int slashIndex = databaseUrl.indexOf('/', atIndex);

    String userInfo = databaseUrl.substring(0, atIndex);
    String host = databaseUrl.substring(atIndex + 1, slashIndex);
    String database = databaseUrl.substring(slashIndex + 1);

    int colonIndex = userInfo.indexOf(':');

    String username = userInfo.substring(0, colonIndex);
    String password = userInfo.substring(colonIndex + 1);

    HikariConfig config = new HikariConfig();

    config.setJdbcUrl("jdbc:postgresql://" + host + "/" + database);
    config.setUsername(username);
    config.setPassword(password);

    return new HikariDataSource(config);
}
```

}
