package com.railopt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * RailOpt AI — Spring Boot Backend Entry Point
 *
 * Future modules to be added incrementally:
 *   - Asset management
 *   - Corridor & Train scheduling
 *   - MaintenanceBlock planning
 *   - Conflict detection engine
 *   - Python AI / OR-Tools integration
 */
@SpringBootApplication
public class RailOptApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(RailOptApplication.class, args);
    }

    private static void loadDotEnv() {
        java.io.File[] potentialFiles = new java.io.File[] {
            new java.io.File(".env"),
            new java.io.File("backend/.env")
        };
        for (java.io.File file : potentialFiles) {
            if (file.exists() && file.isFile()) {
                try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.FileReader(file))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) continue;
                        int eq = line.indexOf('=');
                        if (eq > 0) {
                            String key = line.substring(0, eq).trim();
                            String val = line.substring(eq + 1).trim();
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, val);
                            }
                        }
                    }
                } catch (Exception ignored) {
                }
                break;
            }
        }
    }
}
