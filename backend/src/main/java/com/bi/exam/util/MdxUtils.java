package com.bi.exam.util;

/**
 * Small helpers for safe MDX literal escaping.
 */
public final class MdxUtils {

    private MdxUtils() { }

    /**
     * Escape a member-name fragment so it can be safely embedded inside [ ... ] brackets.
     * Closing brackets inside member names are escaped by doubling.
     */
    public static String escapeMemberName(String raw) {
        if (raw == null) return "";
        return raw.replace("]", "]]");
    }

    /**
     * Wrap an unquoted name as an MDX member identifier: foo → [foo].
     */
    public static String bracket(String name) {
        return "[" + escapeMemberName(name) + "]";
    }
}
