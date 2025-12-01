'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useTheme } from '@/lib/theme/theme-context';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  // Helper to check if a path is active
  const isActive = (path: string) => pathname === path;

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-sm border-b transition-colors ${
      theme === 'dark'
        ? 'bg-gray-950/95 border-white/10'
        : 'bg-white/95 border-gray-200'
    }`}>
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
              <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                <defs>
                  <linearGradient id="header-z-grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4fe7f3" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#8c5eff" stopOpacity="0.3"/>
                  </linearGradient>
                  <linearGradient id="header-z-grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4fe7f3" stopOpacity="0.6"/>
                    <stop offset="100%" stopColor="#8c5eff" stopOpacity="0.6"/>
                  </linearGradient>
                  <linearGradient id="header-z-grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4fe7f3"/>
                    <stop offset="50%" stopColor="#8c5eff"/>
                    <stop offset="100%" stopColor="#c938e7"/>
                  </linearGradient>
                </defs>
                {/* Back Z - faint */}
                <path d="M5 7h14v2H10l9 6v2H5v-2h9L5 9V7z" fill="url(#header-z-grad1)"/>
                {/* Middle Z */}
                <path d="M8 11h14v2H13l9 6v2H8v-2h9L8 13V11z" fill="url(#header-z-grad2)"/>
                {/* Front Z - brightest */}
                <path d="M11 15h14v2H16l9 6v2H11v-2h9l-9-6v-2z" fill="url(#header-z-grad3)"/>
              </svg>
            </div>
            <div>
              <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Zenweb
              </div>
              <div className={`text-xs -mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                High Performance eCommerce
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Main CMS Pages */}
            <div className="flex items-center gap-5">
              <Link href="/about" className={`relative font-medium transition-colors ${
                isActive('/about')
                  ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                  : theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-500 hover:text-gray-900'
              }`}>
                About Us
                {isActive('/about') && (
                  <span className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full ${
                    theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-600'
                  }`} />
                )}
              </Link>
              <Link href="/services/aws" className={`relative font-medium transition-colors ${
                isActive('/services/aws')
                  ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                  : theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-500 hover:text-gray-900'
              }`}>
                AWS
                {isActive('/services/aws') && (
                  <span className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full ${
                    theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-600'
                  }`} />
                )}
              </Link>
              <Link href="/services" className={`relative font-medium transition-colors ${
                isActive('/services')
                  ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                  : theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-500 hover:text-gray-900'
              }`}>
                Services
                {isActive('/services') && (
                  <span className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full ${
                    theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-600'
                  }`} />
                )}
              </Link>
              <Link href="/hosting" className={`relative font-medium transition-colors ${
                isActive('/hosting')
                  ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                  : theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-500 hover:text-gray-900'
              }`}>
                Hosting
                {isActive('/hosting') && (
                  <span className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full ${
                    theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-600'
                  }`} />
                )}
              </Link>
            </div>

            {/* CTA Button - Simple text link */}
            <Link
              href="/start-project"
              className={`relative font-medium transition-colors ${
                isActive('/start-project')
                  ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                  : theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Start a Project
              {isActive('/start-project') && (
                <span className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full ${
                  theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-600'
                }`} />
              )}
            </Link>

            {/* Divider */}
            <div className={`h-6 w-px ${theme === 'dark' ? 'bg-white/20' : 'bg-gray-300'}`} />

            {/* Support Ticket Link */}
            <Link
              href="/portal"
              className={`relative flex items-center gap-2 font-medium transition-colors ${
                isActive('/portal')
                  ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                  : theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Support Ticket
              {isActive('/portal') && (
                <span className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full ${
                  theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-600'
                }`} />
              )}
            </Link>

            {/* Divider */}
            <div className={`h-6 w-px ${theme === 'dark' ? 'bg-white/20' : 'bg-gray-300'}`} />

            {/* User Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  theme === 'dark'
                    ? 'text-yellow-400 hover:bg-white/10'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`relative flex items-center gap-2 px-3 py-2 font-medium rounded-lg transition-colors ${
                      isActive('/dashboard')
                        ? theme === 'dark' ? 'text-white bg-white/10' : 'text-gray-900 bg-gray-100'
                        : theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Dashboard
                    {isActive('/dashboard') && (
                      <span className={`absolute -bottom-0.5 left-3 right-3 h-0.5 rounded-full ${
                        theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-600'
                      }`} />
                    )}
                  </Link>
                  <button
                    onClick={logout}
                    className={`px-3 py-2 font-medium rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                        : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className={`relative flex items-center gap-2 px-3 py-2 font-medium rounded-lg transition-colors ${
                    isActive('/login')
                      ? theme === 'dark' ? 'text-white bg-white/10' : 'text-gray-900 bg-gray-100'
                      : theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Login
                  {isActive('/login') && (
                    <span className={`absolute -bottom-0.5 left-3 right-3 h-0.5 rounded-full ${
                      theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-600'
                    }`} />
                  )}
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${
                theme === 'dark'
                  ? 'text-yellow-400 hover:bg-white/10'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden mt-4 pb-4 border-t pt-4 ${
            theme === 'dark' ? 'border-white/10' : 'border-gray-200'
          }`}>
            <div className="flex flex-col gap-1">
              {/* CMS Pages */}
              <p className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`}>Pages</p>
              <Link
                href="/about"
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/services/aws"
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                AWS
              </Link>
              <Link
                href="/services"
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/hosting"
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Hosting
              </Link>

              {/* Actions */}
              <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                <p className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>Actions</p>
                <Link
                  href="/start-project"
                  className={`mx-4 mt-1 mb-2 px-4 py-3 rounded-lg font-medium text-center block transition-all ${
                    theme === 'dark'
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start a Project
                </Link>
                <Link
                  href="/portal"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  Support Ticket
                </Link>
              </div>

              {/* Account */}
              <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                <p className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>Account</p>
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                        theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium text-left transition-colors ${
                        theme === 'dark' ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Log In / Sign Up
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
