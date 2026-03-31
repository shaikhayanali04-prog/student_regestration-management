import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Clock, CreditCard, User, ChevronRight, Bell, Calendar, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModeToggle } from './components/ModeToggle';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: 'Home', path: '/', icon: BookOpen },
    { name: 'Attendance', path: '/attendance', icon: Clock },
    { name: 'Fees', path: '/fees', icon: CreditCard },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-200/50 flex justify-around p-2 pb-safe z-50 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.05)] md:hidden">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;
        return (
          <button 
            key={tab.name}
            onClick={() => navigate(tab.path)}
            className="relative flex flex-col items-center justify-center w-16 h-12 transition-all"
          >
            {isActive && (
              <motion.div layoutId="nav-indicator" className="absolute -top-2 w-8 h-1 bg-blue-600 rounded-b-full shadow-[0_2px_10px_rgba(37,99,235,0.5)]" />
            )}
            <Icon className={`w-6 h-6 mb-1 transition-all duration-300 ${isActive ? 'text-blue-600 scale-110 drop-shadow-sm' : 'text-slate-400'}`} />
            <span className={`text-[10px] font-semibold transition-colors duration-300 ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
              {tab.name}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="pb-24 pt-4 px-4 w-full h-full max-w-lg mx-auto"
    >
      {children}
    </motion.div>
  );
}

function HomeTab() {
  return (
    <PageTransition>
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Morning, John</h2>
          <p className="text-sm font-medium text-muted-foreground">Let's check your agenda</p>
        </div>
        <div className="flex items-center gap-3">
          <ModeToggle />
          <div className="relative">
            <div className="w-11 h-11 bg-gradient-to-tr from-primary to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-card cursor-pointer hover:shadow-lg transition-transform">
              JD
            </div>
            <div className="absolute top-0 right-0 w-3 h-3 bg-destructive border-2 border-background rounded-full"></div>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {/* Next Class Card */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Up Next</h3>
            <button className="text-xs font-bold text-blue-600">See all</button>
          </div>
          <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl shadow-slate-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
               <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-sm">
                 <BookOpen className="w-5 h-5 text-blue-300" />
               </div>
               <div>
                 <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Physics • Batch A</p>
                 <p className="font-bold text-lg leading-tight">Thermodynamics</p>
               </div>
            </div>
            <div className="flex items-center justify-between mt-6 bg-black/20 p-3 rounded-2xl relative z-10 backdrop-blur-md border border-white/5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-300" />
                <span className="text-sm font-semibold">10:00 AM - 11:30 AM</span>
              </div>
              <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg text-white">In 45m</span>
            </div>
          </div>
        </section>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] active:scale-95 transition-transform flex flex-col justify-between h-36">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center border border-green-100/50">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold tracking-wide uppercase">Attendance</p>
              <div className="flex items-end gap-2 mt-1">
                <p className="text-3xl font-black text-slate-800 tracking-tighter">85<span className="text-lg text-slate-400">%</span></p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] active:scale-95 transition-transform flex flex-col justify-between h-36 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-20 h-20 bg-orange-50 rounded-full blur-xl -mr-10 -mt-10"></div>
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center border border-orange-100/50 relative z-10">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="relative z-10">
              <p className="text-slate-500 text-xs font-bold tracking-wide uppercase">Dues</p>
              <p className="text-3xl font-black text-slate-800 tracking-tighter mt-1">$450</p>
            </div>
          </div>
        </div>

        {/* Recent Actions List */}
        <section>
          <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase mb-3">Recent Activity</h3>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden divide-y divide-slate-50">
            <div className="p-4 flex items-center gap-4 hover:bg-slate-50 active:bg-slate-100 transition-colors">
               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100/50">
                 <Clock className="w-5 h-5" />
               </div>
               <div className="flex-1">
                 <p className="font-bold text-slate-800 text-sm">Marked Present</p>
                 <p className="text-xs text-slate-500 font-medium">Chemistry class • Yesterday</p>
               </div>
            </div>
            <div className="p-4 flex items-center gap-4 hover:bg-slate-50 active:bg-slate-100 transition-colors">
               <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center border border-green-100/50">
                 <CreditCard className="w-5 h-5" />
               </div>
               <div className="flex-1">
                 <p className="font-bold text-slate-800 text-sm">Installment Paid</p>
                 <p className="text-xs text-slate-500 font-medium">$200 processed • 4 days ago</p>
               </div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

function AttendanceTab() {
  return (
    <PageTransition>
      <h2 className="text-2xl font-black text-slate-800 mb-6">Attendance Record</h2>
      <div className="bg-emerald-500 text-white p-6 rounded-3xl shadow-lg shadow-emerald-500/20 mb-8 relative overflow-hidden text-center">
         <div className="text-sm font-bold opacity-90 uppercase tracking-widest mb-1">Overall Present</div>
         <div className="text-6xl font-black tracking-tighter">85%</div>
         <div className="mt-4 bg-black/10 rounded-full h-2 w-full overflow-hidden backdrop-blur-sm">
           <div className="h-full bg-white rounded-full w-[85%]"></div>
         </div>
      </div>
      
      <div className="space-y-4">
        {[1,2,3,4].map((i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center group active:scale-[0.98] transition-all">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center relative shadow-inner">
                 <span className="text-[10px] font-bold text-slate-400 uppercase">Oct</span>
                 <span className="text-lg font-black text-slate-800 leading-none">{10-i}</span>
               </div>
               <div>
                 <p className="font-bold text-slate-800 text-[15px]">Advanced Math</p>
                 <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3"/> 09:00 AM</p>
               </div>
            </div>
            <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-green-200">
              Present
            </div>
          </div>
        ))}
      </div>
    </PageTransition>
  );
}

function MainLayout() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20">
      <div className="md:flex h-screen overflow-hidden max-w-7xl mx-auto md:border-x border-border">
        
        {/* Desktop Sidebar Mock (hidden on mobile) */}
        <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-slate-50 p-4">
           <h1 className="font-black text-2xl bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8 px-2">StudentHub.</h1>
           <nav className="space-y-2 flex-1">
             <button onClick={() => window.location.href='/'} className="w-full text-left px-4 py-3 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center gap-3"><BookOpen className="w-5 h-5"/>Dashboard</button>
             <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-200 text-slate-600 font-bold flex items-center gap-3"><Clock className="w-5 h-5"/>Attendance</button>
             <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-200 text-slate-600 font-bold flex items-center gap-3"><CreditCard className="w-5 h-5"/>Fees</button>
           </nav>
        </aside>

        {/* Mobile View / Main Content Container */}
        <main className="flex-1 relative overflow-y-auto w-full h-full bg-background">
          <AnimatePresence mode="wait">
             <Routes location={location} key={location.pathname}>
               <Route path="/" element={<HomeTab />} />
               <Route path="/attendance" element={<AttendanceTab />} />
               <Route path="/fees" element={<div className="p-8 text-center text-slate-500 font-bold">Fees Module Under Construction</div>} />
               <Route path="/profile" element={<div className="p-8 text-center text-slate-500 font-bold">Profile Module Under Construction</div>} />
             </Routes>
          </AnimatePresence>
        </main>
        
        <BottomNav />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}
