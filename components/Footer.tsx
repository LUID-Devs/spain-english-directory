import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-muted">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">SpainEnglishDirectory.com</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Connecting English speakers with trusted services across Spain.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search?category=Healthcare" className="text-muted-foreground hover:text-primary transition-colors">
                  Healthcare
                </Link>
              </li>
              <li>
                <Link href="/search?category=Legal" className="text-muted-foreground hover:text-primary transition-colors">
                  Legal Services
                </Link>
              </li>
              <li>
                <Link href="/search?category=Living" className="text-muted-foreground hover:text-primary transition-colors">
                  Living & Home
                </Link>
              </li>
              <li>
                <Link href="/search?category=Business" className="text-muted-foreground hover:text-primary transition-colors">
                  Business
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Cities</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search?city=Madrid" className="text-muted-foreground hover:text-primary transition-colors">
                  Madrid
                </Link>
              </li>
              <li>
                <Link href="/search?city=Barcelona" className="text-muted-foreground hover:text-primary transition-colors">
                  Barcelona
                </Link>
              </li>
              <li>
                <Link href="/search?city=Valencia" className="text-muted-foreground hover:text-primary transition-colors">
                  Valencia
                </Link>
              </li>
              <li>
                <Link href="/search?city=Málaga" className="text-muted-foreground hover:text-primary transition-colors">
                  Málaga
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">About</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Add Listing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} SpainEnglishDirectory.com. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
