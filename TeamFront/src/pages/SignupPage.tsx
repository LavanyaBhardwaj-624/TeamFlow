import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowRight, CheckCircle2, Lock, Mail, User, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { signupSchema, SignupFormValues } from '@/modules/auth/schemas';
import { useAuthStore } from '@/modules/auth/useAuthStore';
import { ROUTES } from '@/config/routes';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuthStore();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      title: '',
      description: '',
    },
  });

  const passwordValue = watch('password', '');
  const hasMinLength = passwordValue.length >= 8;
  const hasUpperCase = /[A-Z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);

  const onSubmit = async (values: SignupFormValues) => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await signup(values);
      navigate(ROUTES.DASHBOARD);
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Could not create account. Please try a different email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setAuthError('Google sign-up is not configured yet. Please use your email and password.');
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
              Create your account
            </h1>
            <p className="mt-2 text-sm text-ink-muted">
              Get started with multi-tenant workspace collaboration today.
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
            onClick={handleGoogleSignup}
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
            <span>Sign up with Google</span>
          </button>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-line" />
            <span className="px-3 text-[11px] font-medium uppercase tracking-wider text-ink-subtle">
              or register with email
            </span>
            <div className="flex-1 border-t border-line" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Alex Morgan"
              leftIcon={<User className="h-4 w-4" />}
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Work Email"
              type="email"
              placeholder="alex@company.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input label="Job Title" type="text" placeholder="e.g. Frontend Developer" leftIcon={<Briefcase className="h-4 w-4" />} error={errors.title?.message} {...register('title')} />
            <Textarea label="Skills & abilities" placeholder="What do you specialize in?" error={errors.description?.message} rows={3} {...register('description')} />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                {...register('password')}
              />

              {/* Password strength indicators */}
              <div className="mt-2.5 space-y-1.5 bg-surface-secondary/60 p-2.5 rounded-lg border border-line">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle">
                  Password Strength:
                </p>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <span
                    className={
                      hasMinLength ? 'text-brand font-medium' : 'text-ink-muted'
                    }
                  >
                    {hasMinLength ? '✓' : '•'} 8+ chars
                  </span>
                  <span
                    className={
                      hasUpperCase ? 'text-brand font-medium' : 'text-ink-muted'
                    }
                  >
                    {hasUpperCase ? '✓' : '•'} 1 Uppercase
                  </span>
                  <span
                    className={
                      hasNumber ? 'text-brand font-medium' : 'text-ink-muted'
                    }
                  >
                    {hasNumber ? '✓' : '•'} 1 Number
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Create Account
            </Button>
          </form>
        </div>

        <div className="text-center text-xs text-ink-muted">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="font-semibold text-brand hover:underline">
            Sign in
          </Link>
        </div>
      </div>

      {/* Right Brand Panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between bg-brand p-12 text-white">
        <div className="flex items-center justify-end">
          <span className="text-xs font-medium text-white/70 tracking-wider uppercase">
            TeamFlow Architecture
          </span>
        </div>

        <div className="max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/90 backdrop-blur-sm mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            <span>Fast, calm collaboration</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight font-heading leading-tight text-white">
            Designed for teams that value momentum over meeting notes.
          </h2>
          <p className="mt-4 text-sm text-white/80 leading-relaxed">
            TeamFlow gives your engineers and designers a structured home for work. Zero bloat, instant workspace switches, and clean API contracts.
          </p>

          <div className="mt-8 space-y-3 pt-6 border-t border-white/15">
            <div className="flex items-center gap-2.5 text-xs text-white/90">
              <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
              <span>Full type-safe API service layer ready for PostgreSQL backend</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-white/90">
              <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
              <span>Fluid drag-and-drop task management powered by dnd-kit</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-white/60">
          © 2026 TeamFlow Inc. Frontend system.
        </div>
      </div>
    </div>
  );
};
