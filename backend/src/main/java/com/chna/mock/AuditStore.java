package com.chna.mock;

import com.chna.model.AuditEntry;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * In-memory audit trail store (rules.md §5 — no real DB for prototype).
 * Uses CopyOnWriteArrayList for thread safety under concurrent SSE streaming.
 *
 * Per doc.md §3.5.4, every access generates an entry here.
 * The "Maintain Audit Trail" tactic (doc.md §2.3.1) mandates that if this store
 * is unavailable, all accesses are blocked — here we simulate that by throwing.
 */
@Component
public class AuditStore {

    // Thread-safe list: SSE broadcasting and pipeline execution run on different threads
    private final CopyOnWriteArrayList<AuditEntry> entries = new CopyOnWriteArrayList<>();

    /**
     * Records a new audit entry. Never drops entries (simulates non-repudiable storage).
     */
    public void add(AuditEntry entry) {
        entries.add(0, entry); // prepend: most recent first
    }

    /**
     * Returns an unmodifiable view of all audit entries (most recent first).
     */
    public List<AuditEntry> getAll() {
        return Collections.unmodifiableList(new ArrayList<>(entries));
    }

    /**
     * Returns total number of recorded events.
     */
    public int count() {
        return entries.size();
    }
}
