type DashboardSectionPageProps = {
  title: string;
  description?: string;
};

export function DashboardSectionPage({
  title,
  description = 'Contenu à venir.',
}: DashboardSectionPageProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-atg-fg">{title}</h1>
      <p className="mt-2 text-sm text-atg-muted">{description}</p>
    </div>
  );
}
