export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium">Live poojas happening now</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
              Sacred Devotion,
              <br />
              <span className="text-primary">Digital Access</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-xl" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              Connect with authentic temple services from anywhere in the world. 
              Experience complete transparency, personalised recommendations, and receive blessed prasad at your doorstep.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 rounded-xl bg-primary text-primary-foreground hover:bg-[#E05C10] transition-all text-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105">
                Explore Poojas
              </button>
              <button className="px-8 py-4 rounded-xl border-2 border-border hover:border-primary bg-background hover:bg-primary/5 transition-all text-lg font-medium">
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
              <div>
                <div className="text-3xl font-bold text-primary" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>5</div>
                <div className="text-sm text-muted-foreground mt-1" style={{ fontFamily: "'Noto Sans', sans-serif" }}>Sacred Temples</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>50+</div>
                <div className="text-sm text-muted-foreground mt-1" style={{ fontFamily: "'Noto Sans', sans-serif" }}>Authentic Poojas</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>10k+</div>
                <div className="text-sm text-muted-foreground mt-1" style={{ fontFamily: "'Noto Sans', sans-serif" }}>Happy Devotees</div>
              </div>
            </div>
          </div>

          {/* Right image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl transform rotate-3"></div>
            <img
              src="https://images.unsplash.com/photo-1772787429537-77ba39d3f855?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBmbG93ZXIlMjBvZmZlcmluZ3MlMjBpbmNlbnNlfGVufDF8fHx8MTc3MzgyNTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Temple offerings"
              className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover"
            />
            
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl p-6 shadow-2xl max-w-xs">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🙏</span>
                </div>
                <div>
                  <p className="font-semibold mb-1" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                    Personalised for you
                  </p>
                  <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                    AI-powered recommendations based on your Nakshatra and Rashi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
