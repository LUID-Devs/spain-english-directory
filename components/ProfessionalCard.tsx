import Link from 'next/link';
import { Star, MapPin, Phone, Mail, BadgeCheck } from 'lucide-react';

interface ProfessionalCardProps {
  id: string;
  name: string;
  category: string;
  city: string;
  description: string;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  imageUrl?: string;
}

export default function ProfessionalCard({
  id,
  name,
  category,
  city,
  description,
  rating,
  reviewCount,
  isVerified,
  imageUrl,
}: ProfessionalCardProps) {
  return (
    <Link
      href={`/listing/${id}`}
      className="group block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-spain-red/20 transition-all overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-spain-red to-spain-redLight flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {imageUrl ? (
              <img src={imageUrl} alt={name} className="w-full h-full rounded-full object-cover" />
            ) : (
              name.charAt(0).toUpperCase()
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 group-hover:text-spain-red transition-colors truncate">
                {name}
              </h3>
              {isVerified && (
                <BadgeCheck className="w-4 h-4 text-spain-yellow flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-spain-red font-medium">{category}</p>
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <MapPin size={14} />
              <span className="capitalize">{city}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mt-4 line-clamp-2">{description}</p>

        {/* Rating */}
        {rating !== undefined && (
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-spain-yellow text-spain-yellow" />
              <span className="font-semibold text-sm">{rating.toFixed(1)}</span>
            </div>
            {reviewCount !== undefined && (
              <span className="text-sm text-gray-400">({reviewCount} reviews)</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
