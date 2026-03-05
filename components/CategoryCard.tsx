import Link from "next/link";
import { ReactNode } from "react";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  count?: number;
}

export default function CategoryCard({ title, description, icon, href, count }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-border bg-white p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
    >
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      {count !== undefined && (
        <span className="text-xs font-medium text-primary">
          {count} listings →
        </span>
      )}
    </Link>
  );
}
