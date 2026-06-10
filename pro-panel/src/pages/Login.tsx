// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(() => db.getProfile().email);
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === db.getProfile().email && password === 'password') {
      navigate('/');
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="bg-background text-on-background font-sans min-h-screen flex items-center justify-center relative overflow-hidden">
      
      {/* Spiritual Accent: Subtle Mandala Watermark */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-5 text-secondary">
        <svg 
          className="w-[800px] h-[800px] md:w-[1000px] md:h-[1000px]" 
          fill="none" 
          height="800" 
          viewBox="0 0 100 100" 
          width="800" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M50 0C50 0 55 40 100 50C100 50 60 55 50 100C50 100 45 60 0 50C0 50 40 45 50 0Z" stroke="currentColor" strokeWidth="0.5"></path>
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeDasharray="2 2" strokeWidth="0.5"></circle>
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.5"></circle>
          <circle cx="50" cy="50" r="15" stroke="currentColor" strokeDasharray="1 3" strokeWidth="0.5"></circle>
          <path d="M50 20L55 45L80 50L55 55L50 80L45 55L20 50L45 45L50 20Z" stroke="currentColor" strokeWidth="0.5"></path>
        </svg>
      </div>

      {/* Login Card Container */}
      <main className="w-full max-w-[440px] px-4 md:px-0 relative z-10">
        <div className="bg-surface-container-lowest rounded-[12px] soft-shadow p-8 md:p-10 border border-outline-variant/30 flex flex-col items-center">
          
          {/* Brand Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center text-primary mb-4 border border-outline-variant/30">
              <span className="material-symbols-outlined text-headline-lg flex items-center justify-center" style={{ fontVariationSettings: "'FILL' 1" }}>
                temple_hindu
              </span>
            </div>
            <h1 className="font-display text-headline-md text-primary tracking-tight font-bold">Doshanivarana</h1>
            <p className="font-sans text-label-md text-on-surface-variant uppercase tracking-wider mt-1">Digital Temple Services</p>
          </div>

          <div className="w-full mb-8">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="h-px bg-outline-variant flex-1"></div>
              <div className="w-2 h-2 rotate-45 bg-secondary/30"></div>
              <div className="h-px bg-outline-variant flex-1"></div>
            </div>
            <h2 className="font-display text-headline-sm text-on-surface text-center font-bold">PRO Panel Login</h2>
          </div>

          {/* Login Form */}
          <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
            
            {/* Error Message Banner */}
            {error && (
              <div className="bg-error-container text-on-error-container font-sans text-body-sm p-3 rounded-lg flex items-start gap-2 border border-error/20">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-label-md text-on-surface font-semibold" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                  mail
                </span>
                <input 
                  className="w-full h-12 bg-surface border border-outline-variant rounded-lg pl-11 pr-4 font-sans text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
                  id="email" 
                  name="email" 
                  placeholder="Enter your email" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-label-md text-on-surface font-semibold" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                  lock
                </span>
                <input 
                  className="w-full h-12 bg-surface border border-outline-variant rounded-lg pl-11 pr-11 font-sans text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
                  id="password" 
                  name="password" 
                  placeholder="Enter your password" 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none cursor-pointer" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <a 
                  className="font-sans text-body-sm text-primary hover:text-primary-container transition-colors font-semibold" 
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot Password?
                </a>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button 
                className="w-full h-12 bg-primary text-on-primary font-sans text-button rounded-full hover:bg-surface-tint shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer font-bold" 
                type="submit"
              >
                <span>Login</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

          </form>

          {/* Footer Note */}
          <div className="mt-8 text-center">
            <p className="font-sans text-body-sm text-on-surface-variant/70">
              Secure access for authorized PRO personnel only.
            </p>
          </div>

        </div>
      </main>

    </div>
  );
}
