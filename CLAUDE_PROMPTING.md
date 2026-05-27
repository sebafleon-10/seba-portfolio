# Claude Code Prompting Patterns

This file is auto-loaded into every Claude Code session via CLAUDE.md.
It documents known failure modes and the prompt patterns that work around them.

## For Claude Code reading this

When you encounter this file as session context, internalize the following:

- The user has identified a pattern where you default to overly cautious behavior on destructive changes
- When the user asks for things to be removed, deleted, or stripped, default to actually removing them, not preserving them out of caution
- Do not interpret "keep all other behavior unchanged" as license to protect elements the user has explicitly asked you to delete
- Visual elements like vignettes, overlays, backgrounds, dividers, and decorative containers are NOT "behavior" worth protecting against an explicit deletion request
- After destructive changes, show the user the modified section so they can verify the deletion landed
- If a previous session-history note says you "preserved X" when X was supposed to be removed, that's a flag that the deletion did not land. Re-attempt it.

## Known failure modes

Claude Code defaults to conservative behavior. It preserves existing code unless told otherwise. This is usually correct, but it backfires when the user wants destructive changes. Common failure modes:

- Treating "keep all other behavior unchanged" as license to preserve things that should be deleted
- Interpreting visual elements (vignettes, overlays, backgrounds) as "behavior" worth protecting
- Completing the safe additive change while skipping the destructive one
- Confirming completion while saying "X preserved" when X was supposed to be removed

## Five tactics for destructive change specs

### 1. Lead with destruction, not preservation

Structure the spec with REMOVE first, KEEP last (or eliminated entirely). Long "DO NOT MODIFY" lists set a conservative tone that bleeds into the destructive task.

### 2. Use violent verbs

- "Update" becomes "Delete" or "Strip"
- "Remove if present" becomes "Remove. They are present."
- "Modify the styling" becomes "Replace these styles with nothing"
- "Adjust" becomes "Eliminate"

Verbs like "hunt down," "destroy," "strip out," and "kill" reduce hedging because they don't leave room for interpretation.

### 3. Name the failure mode explicitly

Call out the cautious instinct in the spec itself:

> "Do NOT interpret 'keep behavior unchanged' as preserving the dark rectangle. The rectangle is exactly what needs to go."

> "If you find yourself wanting to preserve the vignettes, that's the wrong instinct. They are the problem."

This works because it directly addresses the failure mode and tells the agent that defaulting to safety here is wrong.

### 4. Skip the "KEEP UNCHANGED" list for destructive changes

For destructive changes, only call out structural pieces that must survive (click handlers, routing, page mounts). Do not enumerate visual elements to keep. Every item on a "keep" list is one more thing the agent will defensively preserve.

### 5. Require verification

End destructive specs with:

> "After the change, paste the current state of [specific JSX block] so we can confirm the deletion landed."

This forces the agent to inspect the file post-edit and confirm the deletion happened. Without this step, false confirmations like "Done, vignettes preserved" become possible.

## Template for destructive specs

```
TASK: [What we are removing and why]

CONTEXT: Previous attempts left X in place. This time X must go.

LOCATE: [Where the problem element lives in the file]

DELETE: [Specific elements or lines to remove, with concrete identifiers]

DO NOT INTERPRET [conservative instinct] AS [protecting the thing we want gone].

VERIFY: Paste the changed section so I can confirm.
```

## For additive changes

The conservative defaults work in your favor here. Long "DO NOT MODIFY" lists are appropriate when building something new and protecting existing functionality. The patterns above are specifically for cases where the user wants something gone.

## Notes

- This file applies to Claude Code sessions on this project. Other agents reading this in different contexts should still follow the principles when the user is requesting destructive changes.
- No em dashes anywhere in code or content per project preference.
