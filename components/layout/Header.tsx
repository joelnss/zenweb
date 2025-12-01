'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              PC
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">P.C. Resource</div>
              <div className="text-xs text-gray-500 -mt-1">IT Services</div>
            </div>
          </Link>

          {/* Desktop Navigation - Placeholder (disabled for now) */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 text-gray-600">
              <span className="cursor-not-allowed opacity-50">Services</span>
              <span className="cursor-not-allowed opacity-50">Products</span>
              <span className="cursor-not-allowed opacity-50">Partners</span>
              <span className="cursor-not-allowed opacity-50">Resources</span>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium cursor-not-allowed opacity-50">
                Log In
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg shadow-md cursor-not-allowed opacity-50">
                Get Started
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
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

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
            <div className="flex flex-col gap-4 text-gray-600">
              <span className="cursor-not-allowed opacity-50">Services</span>
              <span className="cursor-not-allowed opacity-50">Products</span>
              <span className="cursor-not-allowed opacity-50">Partners</span>
              <span className="cursor-not-allowed opacity-50">Resources</span>
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                <button className="px-4 py-2 text-gray-700 font-medium cursor-not-allowed opacity-50 text-left">
                  Log In
                </button>
                <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg shadow-md cursor-not-allowed opacity-50">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
