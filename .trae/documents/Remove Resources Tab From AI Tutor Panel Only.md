## Goal
Remove the Resources tab from the Collaboration panel when the Chat (AI Tutor) panel is open. Keep the standalone Resources panel accessible via the Resources icon button. Do not change any other behavior or layout.

## File
- `src/components/SessionMeetingExperience.tsx`

## Changes
1) In the Chat panel (`activePanel === "chat"`):
- Update `TabsList` to show only one tab (AI Tutor): change `grid-cols-2` → `grid-cols-1` and remove the `TabsTrigger` for `value="resources"`.
- Remove the `TabsContent` block for `value="resources"` (the resources content inside the chat panel).

2) Keep the standalone Resources panel (`activePanel === "resources"`) and the Resources icon button unchanged so the user can still access resources separately.

## Validation
- Collaboration panel with Chat shows only AI Tutor tab and content.
- Clicking the Resources icon still opens the standalone Resources panel.
- No other functionality changes (composer, scrolling, responses, controls).