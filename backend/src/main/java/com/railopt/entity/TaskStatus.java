package com.railopt.entity;

/**
 * Lifecycle status for a maintenance task.
 */
public enum TaskStatus {
    /** Task raised, awaiting planning review */
    PENDING,
    /** Task approved and included in a maintenance block plan */
    SCHEDULED,
    /** Maintenance work is actively in progress (block taken) */
    IN_PROGRESS,
    /** Task successfully completed and verified */
    COMPLETED,
    /** Task deferred to a future planning cycle */
    DEFERRED,
    /** Task cancelled — no longer required */
    CANCELLED
}
