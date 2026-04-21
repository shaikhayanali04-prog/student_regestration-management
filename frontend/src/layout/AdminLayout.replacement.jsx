import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  CalendarCheck,
  UserRound,
  LogOut,
  Menu,
  Bell,
  Sparkles,
  X,
  ChevronRight,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { useTheme } from '../components/ThemeProvider';
import { useAuth } from '../context/AuthContext';
import { ModeToggle } from '../components/ModeToggle';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Students', href: '/admin/students', icon: Users },
  { name: 'Courses', href: '/admin/courses', icon: BookOpen },
  { name: 'Batches', href: '/admin/batches', icon: GraduationCap },
  { name: 'Fees', href: '/admin/fees', icon: DollarSign },
  { name: 'Attendance', href: '/admin/attendance', icon: CalendarCheck },
  { name: 'Faculty', href: '/admin/faculty', icon: UserRound },
];

const MotionDiv = motion.div;

const pageGroups = [
  {
    match: (pathname) => pathname === '/admin' || pathname === '/admin/',
    title: 'Dashboard',
    description: 'Operational overview and daily pulse',
  },
  {
    match: (pathname) => pathname.startsWith('/admin/students'),
    title: 'Students',
    description: 'Admissions, profiles, and student operations',
  },
  {
    match: (pathname) => pathname.startsWith('/admin/courses'),
    title: 'Courses',
    description: 'Programs, pricing, and curriculum structure',
  },
  {
    match: (pathname) => pathname.startsWith('/admin/batches'),
    title: 'Batches',
    description: 'Schedules, capacity, and batch coordination',
  },
  {
    match: (pathname) => pathname.startsWith('/admin/fees'),
    title: 'Fees',
    description: 'Collections, dues, and payment records',
  },
  {
    match: (pathname) => pathname.startsWith('/admin/attendance'),
    title: 'Attendance',
    description: 'Daily marking, trends, and follow-up',
  },
  {
    match: (pathname) => pathname.startsWith('/admin/faculty'),
    title: 'Faculty',
    description: 'Teaching staff and batch ownership',
  },
];

const getPageMeta = (pathname) =>
  pageGroups.find((group) => group.match(pathname)) || {
    title: 'Smart Coaching ERP',
    description: 'Institute operations',
  };

