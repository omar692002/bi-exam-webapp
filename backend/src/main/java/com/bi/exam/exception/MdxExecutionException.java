package com.bi.exam.exception;

/**
 * Thrown when an MDX statement fails to execute against SSAS.
 */
public class MdxExecutionException extends BiException {

    private final String mdx;

    public MdxExecutionException(String message, String mdx, Throwable cause) {
        super(message, cause);
        this.mdx = mdx;
    }

    public String getMdx() {
        return mdx;
    }
}
