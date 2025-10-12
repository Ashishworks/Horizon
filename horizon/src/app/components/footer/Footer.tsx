'use client';

import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} Horizon. All rights reserved.</p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <Link href="/privacy-policy" className="hover:text-gray-400">Privacy Policy</Link>
          <Link href="/tnc" className="hover:text-gray-400">Terms of Service</Link>
          <Link href="/contact" className="hover:text-gray-400">Contact</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
