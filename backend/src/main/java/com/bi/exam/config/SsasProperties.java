package com.bi.exam.config;

import io.smallrye.config.ConfigMapping;
import io.smallrye.config.WithDefault;

/**
 * Typed configuration for the SSAS instance accessed via ADOMD.NET.
 * Values come from application.properties under the ssas.* prefix.
 */
@ConfigMapping(prefix = "ssas")
public interface SsasProperties {

    /** SSAS server name or IP (default: localhost on TCP 2383). */
    @WithDefault("localhost")
    String dataSource();

    /** OLAP catalog name. */
    @WithDefault("ExamMultidimensionnel")
    String catalog();

    /** Cube name within the catalog. */
    @WithDefault("VDS")
    String cube();
}