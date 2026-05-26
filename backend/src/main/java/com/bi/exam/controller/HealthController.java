package com.bi.exam.controller;

import com.bi.exam.config.SsasProperties;
import com.bi.exam.mdx.SsasBridge;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.Map;

/**
 * Liveness + SSAS connectivity probe.
 * GET /api/health executes a minimal MDX to verify the ADOMD.NET bridge works.
 */
@Path("/api/health")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Health", description = "Liveness and SSAS connectivity probes")
public class HealthController {

    @Inject SsasBridge bridge;
    @Inject SsasProperties props;

    @GET
    public Response health() {
        try {
            List<Map<String, Object>> rows = bridge.execute(
                    "SELECT {[Measures].[Revenue]} ON COLUMNS FROM [VDS]");
            return Response.ok(Map.of(
                    "status", "UP",
                    "ssasServer", props.dataSource(),
                    "catalog", props.catalog(),
                    "cube", props.cube(),
                    "probeRows", rows.size()
            )).build();
        } catch (Exception e) {
            return Response.status(Response.Status.SERVICE_UNAVAILABLE).entity(Map.of(
                    "status", "DOWN",
                    "error", e.getMessage()
            )).build();
        }
    }
}