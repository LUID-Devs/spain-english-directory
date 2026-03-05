import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import CategoryCard from "@/components/CategoryCard";
import Link from "next/link";

const categories = [
  {
    title: "Healthcare",
    description: "Doctors, dentists, therapists, and medical specialists who speak English.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    href: "/search?category=Healthcare",
    count: 245,
  },
  {
    title: "Legal",
    description: "Lawyers, solicitors, and legal advisors for residency, property, and business.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    href: "/search?category=Legal",
    count: 128,
  },
  {
    title: "Living",
    description: "Real estate agents, movers, utilities, and home services in English.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    href: "/search?category=Living",
    count: 189,
  },
  {
    title: "Business",
    description: "Accountants, consultants, and business services for expats.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    href: "/search?category=Business",
    count: 94,
  },
];

const featuredCities = [
  { name: "Madrid", count: 423, image: "🏛️" },
  { name: "Barcelona", count: 387, image: "🌊" },
  { name: "Valencia", count: 156, image: "🍊" },
  { name: "Málaga", count: 142, image: "☀️" },
];

const howItWorks = [
  {
    step: "1",
    title: "Search",
    description: "Enter what you need and your location in Spain.",
  },
  {
    step: "2",
    title: "Compare",
    description: "Browse verified English-speaking professionals.",
  },
  {
    step: "3",
    title: "Connect",
    description: "Contact directly and get the help you need.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/5 via-white to-secondary/10 py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Find English-Speaking
              <br />
              <span className="text-primary">Services in Spain</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Connect with trusted doctors, lawyers, and professionals who speak your language across Spain.
            </p>
            <SearchBar large />
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="text-sm text-muted-foreground">Popular:</span>
              {["Doctor Madrid", "Lawyer Barcelona", "Accountant", "Dentist"].map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="text-sm text-primary hover:text-primary-dark hover:underline"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Browse by Category</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Find the professional services you need, all with verified English language support.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <CategoryCard key={category.title} {...category} />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Cities Section */}
        <section className="py-16 lg:py-20 bg-muted">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Featured Cities</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Discover English-speaking services in Spain&apos;s most popular destinations.
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredCities.map((city) => (
                <Link
                  key={city.name}
                  href={`/search?city=${encodeURIComponent(city.name)}`}
                  className="group relative overflow-hidden rounded-xl bg-white p-6 text-center shadow-sm hover:shadow-md transition-all"
                >
                  <div className="text-4xl mb-3">{city.image}</div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {city.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{city.count} listings</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Getting the help you need in English is simple and straightforward.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {howItWorks.map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-xl font-bold text-accent">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-20 bg-primary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to find what you need?</h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8">
              Join thousands of expats who trust our directory for English-speaking services in Spain.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-base font-medium text-primary hover:bg-secondary transition-colors"
            >
              Start Searching
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
