package com.railopt.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

/**
 * Master entity for Indian Railways Zones (e.g. WCR, NR, WR, NCR, CR).
 */
@Document(collection = "zones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Zone {

    @Id
    private String id;

    @Indexed(unique = true)
    private String code; // WCR, NR, NCR, WR, CR

    private String name; // West Central Railway
    private String hq; // Jabalpur
    private boolean primary;
    private List<String> divisions;
    private String electrified; // "3000+ Route Km"
    private String kavach; // "400+ Km"
    private String status; // OPERATIONAL
    private String zoneColor; // Tailwind gradient classes
    private String borderGlow;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DivisionInfo {
        private String name; // Bhopal, Jabalpur, Kota
        private boolean active;
        private int totalCorridors;
        private int pendingBlocks;
    }
}
