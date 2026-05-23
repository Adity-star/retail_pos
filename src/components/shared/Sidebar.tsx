// src/components/shared/Sidebar.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Users,
  TrendingUp,
  Settings,
  ChevronDown,
  Barcode,
  PackagePlus,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  user: {
    name: string;
    role: string;
  };
}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: {
    title: string;
    href: string;
  }[];
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Inventory',
    icon: Package,
    children: [
      { title: 'Products', href: '/inventory/products' },
      { title: 'Categories', href: '/inventory/categories' },
      { title: 'Stock Report', href: '/inventory/stock-report' },
    ],
  },
  {
    title: 'Sales Barcode',
    href: '/billing',
    icon: Barcode,
  },
  {
    title: 'Purchase Entry',
    href: '/purchase',
    icon: PackagePlus,
  },
  {
    title: 'Reports',
    icon: FileText,
    children: [
      { title: 'Sales Report', href: '/reports/sales' },
      { title: 'Item-wise Report', href: '/reports/items' },
      { title: 'Purchase Report', href: '/reports/purchases' },
      { title: 'Profit Report', href: '/reports/profit' },
    ],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Inventory', 'Reports']);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">JU</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Just Uniform</h1>
            <p className="text-slate-400 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => (
            <div key={item.title}>
              {item.children ? (
                // Parent with children
                <div>
                  <button
                    onClick={() => toggleExpanded(item.title)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                      'text-slate-300 hover:bg-slate-700 hover:text-white'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 transition-transform',
                        expandedItems.includes(item.title) && 'rotate-180'
                      )}
                    />
                  </button>
                  {expandedItems.includes(item.title) && (
                    <div className="mt-1 ml-6 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            'block px-3 py-2 text-sm rounded-lg transition-colors',
                            pathname === child.href
                              ? 'bg-blue-600 text-white font-medium'
                              : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                          )}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Direct link
                <Link
                  href={item.href!}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                    pathname === item.href
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* User info */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900 border-b border-slate-700 flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
        <div className="ml-3 flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">JU</span>
          </div>
          <span className="text-white font-bold">Just Uniform</span>
        </div>
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-64 bg-slate-900 z-50 flex flex-col">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 border-r border-slate-700">
        <SidebarContent />
      </aside>
    </>
  );
}