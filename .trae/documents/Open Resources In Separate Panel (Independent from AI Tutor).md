## Goal
- Clicking the Resources icon opens a separate Resources panel, not the combined Chat tabs panel.
- Keep existing AI Tutor panel and tabs unchanged. Do not modify other functionality.

## Changes (SessionMeetingExperience.tsx)
1) State
- Extend `activePanel` union to include `"resources"` so the sidebar can render a dedicated resources view.

2) Header
- In the sidebar header, show title and description according to `activePanel`: `chat` → Collaboration, `participants` → Participants, `resources` → Resources, else → Meeting info.

3) Sidebar Rendering
- Add a new branch for `activePanel === "resources"`.
- Render a dedicated Resources view using the same content currently used in the resources tab, inside a `ScrollArea`.
- Do not include the chat composer in this branch.

4) Resources Icon Button Behavior
- Change the Resources icon button to open the resources-only panel: `openPanel('resources')`.
- If already open on resources, toggle close.

## Validation
- Clicking the Resources icon opens a standalone resources panel.
- AI Tutor panel and its tabs remain unchanged and continue to work.
- No changes to other UI or behaviors.