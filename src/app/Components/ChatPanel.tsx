import ChatContainer from "./ChatContainer";

type BookContext = {
  title: string;
  author: string;
  description?: string;
};

type ChatPanelProps = {
  moodChips: string[];
  bookContext?: BookContext;
};

// ChatPanel — thin wrapper. Passes bookContext for scoped chat.
export default function ChatPanel({ moodChips, bookContext }: ChatPanelProps) {
  return (
    <section className="flex-1 flex flex-col min-h-0 bg-background">
      <ChatContainer moodChips={moodChips} bookContext={bookContext} />
    </section>
  );
}
