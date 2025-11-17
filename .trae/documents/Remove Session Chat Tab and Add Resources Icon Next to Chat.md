## Goal
- Remove the "Session" chat tab entirely from the Collaboration panel.
- Add a Resources icon button next to the existing Chat button in the stage controls that opens the Collaboration panel with the Resources tab active.
- Do not change any other functionality.

## File to Update
- `src/components/SessionMeetingExperience.tsx`

## Changes
### 1) Tabs List and Content
- Update the Collaboration panel tabs to only show two tabs: `AI Tutor` and `Resources`.
- In `TabsList`, change `grid-cols-3` to `grid-cols-2` and remove the `TabsTrigger` for `session-chat`.
- Remove the `TabsContent` for `value="session-chat"` and keep the `AI Tutor` and `Resources` `TabsContent` unchanged.
- Ensure internal scroll areas and message rendering remain untouched for the `AI Tutor` tab.

### 2) Resources Button Next to Chat
- In the stage controls row where the Chat button lives, add a new button with a resources icon (e.g., `BookOpen` from `lucide-react`) immediately next to the Chat button.
- Behavior:
  - If the Collaboration panel is closed, open it (`openPanel('chat')`) and set `activeTab` to `resources`.
  - If the panel is already open and currently not on `resources`, switch the tab: `setActiveTab('resources')`.
- Styling: match the appearance of the Chat button (rounded, bg white/10, hover white/20).
- Add `import { BookOpen } from 'lucide-react'` to the icons at top.

### 3) Leave Everything Else Intact
- No changes to the AI Tutor functionality, message send handling, auto scroll, or any other controls.
- No page-level scroll changes; scrollbars remain only within the chat sections.

## Validation
- Collaboration panel shows only `AI Tutor` and `Resources` tabs; no `Session` tab.
- Clicking the new Resources icon button opens the panel directly on `Resources`.
- Chat send flow and auto-scroll for AI Tutor remain as before.

## Notes
- All edits are localized to `SessionMeetingExperience.tsx`. No other files or behaviors are changed.