export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-xl">🪔</span>
              </div>
              <span className="font-bold text-xl tracking-tight" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                DEVASEVA
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              Where Technology Meets Devotion. Authentic temple services accessible to every Hindu devotee, anywhere in the world.
            </p>
          </div>

          {/* Poojas */}
          <div>
            <h4 className="font-semibold mb-4" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
              Poojas
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              <li><a href="#" className="hover:text-foreground transition-colors">All Poojas</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">By Deity</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">By Occasion</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Recommended</a></li>
            </ul>
          </div>

          {/* Temples */}
          <div>
            <h4 className="font-semibold mb-4" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
              Temples
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              <li><a href="#" className="hover:text-foreground transition-colors">Tirumala</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Rameshwaram</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Madurai</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Varanasi</a></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-semibold mb-4" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
              About
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              <li><a href="#" className="hover:text-foreground transition-colors">Our Mission</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            © 2026 DEVASEVA. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
