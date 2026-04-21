import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookMarked,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Users2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ModeToggle } from '../components/ModeToggle';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';

const heroStats = [
  { label: 'Institutes ready to scale', value: '1 workspace' },
  { label: 'Operational modules live', value: 'Students to attendance' },
  { label: 'Admin time saved', value: 'Hours every week' },
];

const featureCards = [
  {
    icon: Users2,
    title: 'Student lifecycle management',
    description:
      'Admissions, profile history, parent contacts, status tracking, and batch assignment live in one connected workspace.',
  },
  {
    icon: CreditCard,
    title: 'Fee operations with dues visibility',
    description:
      'Track total fees, installments, pending balances, receipts, and collection performance without spreadsheet chasing.',
  },
  {
    icon: CalendarClock,
    title: 'Attendance that stays actionable',
    description:
      'Mark batch-wise attendance, review history, and surface low-attendance risk before it becomes a problem.',
  },
  {
    icon: BrainCircuit,
    title: 'AI-supported admin insights',
    description:
      'Turn raw institute data into reminders, revenue summaries, and risk flags your team can actually act on.',
  },
];

const modules = [
  'Students and student profiles',
  'Courses and subject structure',
  'Batches with capacity and schedule',
  'Fees, installments, and receipts',
  'Attendance tracking and reports',
  'Faculty and future portal groundwork',
];

const testimonials = [
  {
    quote:
      'The dashboard finally feels like an institute control room, not a collection of pages.',
    name: 'Operations Admin',
    role: 'Coaching Center Team',
  },
  {
    quote:
      'Students, batches, fees, and attendance now connect properly, which is what we always needed from day one.',
    name: 'Academic Coordinator',
    role: 'Training Institute',
  },
];

const pricingCards = [
  {
    tier: 'Starter',
    price: 'Perfect for demo and portfolio',
    description: 'Use SmartERP as a polished institute management showcase with real business flows.',
    points: ['Landing + login', 'Students, courses, batches', 'Fees and attendance', 'Modern admin UI'],
  },
  {
    tier: 'Growth',
    price: 'Built for live institute operations',
    description: 'Extend the existing foundation into a deployable SaaS MVP with roles, reports, and automation.',
    points: ['Role-based access', 'Analytics and alerts', 'Faculty and exams modules', 'Future parent/student portal'],
  },
];

const workspaceCards = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    description: 'Open the live command center with analytics, alerts, and operational summaries.',
    path: '/admin',
  },
  {
    icon: Users2,
    title: 'Students',
    description: 'Manage admissions, student profiles, filters, and full CRUD workflows.',
    path: '/admin/students',
  },
  {
    icon: BookMarked,
    title: 'Courses',
    description: 'Create and organize course offerings, subjects, status, and live enrollment context.',
    path: '/admin/courses',
  },
  {
    icon: GraduationCap,
    title: 'Batches',
    description: 'Handle batch planning, course assignments, faculty ownership, and capacity tracking.',
    path: '/admin/batches',
  },
  {
    icon: CreditCard,
    title: 'Fees',
    description: 'Track fee ledgers, installments, dues, receipts, and collection visibility.',
    path: '/admin/fees',
  },
  {
    icon: CalendarClock,
    title: 'Attendance',
    description: 'Mark attendance batch-wise and review daily history, summaries, and alerts.',
    path: '/admin/attendance',
  },
];

const MotionSection = motion.section;
const MotionDiv = motion.div;

