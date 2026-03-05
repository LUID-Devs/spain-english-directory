import { DirectoryListing } from '@/lib/data/listings';
import ListingCard from './ListingCard';

interface ProfessionalListProps {
  listings: DirectoryListing[];
  total: number;
  cityName: string;
  categoryName: string;
}

export default function ProfessionalList({ 
  listings, 
  total, 
  cityName, 
  categoryName 
}: ProfessionalListProps) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No {categoryName.toLowerCase()} found
        </h3>
        <p className="text-gray-600">
          We couldn&apos;t find any English-speaking {categoryName.toLowerCase()} in {cityName} matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
