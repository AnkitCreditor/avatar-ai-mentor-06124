## Goal
- Replace the chat panel subheader text with "AI Tutor".
- Remove the Chat tab bar (TabsList) to free vertical space and give it to the message output area.
- Do not change any other functionality.

## Changes (SessionMeetingExperience.tsx)
1) Header description
- In the sidebar header description `<p>` for `activePanel === "chat"`, change displayed text from `"Chat, AI tutor, and resources"` to `"AI Tutor"`.

2) Remove TabsList from Chat panel
- Inside `activePanel === "chat"` branch, delete the `<TabsList>` block so no tab pills render.
- Keep `Tabs` and `TabsContent value="chatbot"` intact; only remove the tabs pills.

3) Expand output area
- Change the chat content container margin from `mt-4` to `mt-0` to use the space previously occupied by the tab bar.

## Validation
- Header shows "AI Tutor" when the chat panel is open.
- No tab pills appear; the message output area is taller.
- Chat sending, auto-scroll, and composer remain unchanged.