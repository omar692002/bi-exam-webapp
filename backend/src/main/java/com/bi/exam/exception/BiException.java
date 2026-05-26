package com.bi.exam.exception;

/**
 * Base runtime exception for business-layer failures.
 * Wraps lower-level OLAP/SQL errors with a user-meaningful message.
 */
public class BiException extends RuntimeException {

    public BiException(String message) {
        super(message);
    }

    public BiException(String message, Throwable cause) {
        super(message, cause);
    }
}
