import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  href: string;
  count?: number;
}

export default function CategoryCard({ name, description, icon: Icon, href, count }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group block p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-spain-red/20 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-spain-red/10 rounded-lg group-hover:bg-spain-red/20 transition-colors">
          <Icon className="w-6 h-6 text-spain-red" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-spain-red transition-colors">
            {name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
          {count !== undefined && (
            <p className="text-xs text-gray-400 mt-2">{count} professionals</p>
          )}
        </div>
      </div>
    </Link>
  );
}
