import ChatContainer from "./ChatContainer";

type ChatPanelProps = {
  moodChips: string[];
};

export default function ChatPanel({ moodChips }: ChatPanelProps) {
  return (
    <section className="flex-1 flex flex-col min-h-0 bg-background">
      <div className="flex-1 flex flex-col min-h-0 w-full max-w-[800px] mx-auto">
        <ChatContainer moodChips={moodChips} />
      </div>
    </section>
  );
}
