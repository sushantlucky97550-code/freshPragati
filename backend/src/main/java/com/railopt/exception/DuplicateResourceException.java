package com.railopt.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a create/update operation would violate a uniqueness constraint.
 * Results in a 409 Conflict HTTP response.
 *
 * Examples:
 * - Duplicate department code
 * - Duplicate maintenance task ID
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