const getInitials = (name) =>
  (name || 'Admin')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useTheme();
  const { user, logout } = useAuth();
  const pageMeta = getPageMeta(location.pathname);
  const userInitials = getInitials(user?.name);
  const compactSidebar = sidebarCollapsed && !sidebarOpen;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error(e);
      navigate('/login');
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground transition-colors duration-300 md:flex-row">
      <AnimatePresence>
        {sidebarOpen ? (
          <MotionDiv
            key="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 z-20 bg-slate-950/30 backdrop-blur-sm md:hidden"
          />
        ) : null}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex h-full flex-col border-r border-border bg-card shadow-sm transition-all duration-200 md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarOpen ? 'w-[240px]' : compactSidebar ? 'w-16 md:w-16' : 'w-[240px] md:w-[240px]'}`}
      >
        <div className="flex h-16 items-center border-b border-border px-4">
          <Link
            to="/"
            onClick={closeSidebar}
            className={`flex items-center gap-3 ${compactSidebar ? 'justify-center' : ''}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-indigo-500 to-sky-400 text-sm font-bold text-white shadow-glow">
              SC
            </div>
            {!compactSidebar ? (
              <div className="min-w-0">
                <p className="truncate font-display text-base font-bold tracking-tight text-text-primary">
                  Smart Coaching
                </p>
                <p className="text-xs font-medium text-text-secondary">ERP Console</p>
              </div>
            ) : null}
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-5">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              location.pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeSidebar}
                className={`group mx-2 flex items-center rounded-lg py-2.5 text-sm transition-all duration-200 ${
                  compactSidebar ? 'justify-center px-0' : 'gap-3 px-3'
                } ${
                  isActive
                    ? 'border-l-2 border-primary bg-primary/10 font-medium text-primary'
                    : 'border-l-2 border-transparent text-text-secondary hover:bg-primary/5 hover:text-primary'
                }`}
                title={item.name}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!compactSidebar ? <span>{item.name}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div
            className={`rounded-2xl border border-border bg-surface-muted shadow-sm ${
              compactSidebar ? 'flex justify-center p-2.5' : 'space-y-3 p-3'
            }`}
          >
            <div className={`flex items-center ${compactSidebar ? 'justify-center' : 'gap-3'}`}>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-500 font-semibold text-white shadow-sm">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user?.name || 'User avatar'}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  userInitials
                )}
              </div>

              {!compactSidebar ? (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {user?.name || 'Admin User'}
                    </p>
                    <p className="truncate text-xs text-text-secondary">
                      {(user?.role || 'Admin').toUpperCase()}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              ) : null}
            </div>

            {!compactSidebar ? (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-primary" />
                  <span>View landing page</span>
                </div>
                <Link to="/" onClick={closeSidebar} className="font-medium text-primary">
                  Open
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </aside>

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-border bg-card/95 px-4 shadow-sm backdrop-blur-sm sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSidebarCollapsed(false);
                setSidebarOpen(true);
              }}
              className="rounded-full md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed((current) => !current)}
              className="hidden rounded-full md:inline-flex"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                Smart Coaching ERP
              </p>
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="truncate font-display text-lg font-semibold tracking-tight text-text-primary">
                  {pageMeta.title}
                </h1>
                <div className="hidden items-center gap-2 text-xs text-text-secondary sm:flex">
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="truncate">{pageMeta.description}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="hidden lg:inline-flex"
            >
              <Link to="/">
                <Home className="h-4 w-4" />
                View Site
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => setAiPanelOpen(true)}
            >
              <Sparkles className="h-4 w-4" />
              <span>Smart Insights</span>
            </Button>

            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-text-secondary shadow-sm transition-colors hover:text-primary"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2.5 top-2.5 block h-2 w-2 rounded-full bg-accent" />
            </button>

            <ModeToggle />

            <div className="hidden items-center gap-3 rounded-full border border-border bg-card px-2.5 py-1.5 shadow-sm sm:flex">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-indigo-500 font-semibold text-white">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user?.name || 'User avatar'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  userInitials
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-primary">
                  {user?.name || 'Admin User'}
                </p>
                <p className="truncate text-xs text-text-secondary">
                  {(user?.role || 'Admin').toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="relative flex-1 overflow-auto bg-background px-4 py-4 sm:px-6 sm:py-6">
          <Outlet />
        </div>

        <AnimatePresence>
          {aiPanelOpen ? (
            <MotionDiv
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAiPanelOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm"
            />
          ) : null}

          {aiPanelOpen ? (
            <MotionDiv
              key="drawer"
              initial={{ x: 36, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 36, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-card shadow-2xl sm:w-[400px]"
            >
              <div className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                      Assistant
                    </p>
                    <h2 className="font-display text-lg font-semibold text-text-primary">
                      ERP AI Assistant
                    </h2>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAiPanelOpen(false)}
                  className="rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto p-6">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-secondary">
                    Top Priorities
                  </p>

                  <div className="rounded-2xl border border-red-100 bg-red-50 p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-display text-base font-semibold text-text-primary">
                          Fee Default Risks
                        </h4>
                        <p className="mt-1 text-sm leading-6 text-text-secondary">
                          3 students have missed multiple installments. Suggested action:
                          send automated reminders today.
                        </p>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="mt-3"
                        >
                          Review Students
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-display text-base font-semibold text-text-primary">
                          Revenue Optimization
                        </h4>
                        <p className="mt-1 text-sm leading-6 text-text-secondary">
                          Converting 15 pending leads to the Data Science batch can
                          increase MRR by 12%.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-secondary">
                    Ask anything
                  </p>
                  <div className="grid gap-2">
                    <button className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3 text-left text-sm text-text-primary shadow-sm transition-colors hover:border-primary/20 hover:bg-primary/5">
                      <span>Show me low attendance students</span>
                      <ChevronRight className="h-4 w-4 text-text-secondary" />
                    </button>
                    <button className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3 text-left text-sm text-text-primary shadow-sm transition-colors hover:border-primary/20 hover:bg-primary/5">
                      <span>Generate monthly revenue report</span>
                      <ChevronRight className="h-4 w-4 text-text-secondary" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 bg-slate-50 p-4">
                <div className="search-shell overflow-hidden rounded-full bg-white pr-2">
                  <input
                    type="text"
                    placeholder="Ask the AI assistant..."
                    className="h-11 flex-1 border-0 bg-transparent px-4 text-sm text-text-primary focus:outline-none focus:ring-0"
                  />
                  <button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90">
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </MotionDiv>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}
