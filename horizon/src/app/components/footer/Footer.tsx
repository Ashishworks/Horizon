'use client';

import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    // Added background, top border, and foreground text
    <footer className="bg-background text-foreground border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center">
        {/* Changed text to muted-foreground for a softer look */}
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Horizon. All rights reserved.</p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          {/* Replaced hover:text-gray-400 with hover:text-primary */}
          <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/tnc" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
          <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;