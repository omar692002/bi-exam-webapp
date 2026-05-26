package com.bi.exam.exception;

import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

import java.time.OffsetDateTime;
import java.util.Map;

/**
 * Converts uncaught exceptions into a uniform JSON error envelope.
 */
@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Throwable> {

    private static final Logger LOG = Logger.getLogger(GlobalExceptionMapper.class);

    @Override
    public Response toResponse(Throwable ex) {
        Response.Status status = resolveStatus(ex);
        if (status.getStatusCode() >= 500) {
            LOG.errorf(ex, "Unhandled error: %s", ex.getMessage());
        } else {
            LOG.warnf("Client error: %s", ex.getMessage());
        }
        Map<String, Object> body = Map.of(
                "timestamp", OffsetDateTime.now().toString(),
                "status", status.getStatusCode(),
                "error", status.getReasonPhrase(),
                "message", ex.getMessage() == null ? "Unexpected error" : ex.getMessage(),
                "type", ex.getClass().getSimpleName()
        );
        return Response.status(status)
                .type(MediaType.APPLICATION_JSON)
                .entity(body)
                .build();
    }

    private Response.Status resolveStatus(Throwable ex) {
        if (ex instanceof MdxExecutionException) return Response.Status.BAD_GATEWAY;
        if (ex instanceof BiException) return Response.Status.BAD_REQUEST;
        if (ex instanceof IllegalArgumentException) return Response.Status.BAD_REQUEST;
        return Response.Status.INTERNAL_SERVER_ERROR;
    }
}
