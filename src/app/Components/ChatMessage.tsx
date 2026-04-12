type ChatMessageProps = {
  role: "user" | "assistant";
  children: React.ReactNode;
};

export default function ChatMessage({ role, children }: ChatMessageProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%] glass rounded-[20px] rounded-br-sm px-5 py-3 text-[15px] text-text border border-accent/20">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="max-w-[70%] text-[15px] text-text leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}
