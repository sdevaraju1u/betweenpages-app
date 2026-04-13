import MainShell from "../Components/MainShell";
import SavedBooksContent from "../Components/SavedBooksContent";

export default function SavedPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-on-surface">
      <MainShell>
        <SavedBooksContent />
      </MainShell>
    </div>
  );
}
