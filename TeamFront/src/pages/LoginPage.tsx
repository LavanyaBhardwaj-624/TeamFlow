import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowRight, CheckCircle2, Lock, Mail } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { loginSchema, LoginFormValues } from '@/modules/auth/schemas';
import { useAuthStore } from '@/modules/auth/useAuthStore';
import { ROUTES } from '@/config/routes';
import { mockUsers } from '@/config/mockData';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'elena@teamflow.io',
      password: 'Password123!',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await login({ email: values.email, password: values.password });
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      setAuthError(err?.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('Google sign-in is not configured yet. Please use your email and password.');
  };

  return (
    <div className="flex min-h-screen w-full bg-bg">
      {/* Left Form Column */}
      <div className="flex flex-1 flex-col justify-between p-6 sm:p-12 lg:w-1/2 max-w-xl mx-auto lg:mx-0">
        <div>
          <Link to={ROUTES.HOME} className="flex items-center gap-2 group inline-block">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white font-bold text-sm shadow-subtle group-hover:bg-brand-hover transition-colors">
              TF
            </div>
            <span className="font-heading font-bold text-lg tracking-tight text-ink">
              TeamFlow
            </span>
          </Link>
        </div>

        <div className="my-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-heading">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-ink-muted">
              Sign in to your team workspace to manage tasks, sprints, and activities.
            </p>
          </div>

          {authError && (
            <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Google SSO Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-line bg-surface py-2.5 px-4 text-xs font-semibold text-ink shadow-subtle hover:bg-surface-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-line" />
            <span className="px-3 text-[11px] font-medium uppercase tracking-wider text-ink-subtle">
              or sign in with email
            </span>
            <div className="flex-1 border-t border-line" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              placeholder="name@company.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Password
                </span>
                <span className="text-[11px] text-brand hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="mt-1.5">
                <Input
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Persona Fill */}
          <div className="mt-8 rounded-lg border border-line bg-surface-secondary/50 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle mb-2">
              Quick Mock Login (Demo Presets):
            </p>
            <div className="flex flex-wrap gap-2">
              {mockUsers.slice(0, 3).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setValue('email', u.email);
                    setValue('password', 'Password123!');
                  }}
                  className="rounded border border-line bg-surface px-2 py-1 text-[11px] text-ink hover:border-brand transition-colors"
                >
                  {u.name} ({u.title.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-ink-muted">
          Don't have an account?{' '}
          <Link to={ROUTES.SIGNUP} className="font-semibold text-brand hover:underline">
            Sign up
          </Link>
        </div>
      </div>

      {/* Right Brand Panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between bg-brand p-12 text-white">
        <div className="flex items-center justify-end">
          <span className="text-xs font-medium text-white/70 tracking-wider uppercase">
            TeamFlow Enterprise Preview
          </span>
        </div>

        <div className="max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/90 backdrop-blur-sm mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            <span>Multi-tenant architecture</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight font-heading leading-tight text-white">
            Clarity for high-velocity teams, without the clutter.
          </h2>
          <p className="mt-4 text-sm text-white/80 leading-relaxed">
            Organize multi-workspace projects, align cross-functional teams, and track every task from concept to production deploy.
          </p>

          <div className="mt-8 space-y-3 pt-6 border-t border-white/15">
            <div className="flex items-center gap-2.5 text-xs text-white/90">
              <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
              <span>Instant workspace switching with role-based access control</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-white/90">
              <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
              <span>Real-time kanban sprint tracking and audit activities</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-white/60">
          © 2026 TeamFlow Inc. Clean, resilient architecture.
        </div>
      </div>
    </div>
  );
};
