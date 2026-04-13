type ChatMessageProps = {
  role: "user" | "assistant";
  children: React.ReactNode;
};

// Chat bubbles — Solarpunk Editorial:
// User: pill-shaped, primary-container background (sage tint)
// Assistant: no bubble, just clean text on surface. Breathing room.
// No borders anywhere (the "No-Line" rule).

export default function ChatMessage({ role, children }: ChatMessageProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[70%] rounded-full px-6 py-3 text-[15px]
            bg-primary-container text-on-primary"
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div
        className="max-w-[75%] text-[15px] text-on-surface leading-relaxed space-y-2
          bg-surface-container-highest rounded-3xl px-6 py-4"
      >
        {children}
      </div>
    </div>
  );
}
