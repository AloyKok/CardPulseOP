type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl space-y-3">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-white">{eyebrow}</p>
      <h2 className="font-heading text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      <p className="text-base leading-7 text-stone">{description}</p>
    </div>
  );
}
