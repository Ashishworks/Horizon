'use client';

import Link from 'next/link';
import { useState } from 'react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-black">
              Horizon
            </Link>
          </div>
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="text-gray-700 hover:text-gray-900">Home</Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900">About</Link>
            <Link href="/services" className="text-gray-700 hover:text-gray-900">Services</Link>
            <Link href="/contact" className="text-gray-700 hover:text-gray-900">Contact</Link>
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white px-2 pt-2 pb-3 space-y-1 shadow-md">
          <Link href="/" className="block text-gray-700 hover:text-gray-900">Home</Link>
          <Link href="/about" className="block text-gray-700 hover:text-gray-900">About</Link>
          <Link href="/services" className="block text-gray-700 hover:text-gray-900">Services</Link>
          <Link href="/contact" className="block text-gray-700 hover:text-gray-900">Contact</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
