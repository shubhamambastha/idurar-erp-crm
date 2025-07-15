/**
 * Layout Component
 * 
 * Main layout wrapper providing consistent navigation and footer
 * across all pages of the application
 */

import Link from 'next/link';
import { ReactNode } from 'react';
import { PAGE_ROUTES } from '@/utils/constants';

interface LayoutProps {
  /** Page content to be rendered */
  children: ReactNode;
}

/**
 * Navigation link configuration
 */
const navLinks = [
  { href: PAGE_ROUTES.PROJECTS, label: 'Projects' },
  { href: PAGE_ROUTES.PROJECT_NEW, label: 'Add Project' },
] as const;

/**
 * Main layout component with header navigation and footer
 */
export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Navigation */}
      <header>
        <nav className="bg-white shadow-sm border-b border-gray-200" role="navigation">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                {/* Logo/Brand */}
                <Link 
                  href={PAGE_ROUTES.HOME} 
                  className="text-xl font-semibold text-gray-900 hover:text-gray-700 transition-colors"
                >
                  Projects CRUD
                </Link>
                
                {/* Desktop Navigation */}
                <nav className="hidden sm:ml-6 sm:flex sm:space-x-8" aria-label="Main navigation">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
              
              {/* Mobile menu button (placeholder for future implementation) */}
              <div className="sm:hidden">
                {/* TODO: Implement mobile menu toggle */}
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1" role="main">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200" role="contentinfo">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Projects CRUD Application</p>
        </div>
      </footer>
    </div>
  );
}