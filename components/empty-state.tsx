type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="card-shell rounded-[1.75rem] px-6 py-10 text-center">
      <h3 className="font-heading text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-stone">{description}</p>
    </div>
  );
}
