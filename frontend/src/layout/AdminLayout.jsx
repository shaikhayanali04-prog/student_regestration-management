import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, GraduationCap, DollarSign, CalendarCheck, LogOut, Menu, Bell, Sun, Moon, Sparkles, X, ChevronRight, Activity, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useTheme } from '../components/ThemeProvider';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../services/api';
import { ModeToggle } from '../components/ModeToggle';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Students', href: '/admin/students', icon: Users },
  { name: 'Courses', href: '/admin/courses', icon: BookOpen },
  { name: 'Batches', href: '/admin/batches', icon: GraduationCap },
  { name: 'Fees', href: '/admin/fees', icon: DollarSign },
  { name: 'Attendance', href: '/admin/attendance', icon: CalendarCheck },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await api.get('/auth?action=logout');
      navigate('/login');
    } catch (e) {
      console.error(e);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside className={`bg-card border-r border-border transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'} fixed md:relative z-30 h-full shadow-sm`}>
        <div className="h-16 flex items-center justify-center border-b border-border">
          <span className={`font-extrabold text-xl bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent transition-opacity duration-300 ${!sidebarOpen && 'opacity-0 hidden'}`}>
            SmartERP<span className="text-primary font-black">.</span>
          </span>
          {!sidebarOpen && <span className="font-extrabold text-xl text-primary">SE<span className="text-foreground">.</span></span>}
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-1.5 px-3">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive ? 'bg-primary/10 text-primary font-semibold shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                title={item.name}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                <span className={`ml-3 transition-opacity duration-300 ${!sidebarOpen && 'opacity-0 hidden'}`}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl transition-colors">
            <LogOut className="w-5 h-5" />
            <span className={`ml-3 font-medium transition-opacity duration-300 ${!sidebarOpen && 'opacity-0 hidden'}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-card/60 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6 lg:px-8 z-20 sticky top-0">
          <div className="flex items-center flex-1">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-4 text-muted-foreground hover:text-foreground hidden md:flex">
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Global Search */}
            <div className="hidden sm:flex items-center max-w-md w-full ml-2">
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search students, courses... (Ctrl+K)"
                  className="block w-full pl-10 pr-12 py-2 border border-input rounded-full leading-5 bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition duration-200 ease-in-out sm:text-sm shadow-sm"
                />
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                  <span className="text-[10px] text-muted-foreground font-bold px-1.5 py-0.5 rounded border border-border bg-muted">⌘K</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-primary/10 to-indigo-500/10 border-primary/20 text-primary hover:bg-primary/20 transition-all rounded-full px-4"
              onClick={() => setAiPanelOpen(true)}
            >
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold">Smart Insights</span>
            </Button>

            <ModeToggle />

            
            <button className="text-muted-foreground hover:text-foreground relative transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
            </button>
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-primary-foreground font-bold shadow-md cursor-pointer hover:opacity-90 transition-opacity ring-2 ring-background">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
          <Outlet />
        </div>

        {/* AI Assistant Drawer Overlay */}
        <AnimatePresence>
          {aiPanelOpen && (
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setAiPanelOpen(false)}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              />
          )}
          {aiPanelOpen && (
              <motion.div
                key="drawer"
                initial={{ x: '100%', boxShadow: '-20px 0 25px -5px rgba(0, 0, 0, 0)' }}
                animate={{ x: 0, boxShadow: '-20px 0 25px -5px rgba(0, 0, 0, 0.1)' }}
                exit={{ x: '100%', boxShadow: '-20px 0 25px -5px rgba(0, 0, 0, 0)' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-card border-l border-border z-50 flex flex-col shadow-2xl"
              >
                <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-md">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="font-semibold text-lg text-foreground">ERP Assistant</h2>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setAiPanelOpen(false)} className="text-muted-foreground hover:bg-muted rounded-full">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Top Priorities</p>
                    
                    <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 transition-all hover:bg-destructive/10 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-sm text-foreground">Fee Default Risks</h4>
                          <p className="text-xs text-muted-foreground mt-1">3 students have missed multiple installments. Suggested action: Send automated SMS reminders.</p>
                          <Button variant="outline" size="sm" className="mt-3 h-8 text-xs border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                            Review Students
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 transition-all hover:bg-primary/10 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <Activity className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-sm text-foreground">Revenue Optimization</h4>
                          <p className="text-xs text-muted-foreground mt-1">Converting 15 pending leads to the 'Data Science' batch can increase MMR by 12%.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Ask anything</p>
                    <div className="grid gap-2">
                      <button className="flex items-center justify-between p-3 rounded-lg border border-border text-sm text-left hover:border-primary hover:bg-primary/5 transition-colors">
                        <span className="text-foreground">Show me low attendance students</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="flex items-center justify-between p-3 rounded-lg border border-border text-sm text-left hover:border-primary hover:bg-primary/5 transition-colors">
                        <span className="text-foreground">Generate monthly revenue report</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-border bg-muted/20">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Ask the AI assistant..." 
                      className="w-full bg-background border border-input rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
