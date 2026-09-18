package com.railopt.entity;

/**
 * Priority levels for scheduling maintenance tasks.
 * Used by the planning engine to determine execution order.
 */
public enum Priority {
    /** Routine maintenance — schedule at next available block */
    LOW,
    /** Standard priority — schedule within current planning cycle */
    MEDIUM,
    /** High priority — must be included in next block plan */
    HIGH,
    /** Emergency — override regular schedule, immediate block required */
    URGENT
}
