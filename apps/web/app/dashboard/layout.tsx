'use client'

import { useAuth } from '@/lib/auth-context'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Home,
  FileText,
  Shield,
  TrendingUp,
  Coins,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  UserCog,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Mine gjeld', href: '/dashboard/debts', icon: FileText },
  { name: 'PDI Health Check', href: '/dashboard/pdi', icon: Shield },
  { name: 'Recoveries', href: '/dashboard/recoveries', icon: TrendingUp },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Documents', href: '/dashboard/documents', icon: FileText },
  { name: 'Subscription', href: '/dashboard/subscription', icon: Coins },
  { name: 'Profil', href: '/dashboard/profile', icon: User },
  { name: 'Innstillinger', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Check if user has admin access
  const isAdmin = user?.role === 'admin' ||
                  user?.email?.includes('admin') ||
                  user?.isAdmin === true

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-md border-r border-slate-200/50 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:flex lg:flex-col lg:w-64",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">DAMOCLES</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-slate-600 hover:bg-slate-100"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-slate-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {user?.email?.split('@')[0] || 'Bruker'}
                </p>
                <p className="text-xs text-slate-600 capitalize">
                  {user?.shieldTier || 'bronze'} shield
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Admin Panel Access - Only for Admin Users */}
          {isAdmin && (
            <div className="p-4 border-t border-slate-200/50">
              <Link href="/admin">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-700 hover:bg-red-50 hover:text-red-700"
                >
                  <UserCog className="h-5 w-5 mr-3" />
                  Admin Panel
                </Button>
              </Link>
            </div>
          )}

          {/* Logout */}
          <div className="p-4 border-t border-slate-200/50">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logg ut
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white/95 backdrop-blur-md border-b border-slate-200/50 shadow-sm sticky top-0 z-30">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">DAMOCLES</span>
          </div>
          <div className="w-10" /> {/* Spacer for balance */}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="w-full max-w-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}