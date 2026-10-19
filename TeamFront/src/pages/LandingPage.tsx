import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  FolderKanban,
  Kanban,
  Moon,
  ShieldCheck,
  Sun,
  TrendingUp,
} from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useThemeStore } from '@/lib/theme';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-line bg-surface/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to={ROUTES.HOME} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white font-bold text-sm shadow-subtle">
              TF
            </div>
            <span className="font-heading font-bold text-lg tracking-tight text-ink">
              TeamFlow
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            <a href="#features" className="hover:text-ink transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-ink transition-colors">
              Pricing
            </a>
            <a href="#architecture" className="hover:text-ink transition-colors">
              Architecture
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-secondary hover:text-ink transition-colors"
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Log in
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(ROUTES.SIGNUP)}
            >
              Sign up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section: Asymmetric, Left-aligned Text, Right Board Mockup */}
      <section className="py-16 sm:py-24 border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content (5 cols) */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs text-brand font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                <span>Modern Multi-Workspace Collaboration</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-ink font-heading leading-[1.12]">
                Structure for teams who ship weekly.
              </h1>

              <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                A calm, multi-tenant workspace platform designed to manage sprint tasks, delegate assignments, and track live activity feeds without cognitive overload.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button
                  size="lg"
                  onClick={() => navigate(ROUTES.DASHBOARD)}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Explore Live Demo
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate(ROUTES.SIGNUP)}
                >
                  Create Free Account
                </Button>
              </div>

              <div className="pt-4 flex items-center gap-6 text-xs text-ink-subtle">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-brand" />
                  <span>React 18 + TypeScript</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-brand" />
                  <span>TanStack Query cache</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-brand" />
                  <span>Mock API service layer</span>
                </div>
              </div>
            </div>

            {/* Right Realistic Board Mockup (7 cols) */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-line bg-surface p-4 sm:p-6 shadow-modal">
                {/* Board Mockup Window Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-line mb-4 text-xs text-ink-muted">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <span className="ml-2 font-mono text-[11px] text-ink-subtle">
                      Core Platform Engineering / Tasks
                    </span>
                  </div>
                  <Badge variant="roleAdmin" size="sm">
                    ADMIN
                  </Badge>
                </div>

                {/* Mini Kanban Columns Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Column 1 */}
                  <div className="rounded-xl bg-surface-secondary/50 border border-line p-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-ink">
                      <span>TO DO</span>
                      <span className="rounded bg-surface px-1.5 py-0.2 text-[10px] text-ink-muted border border-line">
                        3
                      </span>
                    </div>

                    <div className="rounded-lg border border-line bg-surface p-2.5 shadow-subtle space-y-1.5">
                      <Badge variant="danger" size="sm">
                        High
                      </Badge>
                      <p className="text-xs font-semibold text-ink">
                        Migrate connection pool to PgBouncer
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-ink-subtle pt-1">
                        <span>Oct 24</span>
                        <div className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-700 text-[8px] flex items-center justify-center font-bold">
                          DO
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-line bg-surface p-2.5 shadow-subtle space-y-1.5">
                      <Badge variant="primary" size="sm">
                        Medium
                      </Badge>
                      <p className="text-xs font-semibold text-ink">
                        Distributed token bucket rate limiter
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-ink-subtle pt-1">
                        <span>Oct 28</span>
                        <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-700 text-[8px] flex items-center justify-center font-bold">
                          MC
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="rounded-xl bg-surface-secondary/50 border border-line p-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-ink">
                      <span>IN PROGRESS</span>
                      <span className="rounded bg-surface px-1.5 py-0.2 text-[10px] text-ink-muted border border-line">
                        2
                      </span>
                    </div>

                    <div className="rounded-lg border border-line bg-surface p-2.5 shadow-subtle space-y-1.5">
                      <Badge variant="danger" size="sm">
                        Urgent
                      </Badge>
                      <p className="text-xs font-semibold text-ink">
                        Fix race condition in token renewal
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-ink-subtle pt-1">
                        <span>Oct 16</span>
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-700 text-[8px] flex items-center justify-center font-bold">
                          ER
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-line bg-surface p-2.5 shadow-subtle space-y-1.5">
                      <Badge variant="warning" size="sm">
                        Medium
                      </Badge>
                      <p className="text-xs font-semibold text-ink">
                        Benchmark drag mutation latency
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-ink-subtle pt-1">
                        <span>Oct 22</span>
                        <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-700 text-[8px] flex items-center justify-center font-bold">
                          AT
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 3 */}
                  <div className="rounded-xl bg-surface-secondary/50 border border-line p-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-ink">
                      <span>COMPLETED</span>
                      <span className="rounded bg-surface px-1.5 py-0.2 text-[10px] text-ink-muted border border-line">
                        4
                      </span>
                    </div>

                    <div className="rounded-lg border border-line bg-surface p-2.5 shadow-subtle space-y-1.5 opacity-80">
                      <Badge variant="success" size="sm">
                        Shipped
                      </Badge>
                      <p className="text-xs font-semibold text-ink line-through text-ink-muted">
                        Zero-downtime DB migration
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-ink-subtle pt-1">
                        <span>Oct 10</span>
                        <div className="w-4 h-4 rounded-full bg-brand/20 text-brand text-[8px] flex items-center justify-center font-bold">
                          DO
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Features Section */}
      <section id="features" className="py-20 border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-heading">
              Four pillars of calm, structured delivery.
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Everything high-output engineering and product squads need to stay aligned, with zero distractions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="rounded-xl border border-line bg-surface p-6 shadow-subtle space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <FolderKanban className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-ink font-heading">
                Multi-Workspace Architecture
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Segregate organizations, clients, or product squads into distinct tenants. Switch between them instantly without page refreshes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-line bg-surface p-6 shadow-subtle space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Kanban className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-ink font-heading">
                Fluid Drag-and-Drop Board
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Powered by @dnd-kit with accessible keyboard controls, priority badging, assignment tags, and real-time status transitions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border border-line bg-surface p-6 shadow-subtle space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-ink font-heading">
                Roles & Permissions
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Fine-grained ADMIN and MEMBER role enforcement. Admins manage members and deletions; members build and execute.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-xl border border-line bg-surface p-6 shadow-subtle space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-ink font-heading">
                Live Audit Activity Feed
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Granular activity timeline logging task creations, column moves, assignment updates, and new member onboarding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Free / Pro / Team, static) */}
      <section id="pricing" className="py-20 border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-heading">
              Transparent, predictable plans.
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Start free with mock data and upgrade when your Express + PostgreSQL backend goes live.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <div className="rounded-xl border border-line bg-surface p-6 shadow-subtle space-y-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-ink font-heading">Free</h3>
                <p className="text-xs text-ink-muted mt-1">For individuals and prototyping.</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-ink font-heading">$0</span>
                  <span className="text-xs text-ink-muted ml-1">/ month</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-xs text-ink-muted">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                    <span>Up to 2 Workspaces</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                    <span>Full Kanban Drag-and-Drop</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                    <span>In-memory mock session persistence</span>
                  </li>
                </ul>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(ROUTES.SIGNUP)}
              >
                Get Started
              </Button>
            </div>

            {/* Pro */}
            <div className="rounded-xl border-2 border-brand bg-surface p-6 shadow-card space-y-6 flex flex-col justify-between relative">
              <span className="absolute -top-3 right-6 rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider">
                Popular
              </span>
              <div>
                <h3 className="text-base font-bold text-ink font-heading">Pro</h3>
                <p className="text-xs text-ink-muted mt-1">For agile venture teams and startups.</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-ink font-heading">$12</span>
                  <span className="text-xs text-ink-muted ml-1">/ member / month</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-xs text-ink-muted">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                    <span>Unlimited Workspaces</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                    <span>ADMIN and MEMBER access controls</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                    <span>Live Activity Feed & sprint metrics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                    <span>Team Chat & Calendar channels</span>
                  </li>
                </ul>
              </div>
              <Button
                className="w-full"
                onClick={() => navigate(ROUTES.SIGNUP)}
              >
                Start Pro Trial
              </Button>
            </div>

            {/* Team */}
            <div className="rounded-xl border border-line bg-surface p-6 shadow-subtle space-y-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-ink font-heading">Enterprise</h3>
                <p className="text-xs text-ink-muted mt-1">For regulated high-compliance squads.</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-ink font-heading">$29</span>
                  <span className="text-xs text-ink-muted ml-1">/ member / month</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-xs text-ink-muted">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                    <span>Dedicated PostgreSQL DB connector</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                    <span>Socket.IO real-time cluster support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                    <span>SAML / SSO & custom domain</span>
                  </li>
                </ul>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 bg-surface border-t border-line text-xs text-ink-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-brand text-white text-[10px] flex items-center justify-center font-bold">
              TF
            </div>
            <span className="font-semibold text-ink">TeamFlow</span>
            <span>— Multi-Tenant Workspace Collaboration</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink transition-colors"
            >
              GitHub Repository
            </a>
            <span className="hover:text-ink transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-ink transition-colors cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

