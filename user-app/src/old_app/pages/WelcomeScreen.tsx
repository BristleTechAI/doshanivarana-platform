import { Link } from 'react-router';

export function WelcomeScreen() {
  return (
    <div className="h-screen flex flex-col bg-[#1A0A00] px-6">
      {/* Logo */}
      <div className="pt-12 pb-8 text-center">
        <h2
          className="text-2xl font-bold text-primary"
          style={{ fontFamily: "'Anek Devanagari', sans-serif" }}
        >
          DEVASEVA
        </h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center pb-20">
        {/* Greeting */}
        <h1
          className="text-4xl font-bold mb-4"
          style={{ fontFamily: "'Anek Devanagari', sans-serif", color: '#F5F5F0' }}
        >
          Namaste 🙏
        </h1>

        {/* Subtitle */}
        <p
          className="text-center text-base mb-6 max-w-sm"
          style={{ fontFamily: "'Noto Sans', sans-serif", color: '#44403C' }}
        >
          Your sacred space for poojas, wherever you are.
        </p>

        {/* Decorative Divider */}
        <div className="w-10 h-0.5 bg-primary mb-12" />

        {/* CTAs */}
        <div className="w-full max-w-sm space-y-4">
          <Link to="/setup">
            <button
              className="w-full py-4 rounded-xl bg-primary text-[#1A0A00] font-medium text-base hover:bg-[#E05C10] transition-colors"
              style={{ fontFamily: "'Anek Devanagari', sans-serif" }}
            >
              Continue with Mobile
            </button>
          </Link>

          <Link to="/">
            <button
              className="w-full py-4 rounded-xl border-2 border-primary text-primary bg-transparent font-medium text-base hover:bg-primary/5 transition-colors"
              style={{ fontFamily: "'Anek Devanagari', sans-serif" }}
            >
              Sign In
            </button>
          </Link>
        </div>
      </div>

      {/* Terms */}
      <div className="pb-8 text-center">
        <p className="text-xs" style={{ fontFamily: "'Noto Sans', sans-serif", color: '#78716C' }}>
          By continuing you agree to our{' '}
          <a href="#" className="underline text-primary">
            Terms
          </a>{' '}
          and{' '}
          <a href="#" className="underline text-primary">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
