package com.railopt.config;

import com.railopt.entity.*;
import com.railopt.service.SequenceGeneratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertEvent;
import org.springframework.stereotype.Component;

/**
 * Automatically assigns generated sequential Long IDs to entities if an ID is not already set.
 */
@Component
@RequiredArgsConstructor
public class MongoIdGeneratorListener extends AbstractMongoEventListener<Object> {

    private final SequenceGeneratorService sequenceGenerator;

    @Override
    public void onBeforeConvert(BeforeConvertEvent<Object> event) {
        Object entity = event.getSource();
        String collection = event.getCollectionName();

        if (entity instanceof Department d && d.getId() == null) {
            d.setId(sequenceGenerator.generateSequence(collection));
        } else if (entity instanceof Corridor c && c.getId() == null) {
            c.setId(sequenceGenerator.generateSequence(collection));
        } else if (entity instanceof Train t && t.getId() == null) {
            t.setId(sequenceGenerator.generateSequence(collection));
        } else if (entity instanceof RailwayAsset a && a.getId() == null) {
            a.setId(sequenceGenerator.generateSequence(collection));
        } else if (entity instanceof MaintenanceTask m && m.getId() == null) {
            m.setId(sequenceGenerator.generateSequence(collection));
        } else if (entity instanceof BlockRequest b && b.getId() == null) {
            b.setId(sequenceGenerator.generateSequence(collection));
        } else if (entity instanceof AiBlockPlan p && p.getId() == null) {
            p.setId(sequenceGenerator.generateSequence(collection));
        } else if (entity instanceof User u && u.getId() == null) {
            u.setId(sequenceGenerator.generateSequence(collection));
        } else if (entity instanceof AuthAuditLog l && l.getId() == null) {
            l.setId(sequenceGenerator.generateSequence(collection));
        }
    }
}
