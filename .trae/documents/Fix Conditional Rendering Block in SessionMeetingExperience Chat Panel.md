## Goal
Resolve the syntax/structure error around the chat panel ternary rendering at `src/components/SessionMeetingExperience.tsx` so the UI renders correctly and chat works as expected. No other functionality will be changed.

## Changes
1. Correct the ternary chain for `activePanel` with three branches:
   - `participants` → participants list
   - `chat` → tabs with Session, AI Tutor, Resources
   - fallback → meeting info panel
2. Ensure tags and components are properly closed and ordered in the `chat` branch:
   - `Tabs`
   - `TabsList`
   - `div` wrapper for `TabsContent` sections
   - `TabsContent` for `session-chat`, `chatbot`, `resources`
   - `ScrollArea` with `overflow-y-auto` and refs for session/chatbot
   - sticky composer form at the bottom
3. Verify variable names (`sessionChat`, `chatbotMessages`) and keys are correct.
4. Keep message order top-to-bottom and preserve auto-scroll-to-bottom in each section.

## Patch Sketch (focused block)
```tsx
{activePanel === "participants" ? (
  <div className="flex h-[calc(100%-4.5rem)] flex-col overflow-hidden px-5 py-4 text-sm text-neutral-100">
    <ScrollArea className="flex-1">{/* participants list */}</ScrollArea>
  </div>
) : activePanel === "chat" ? (
  <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-[calc(100%-4.5rem)] flex-col overflow-hidden px-5 py-4">
    <TabsList className="flex-shrink-0 grid grid-cols-3 rounded-full bg-white/10 p-1 text-xs">
      <TabsTrigger value="session-chat" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-neutral-900">Session</TabsTrigger>
      <TabsTrigger value="chatbot" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-neutral-900">AI Tutor</TabsTrigger>
      <TabsTrigger value="resources" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-neutral-900">Resources</TabsTrigger>
    </TabsList>

    <div className="mt-4 flex-1 min-h-0 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-inner">
      <TabsContent value="session-chat" className="h-full">
        <ScrollArea ref={sessionScrollAreaRef} className="h-full px-4 py-4 overflow-y-auto">
          <div className="flex h-full flex-col gap-4">
            {sessionChat.map(message => (
              <div key={message.id} className={`flex ${message.source === 'participant' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${message.source === 'participant' ? 'bg-primary/90 text-primary-foreground shadow-md' : message.source === 'instructor' ? 'bg-neutral-800 text-white shadow-sm' : 'bg-neutral-700 text-white'}`}>
                  <p className="font-medium">{message.sender}</p>
                  <p>{message.message}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-white/70">{message.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="chatbot" className="h-full">
        <ScrollArea ref={chatbotScrollAreaRef} className="h-full px-4 py-4 overflow-y-auto">
          <div className="flex h-full flex-col gap-4">
            {chatbotMessages.map(message => (
              <div key={message.id} className={`flex ${message.source === 'participant' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${message.source === 'participant' ? 'bg-primary/90 text-primary-foreground shadow-md' : 'bg-neutral-700 text-white'}`}>
                  <p className="flex items-center gap-2 font-medium">{message.source === 'bot' && <Bot className="h-3 w-3"/>}{message.sender}</p>
                  <p>{message.message}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-white/70">{message.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="resources" className="h-full">
        <div className="flex h-full flex-col gap-3 px-5 py-4 text-sm overflow-y-auto">
          {/* resources content */}
        </div>
      </TabsContent>
    </div>

    <div className="sticky bottom-0 bg-neutral-900 mt-4 flex-shrink-0 rounded-2xl border border-white/10 px-4 py-4 shadow-lg">
      <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
        {/* textarea + send button */}
      </form>
    </div>
  </Tabs>
) : (
  <div className="flex h-[calc(100%-4.5rem)] flex-col overflow-hidden px-5 py-4 text-sm text-neutral-100">
    {/* meeting info */}
  </div>
)}
```

## Validation
- Build compiles without JSX/TS errors.
- Chat panel renders all three tabs correctly.
- Sending a message appends below the user message; scroll stays inside the panel.

## Scope
- Confined to the broken ternary block and tag structure; no other functionality or styles changed.