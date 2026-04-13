import MainShell from "../../Components/MainShell";
import BookDetailContent from "../../Components/BookDetailContent";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function BookPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-on-surface">
      <MainShell>
        <BookDetailContent bookId={id} />
      </MainShell>
    </div>
  );
}
