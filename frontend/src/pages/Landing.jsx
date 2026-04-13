/* eslint-disable no-unused-vars */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, BarChart3, Users, BookOpen, Fingerprint, Shield, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { ModeToggle } from '../components/ModeToggle';

const bentoVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 overflow-x-hidden relative transition-colors duration-300">
      {/* Glow Effects - Adjusted to look good in dark and light mode automatically */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 dark:opacity-20 pointer-events-none z-0">
         <div className="absolute inset-0 bg-gradient-to-b from-primary/50 to-transparent rounded-full blur-[120px]"></div>
      </div>

      <nav className="fixed w-full bg-background/80 backdrop-blur-xl border-b border-border z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <span className="text-xl font-black text-foreground flex items-center gap-2 tracking-tight transition-colors">
              <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              SmartERP.
            </span>
            <div className="hidden md:flex gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground font-semibold transition-colors">Features</a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground font-semibold transition-colors">Customers</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground font-semibold transition-colors">Pricing</a>
            </div>
            <div className="flex gap-4 items-center">
              <ModeToggle />
              <button onClick={() => navigate('/login')} className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer">Log in</button>
              <button onClick={() => navigate('/admin')} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 cursor-pointer">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative z-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            ERP 2.0 is now live
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-foreground mb-6 leading-[1.1] transition-colors">
            Run an institute,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-purple-500">not a spreadsheet.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-medium transition-colors">
            The next-generation operating system for coaching centers. Experience AI-driven insights, automated billing, and beautiful student portals.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => navigate('/admin')} className="bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-bold text-sm tracking-wide hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2 shadow-primary/25 cursor-pointer">
              Start Building Free <ArrowRight className="w-4 h-4" />
            </button>
            <button className="bg-secondary/50 backdrop-blur-md text-secondary-foreground px-8 py-3.5 rounded-full font-bold text-sm border border-border hover:bg-secondary transition-all flex items-center justify-center hover:scale-105 shadow-sm">
              Book a Demo
            </button>
          </div>
        </motion.div>

        {/* Bento Grid Features Layout */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left"
        >
           <motion.div variants={bentoVariants} className="md:col-span-2 bg-card border border-border shadow-sm hover:shadow-md transition-shadow rounded-3xl p-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700"></div>
             <BarChart3 className="w-8 h-8 text-primary mb-6" />
             <h3 className="text-2xl font-bold text-foreground mb-2">Predictive Analytics</h3>
             <p className="text-muted-foreground font-medium leading-relaxed max-w-sm">Our AI engine analyzes attendance and fee history to flag high-risk students before they drop out.</p>
             <div className="mt-8 bg-muted/50 border border-border rounded-2xl p-4 flex gap-4 items-center shadow-inner">
                <div className="w-3 h-3 rounded-full bg-destructive ring-4 ring-destructive/20 animate-pulse"></div>
                <div>
                  <div className="h-2 w-24 bg-foreground/20 rounded-full mb-2"></div>
                  <div className="h-2 w-16 bg-foreground/10 rounded-full"></div>
                </div>
             </div>
           </motion.div>

           <motion.div variants={bentoVariants} className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow rounded-3xl p-8 group overflow-hidden relative">
             <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors duration-700"></div>
             <Fingerprint className="w-8 h-8 text-indigo-500 mb-6" />
             <h3 className="text-2xl font-bold text-foreground mb-2">Ironclad Security</h3>
             <p className="text-muted-foreground font-medium">Enterprise-grade encryption for all financial records and student identity data.</p>
           </motion.div>

           <motion.div variants={bentoVariants} className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow rounded-3xl p-8">
             <Zap className="w-8 h-8 text-yellow-500 mb-6" />
             <h3 className="text-xl font-bold text-foreground mb-2">Millisecond Fast</h3>
             <p className="text-muted-foreground font-medium">Built on modern React and Vite, the dashboard responds instantly to every click.</p>
           </motion.div>

           <motion.div variants={bentoVariants} className="md:col-span-2 bg-card border border-border shadow-sm hover:shadow-md transition-shadow rounded-3xl p-8 relative overflow-hidden group">
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
             <Shield className="w-8 h-8 text-emerald-500 mb-6 relative z-10" />
             <h3 className="text-2xl font-bold text-foreground mb-2 relative z-10">Automated Fee Collection</h3>
             <p className="text-muted-foreground font-medium relative z-10 max-w-md">Never chase a payment again. Configure installments, and let our system auto-generate ledgers and SMS reminders.</p>
           </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 mt-20 relative z-10 bg-muted/30 backdrop-blur-xl text-center transition-colors">
        <div className="flex items-center justify-center gap-2 mb-4">
           <div className="w-5 h-5 rounded bg-primary"></div>
           <span className="font-bold text-foreground tracking-tight">SmartERP.</span>
        </div>
        <p className="font-medium text-muted-foreground text-sm">© 2026 Smart Coaching. Designed for speed.</p>
      </footer>
    </div>
  );
}