function scrollToSection(sectionId) {
  const section = window.document.getElementById(sectionId);

  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, authLoading } = useAuth();

  const openWorkspace = useCallback(
    (pathname) => {
      if (authLoading) {
        return;
      }

      if (isAuthenticated) {
        navigate(pathname);
        return;
      }

      navigate('/login', { state: { from: { pathname } } });
    },
    [authLoading, isAuthenticated, navigate],
  );

  const primaryCta = useMemo(() => {
    if (authLoading) {
      return {
        label: 'Preparing workspace',
        onClick: () => {},
      };
    }

    if (isAuthenticated) {
      return {
        label: `Continue as ${user?.name || 'Admin'}`,
        onClick: () => openWorkspace('/admin'),
      };
    }

    return {
      label: 'Start with secure login',
      onClick: () => openWorkspace('/admin'),
    };
  }, [authLoading, isAuthenticated, openWorkspace, user?.name]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[520px] w-[980px] -translate-x-1/2 rounded-full bg-primary/20 blur-[160px]" />
        <div className="absolute -left-24 top-1/3 h-[320px] w-[320px] rounded-full bg-fuchsia-500/10 blur-[140px]" />
        <div className="absolute right-0 top-20 h-[420px] w-[420px] rounded-full bg-indigo-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_28%),linear-gradient(to_bottom,transparent,rgba(0,0,0,0.16))]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.06)_1px,transparent_1px)] bg-[size:44px_44px] opacity-20" />
      </div>

      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/85 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-primary/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Smart Coaching ERP
              </p>
              <p className="text-lg font-black tracking-tight text-foreground">SMARTERP</p>
            </div>
          </button>

          <nav className="hidden items-center gap-2 rounded-full border border-border/70 bg-card/60 p-1 md:flex">
            {[
              ['workspace', 'Workspace'],
              ['features', 'Features'],
              ['customers', 'Customers'],
              ['pricing', 'Pricing'],
            ].map(([sectionId, label]) => (
              <button
                key={sectionId}
                type="button"
                onClick={() => scrollToSection(sectionId)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ModeToggle />
            <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => navigate('/login')}>
              Log In
            </Button>
            <Button
              className="rounded-full px-5 shadow-lg shadow-primary/20"
              onClick={primaryCta.onClick}
              disabled={authLoading}
            >
              {primaryCta.label}
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <MotionSection
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr,0.95fr] lg:items-center lg:px-8 lg:pb-28 lg:pt-24"
        >
          <div>
            <Badge className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-primary">
              Premium ERP SaaS for coaching institutes
            </Badge>

            <h1 className="mt-8 text-5xl font-black tracking-[-0.04em] text-foreground sm:text-6xl xl:text-7xl">
              Run admissions, fees, batches, and attendance from one
              <span className="block bg-gradient-to-r from-primary via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
                premium operating system.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              SMARTERP helps coaching classes and training centers move beyond scattered
              files and static dashboards. Your team gets one polished workspace for
              operations, analytics, and decision-making.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="rounded-full px-8 text-sm font-semibold shadow-[0_24px_80px_rgba(99,102,241,0.35)]"
                onClick={primaryCta.onClick}
                disabled={authLoading}
              >
                {primaryCta.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-border/70 bg-background/60 px-8 text-sm font-semibold backdrop-blur"
                onClick={() => scrollToSection('workspace')}
              >
                Explore Live Modules
              </Button>
            </div>

            {!authLoading ? (
              <p className="mt-5 text-sm leading-6 text-muted-foreground">
                {isAuthenticated
                  ? 'Your session is active. The landing page can now open the real ERP modules directly.'
                  : 'Browse the public site first, then jump into any module through secure login.'}
              </p>
            ) : null}

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <Card
                  key={stat.label}
                  className="rounded-[28px] border-border/70 bg-card/60 shadow-xl shadow-black/5 backdrop-blur"
                >
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-3 text-lg font-black text-foreground">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <MotionDiv
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.08 }}
            className="relative overflow-hidden rounded-[36px] border border-border/70 bg-card/75 p-6 shadow-[0_32px_120px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-7"
          >
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-primary/20 via-indigo-500/10 to-fuchsia-500/20 blur-3xl" />

            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  Live institute pulse
                </p>
                <h2 className="mt-2 text-2xl font-black text-foreground">Operational overview</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <LayoutDashboard className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-border/70 bg-background/70 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Today&apos;s focus</p>
                    <p className="mt-2 text-xl font-black text-foreground">Pending fees</p>
                  </div>
                  <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-500">
                    <CreditCard className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  Surface due payments, late installments, and collection follow-ups from one dashboard.
                </p>
              </div>

              <div className="rounded-[28px] border border-border/70 bg-background/70 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Batch status</p>
                    <p className="mt-2 text-xl font-black text-foreground">Attendance alerts</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-500">
                    <CalendarClock className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  Review attendance trends, low-attendance students, and daily batch completion without delays.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[30px] border border-border/70 bg-background/70 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Included workflow stack</p>
                  <p className="mt-2 text-2xl font-black text-foreground">Students, courses, batches, fees, attendance</p>
                </div>
                <Badge className="rounded-full bg-primary/10 px-4 py-2 text-primary">Production-style UI</Badge>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {modules.map((module) => (
                  <div key={module} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/60 px-4 py-3">
                    <div className="mt-0.5 rounded-2xl bg-primary/10 p-2 text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{module}</p>
                  </div>
                ))}
              </div>
            </div>
          </MotionDiv>
        </MotionSection>

        <section id="workspace" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-primary">Merged Product Flow</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight text-foreground">
                From the landing page, you can now enter the real ERP modules.
              </h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                This is no longer a separate marketing shell. Each card below opens the working app,
                or sends you through secure login and returns you to the exact module you chose.
              </p>
            </div>

            <Button
              variant="outline"
              className="rounded-full border-border/70 px-6"
              onClick={() => openWorkspace('/admin')}
              disabled={authLoading}
            >
              Open full workspace
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {workspaceCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <MotionDiv
                  key={card.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                >
                  <Card className="h-full rounded-[30px] border-border/70 bg-card/70 shadow-lg shadow-black/5 backdrop-blur">
                    <CardContent className="flex h-full flex-col p-7">
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-6 text-2xl font-black text-foreground">{card.title}</h3>
                      <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
                        {card.description}
                      </p>
                      <Button
                        variant="outline"
                        className="mt-6 w-full rounded-2xl border-border/70"
                        onClick={() => openWorkspace(card.path)}
                        disabled={authLoading}
                      >
                        {isAuthenticated ? 'Open module' : 'Login and open'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </MotionDiv>
              );
            })}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-primary">Features</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-foreground">
              Built for the real day-to-day rhythm of coaching operations.
            </h2>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              The landing page now reflects the actual application direction, so visitors
              can understand what the product does and move into the live ERP flow with confidence.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {featureCards.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <MotionDiv
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                >
                  <Card className="h-full rounded-[30px] border-border/70 bg-card/70 shadow-lg shadow-black/5 backdrop-blur">
                    <CardContent className="p-7">
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-6 text-2xl font-black text-foreground">{feature.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </MotionDiv>
              );
            })}
          </div>
        </section>

        <section id="customers" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-primary">Customers</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight text-foreground">
                Designed to feel like a product teams would actually adopt.
              </h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                We&apos;re keeping the premium SaaS language, but grounding it in the workflows
                that coaching institutes really need to run every day.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  { icon: GraduationCap, label: 'Admissions and student journey' },
                  { icon: BookMarked, label: 'Course and batch operations' },
                  { icon: BarChart3, label: 'Reports, trends, and revenue visibility' },
                  { icon: MessageSquareText, label: 'Notices, reminders, and AI support' },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/60 px-4 py-3">
                      <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-5">
              {testimonials.map((item) => (
                <Card
                  key={item.name}
                  className="rounded-[30px] border-border/70 bg-card/70 shadow-lg shadow-black/5 backdrop-blur"
                >
                  <CardContent className="p-7">
                    <p className="text-lg font-semibold leading-8 text-foreground">&ldquo;{item.quote}&rdquo;</p>
                    <div className="mt-6 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.role}</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-[40px] border border-border/70 bg-card/70 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.18)] backdrop-blur xl:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-primary">Pricing mindset</p>
                <h2 className="mt-4 text-4xl font-black tracking-tight text-foreground">
                  Positioned like a SaaS product, ready for portfolio or MVP growth.
                </h2>
                <p className="mt-4 text-base leading-8 text-muted-foreground">
                  This section is here to make the landing page feel complete and useful, not like a half-linked mockup.
                </p>
              </div>
              <Button variant="outline" className="rounded-full border-border/70 px-6" onClick={() => openWorkspace('/admin')}>
                Open secure login
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {pricingCards.map((card) => (
                <Card
                  key={card.tier}
                  className="rounded-[30px] border-border/70 bg-background/65 shadow-lg shadow-black/5"
                >
                  <CardContent className="p-7">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                      {card.tier}
                    </p>
                    <h3 className="mt-3 text-2xl font-black text-foreground">{card.price}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{card.description}</p>
                    <div className="mt-6 space-y-3">
                      {card.points.map((point) => (
                        <div key={point} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                          <p className="text-sm leading-6 text-muted-foreground">{point}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[40px] border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-card p-8 shadow-[0_30px_120px_rgba(0,0,0,0.2)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Ready to move inside?</p>
                <h2 className="mt-4 text-4xl font-black tracking-tight text-foreground">
                  The landing page is now wired to the real product flow.
                </h2>
                <p className="mt-4 text-base leading-8 text-muted-foreground">
                  Continue to the secure login, or jump straight into the admin workspace if your session is already active.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="rounded-full px-7" onClick={primaryCta.onClick} disabled={authLoading}>
                  {primaryCta.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-border/70 bg-background/60 px-7"
                  onClick={() => scrollToSection('workspace')}
                >
                  Explore workspace
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-gray-100 bg-white/85">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-indigo-500 to-fuchsia-500 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="font-black text-foreground">SMARTERP</p>
              <p className="text-sm text-muted-foreground">Production-style coaching institute ERP</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Smart Coaching ERP. Built for real institute operations.
          </p>
        </div>
      </footer>
    </div>
  );
}
