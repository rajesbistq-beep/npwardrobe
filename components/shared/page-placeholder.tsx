type PagePlaceholderProps = {
  title: string;
  description: string;
};

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="page-placeholder" aria-labelledby="page-title">
      <p className="eyebrow">NP Wardrobe</p>
      <h1 id="page-title">{title}</h1>
      <p className="page-placeholder__description">{description}</p>
      <p className="pending-state"><span aria-hidden="true" />Implementation pending</p>
    </section>
  );
}
