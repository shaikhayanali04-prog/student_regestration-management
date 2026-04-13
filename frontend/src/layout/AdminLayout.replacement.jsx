import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
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

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useTheme();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error(e);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300 md:flex-row">
      <aside
        className={`fixed z-30 flex h-full flex-col border-r border-border bg-card shadow-sm transition-all duration-300 md:relative ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex h-16 items-center justify-center border-b border-border">
          <span
            className={`bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-xl font-extrabold text-transparent transition-opacity duration-300 ${
              !sidebarOpen && 'hidden opacity-0'
            }`}
          >
            SmartERP<span className="font-black text-primary">.</span>
          </span>
          {!sidebarOpen ? (
            <span className="text-xl font-extrabold text-primary">
              SE<span className="text-foreground">.</span>
            </span>
          ) : null}
        </div>

        <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-6">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              location.pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center rounded-xl px-3 py-2.5 transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 font-semibold text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                title={item.name}
              >
                <Icon
                  className={`h-5 w-5 flex-shrink-0 ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                />
                <span
                  className={`ml-3 transition-opacity duration-300 ${
                    !sidebarOpen && 'hidden opacity-0'
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center rounded-xl px-3 py-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            <span
              className={`ml-3 font-medium transition-opacity duration-300 ${
                !sidebarOpen && 'hidden opacity-0'
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card/60 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-4 hidden text-muted-foreground hover:text-foreground md:flex"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="ml-2 hidden max-w-md w-full items-center sm:flex">
              <div className="group relative w-full">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search students, courses... (Ctrl+K)"
                  className="block w-full rounded-full border border-input bg-background py-2 pl-10 pr-16 leading-5 shadow-sm transition duration-200 ease-in-out placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                    Ctrl+K
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <Button
              variant="outline"
              size="sm"
              className="hidden items-center gap-2 rounded-full border-primary/20 bg-gradient-to-r from-primary/10 to-indigo-500/10 px-4 text-primary transition-all hover:bg-primary/20 sm:flex"
              onClick={() => setAiPanelOpen(true)}
            >
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold">Smart Insights</span>
            </Button>

            <ModeToggle />

            <button className="relative text-muted-foreground transition-colors hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute right-0 top-0 block h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
            </button>

            <div
              title={user?.name || 'User'}
              className="ring-background flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-primary to-indigo-500 font-bold text-primary-foreground shadow-md ring-2 transition-opacity hover:opacity-90"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name || 'User avatar'}
                  className="h-full w-full object-cover"
                />
              ) : (
                (user?.name || 'A').charAt(0).toUpperCase()
              )}
            </div>
          </div>
        </header>

        <div className="relative flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
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
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            />
          ) : null}

          {aiPanelOpen ? (
            <MotionDiv
              key="drawer"
              initial={{ x: '100%', boxShadow: '-20px 0 25px -5px rgba(0, 0, 0, 0)' }}
              animate={{ x: 0, boxShadow: '-20px 0 25px -5px rgba(0, 0, 0, 0.1)' }}
              exit={{ x: '100%', boxShadow: '-20px 0 25px -5px rgba(0, 0, 0, 0)' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-card shadow-2xl sm:w-[400px]"
            >
              <div className="flex h-16 items-center justify-between border-b border-border bg-muted/30 px-6">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-primary/10 p-1.5">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">ERP Assistant</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAiPanelOpen(false)}
                  className="rounded-full text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Top Priorities
                  </p>

                  <div className="cursor-pointer rounded-xl border border-destructive/20 bg-destructive/5 p-4 transition-all hover:bg-destructive/10">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Fee Default Risks</h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                          3 students have missed multiple installments. Suggested action:
                          Send automated SMS reminders.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 h-8 border-destructive/20 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          Review Students
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="cursor-pointer rounded-xl border border-primary/20 bg-primary/5 p-4 transition-all hover:bg-primary/10">
                    <div className="flex items-start gap-3">
                      <Activity className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Revenue Optimization</h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Converting 15 pending leads to the Data Science batch can
                          increase MRR by 12%.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Ask anything
                  </p>
                  <div className="grid gap-2">
                    <button className="flex items-center justify-between rounded-lg border border-border p-3 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5">
                      <span className="text-foreground">Show me low attendance students</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="flex items-center justify-between rounded-lg border border-border p-3 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5">
                      <span className="text-foreground">Generate monthly revenue report</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-border bg-muted/20 p-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ask the AI assistant..."
                    className="w-full rounded-full border border-input bg-background py-2.5 pl-4 pr-10 text-sm transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-primary p-1.5 text-primary-foreground transition-colors hover:bg-primary/90">
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
