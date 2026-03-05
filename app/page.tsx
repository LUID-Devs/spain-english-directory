import SearchBar from "@/components/SearchBar";
import CategoryCard from "@/components/CategoryCard";
import CityCard from "@/components/CityCard";
import { Stethoscope, Scale, Home as HomeIcon, Briefcase, Search, CheckCircle, MessageCircle } from "lucide-react";

const categories = [
  {
    name: "Healthcare",
    description: "Doctors, dentists, therapists, and medical specialists",
    icon: Stethoscope,
    href: "/search?category=healthcare",
    count: 245,
  },
  {
    name: "Legal",
    description: "Lawyers, solicitors, immigration experts, and legal advisors",
    icon: Scale,
    href: "/search?category=legal",
    count: 128,
  },
  {
    name: "Living",
    description: "Real estate, movers, utilities, and home services",
    icon: HomeIcon,
    href: "/search?category=living",
    count: 312,
  },
  {
    name: "Business",
    description: "Accountants, consultants, and business services",
    icon: Briefcase,
    href: "/search?category=business",
    count: 189,
  },
];

const cities = [
  { name: "Madrid", professionalCount: 523 },
  { name: "Barcelona", professionalCount: 412 },
  { name: "Valencia", professionalCount: 198 },
  { name: "Málaga", professionalCount: 156 },
];

const howItWorks = [
  {
    icon: Search,
    title: "Search",
    description: "Find English-speaking professionals by category or city",
  },
  {
    icon: CheckCircle,
    title: "Connect",
    description: "Browse profiles, read reviews, and choose the right professional",
  },
  {
    icon: MessageCircle,
    title: "Get Help",
    description: "Contact professionals directly and get the service you need",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-white py-20 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-spain-red/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-spain-yellow/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Find English-Speaking
            <span className="text-spain-red"> Professionals</span>
            <br />
            in Spain
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Connect with trusted doctors, lawyers, and service providers who speak your language
          </p>
          <div className="flex justify-center">
            <SearchBar variant="hero" />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find the right professional for your needs across our most popular categories
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.name} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cities Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Cities</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore English-speaking professionals in Spain&apos;s most popular expat destinations
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cities.map((city) => (
              <CityCard
                key={city.name}
                name={city.name}
                professionalCount={city.professionalCount}
                href={`/search?city=${city.name.toLowerCase()}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Getting help from English-speaking professionals in Spain is easy
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {howItWorks.map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="w-16 h-16 bg-spain-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-8 h-8 text-spain-red" />
                </div>
                <div className="w-8 h-8 bg-spain-yellow text-gray-900 rounded-full flex items-center justify-center font-bold mx-auto mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-spain-red">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Are You an English-Speaking Professional?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Join our directory and connect with expats looking for your services
          </p>
          <button className="bg-white text-spain-red font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors">
            List Your Business
          </button>
        </div>
      </section>
    </div>
  );
}
