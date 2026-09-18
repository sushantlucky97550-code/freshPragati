package com.railopt.entity;

/**
 * Severity levels for maintenance tasks.
 * Determines urgency of the maintenance work required.
 */
public enum Severity {
    /** Minor issue — can be deferred to next scheduled cycle */
    LOW,
    /** Moderate degradation — should be addressed within 7 days */
    MEDIUM,
    /** Significant defect — must be addressed within 48 hours */
    HIGH,
    /** Safety-critical — requires immediate attention */
    CRITICAL
}
