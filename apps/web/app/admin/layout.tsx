'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  Shield,
  AlertTriangle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  UserCog,
  FileText,
  DollarSign,
  Database,
  Brain,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Case Monitoring', href: '/admin/cases', icon: Shield },
  { name: 'Harm Tracking', href: '/admin/harm', icon: AlertTriangle },
  { name: 'Learning Evolution', href: '/admin/learning', icon: Brain },
  { name: 'Platform Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Technical Analytics', href: '/admin/technical', icon: Activity },
  { name: 'Document Processing', href: '/admin/documents', icon: FileText },
  { name: 'Revenue Management', href: '/admin/revenue', icon: DollarSign },
  { name: 'System Status', href: '/admin/system', icon: Database },
  { name: 'Admin Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // TEMPORARY: Set to true for testing - should be false in production
  const [isAuthorized, setIsAuthorized] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // TEMPORARILY DISABLED FOR TESTING
    // Uncomment this block for production

    // // Check if user has admin role
    // const checkAdminAccess = () => {
    //   if (!user) {
    //     router.push('/login')
    //     return
    //   }

    //   // For demo purposes, check if user email contains 'admin' or has admin role
    //   const isAdmin = user.role === 'admin' ||
    //                  user.email?.includes('admin') ||
    //                  user.isAdmin === true

    //   if (!isAdmin) {
    //     router.push('/dashboard')
    //     return
    //   }

    //   setIsAuthorized(true)
    // }

    // checkAdminAccess()
  }, [user, router])

  const handleLogout = () => {
    logout()
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-12 h-12 mx-auto text-slate-400" />
          <h1 className="text-xl font-semibold text-slate-900">Checking Admin Access...</h1>
          <p className="text-slate-600">Verifying your administrative privileges</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-md border-r border-red-200/50 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:flex lg:flex-col lg:w-64",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-red-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                <UserCog className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">DAMOCLES</span>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">ADMIN</span>
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

          {/* Admin info */}
          <div className="p-4 border-b border-red-200/50 bg-red-50/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                <UserCog className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {user?.email?.split('@')[0] || 'Admin'}
                </p>
                <p className="text-xs text-red-600 font-medium">
                  System Administrator
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-slate-700 hover:bg-red-50 hover:text-red-700"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Return to User Dashboard */}
          <div className="p-4 border-t border-red-200/50 space-y-2">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                User Dashboard
              </Button>
            </Link>
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
        <header className="lg:hidden flex items-center justify-between p-4 bg-white/95 backdrop-blur-md border-b border-red-200/50 shadow-sm sticky top-0 z-30">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
              <UserCog className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">DAMOCLES</span>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">ADMIN</span>
          </div>
          <div className="w-10" />
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