import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CityCardProps {
  name: string;
  imageUrl?: string;
  professionalCount?: number;
  href: string;
}

export default function CityCard({ name, imageUrl, professionalCount, href }: CityCardProps) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-xl aspect-[4/3]"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{
          backgroundImage: imageUrl
            ? `url(${imageUrl})`
            : `linear-gradient(135deg, #AA151B 0%, #F1BF00 100%)`,
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-2xl font-bold text-white">{name}</h3>
        {professionalCount !== undefined && (
          <p className="text-white/80 text-sm mt-1">
            {professionalCount} professionals
          </p>
        )}
        <div className="flex items-center gap-1 text-spain-yellow mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-sm font-medium">Explore</span>
          <ArrowRight size={16} />
        </div>
      </div>
    </Link>
  );
}
