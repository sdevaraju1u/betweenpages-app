/*
  BetweenPages — chat-only layout with Vibrant Gradient design.
  Dark mode + neon gradients + glassmorphism.
*/

import AppHeader from "./Components/AppHeader";
import ChatPanel from "./Components/ChatPanel";

const moodChips = [
  "Dark Academia",
  "Space Opera",
  "Slow Burn",
  "Cyberpunk",
  "Cozy Mystery",
  "Mind-Bending",
  "Surprise Me",
];

export default function Home() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-text">
      <AppHeader />
      <ChatPanel moodChips={moodChips} />
    </div>
  );
}
