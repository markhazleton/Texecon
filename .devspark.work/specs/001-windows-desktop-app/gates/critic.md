```yaml
gate: critic
status: pass
blocking: false
severity: info
summary: "The plan and task list now contain explicit controls for packaged dependencies, trust boundaries, data continuity, process cleanup, rollback, signing secrets, and redacted diagnostics."
```

# Adversarial Risk Assessment

**Archetype**: desktop-app with local media renderer  
**Context mode**: brownfield  
**Risk profile**: customer-facing family distribution  
**Review scope**: FULL

| ID | Category | Base | Effective | Summary | Recommended action |
|---|---|---|---|---|---|
| C1 | Dependency supply chain | HIGH | HIGH | A bundled runtime can drift from the development environment or include vulnerable/unlicensed binaries. | Pin, inventory, scan, and record runtime/binary provenance during packaging. |
| C2 | Trust boundary | SHOWSTOPPER | SHOWSTOPPER | Project paths, uploaded/imported filenames, and renderer subprocess arguments cross a privileged local boundary. | Enforce canonical-root checks, size/type limits, token checks, and argument-list subprocess execution; test traversal and injection cases. |
| C3 | Data loss continuity | SHOWSTOPPER | SHOWSTOPPER | Managed-copy operations and project saves can damage user-owned media or leave partial state after interruption. | Use copy-to-temp then atomic replace, never delete source media, preserve backups, and test power/process interruption. |
| C4 | Concurrency/resource cleanup | CRITICAL | CRITICAL | Embedded server and renderer threads/processes may leak or leave orphaned FFmpeg jobs on close. | Add cancellation, timeout, process-tree cleanup, and restart recovery tests. |
| C5 | Deployment rollback | CRITICAL | CRITICAL | A bad installer or release link could strand users without a documented rollback path. | Publish immutable versioned artifacts, checksums, previous-release links, and a tested uninstall/upgrade path. |
| C6 | Signing secrets | HIGH | HIGH | The plan requires signing but does not define how private signing material stays out of source and logs. | Sign only in protected release automation or a local secure store; fail if keys are absent or logged. |
| C7 | Observability/support | MEDIUM | MEDIUM | Family users need diagnostics for renderer and startup failures without exposing private media paths. | Provide redacted local diagnostic logs and a user-accessible log-folder action. |

## Next Actions

Implementation must complete T036-T042 before public release. No stack/archetype checklist was available at `.devspark/risk-checklists/`; these findings used the universal failure-mode lens.
