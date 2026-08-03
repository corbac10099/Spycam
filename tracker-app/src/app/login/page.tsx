'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [apiError, setApiError] = useState('');
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const validateForm = () => {
    const errors: typeof fieldErrors = {};

    if (!email.trim()) {
      errors.email = "L'adresse email est requise.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Veuillez entrer une adresse email valide.';
    }

    if (!password) {
      errors.password = 'Le mot de passe est requis.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setLoadingCredentials(true);

    try {
      const res = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setApiError('Identifiants incorrects. Veuillez vérifier votre email et mot de passe.');
        setLoadingCredentials(false);
        return;
      }

      if (res?.ok) {
        router.refresh();
        router.push('/');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setApiError('Une erreur réseau est survenue. Veuillez réessayer.');
      setLoadingCredentials(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    setApiError('');
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (err) {
      console.error('Erreur lors de la connexion Google:', err);
      setApiError('Échec de la connexion avec Google.');
      setLoadingGoogle(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[var(--color-background)]">
      {/* Ambient background glowing elements */}
      <div className="fixed top-[-15%] left-[-10%] w-[55%] h-[55%] bg-[var(--color-val-red)] opacity-15 blur-[140px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[55%] h-[55%] bg-[var(--color-val-red)] opacity-10 blur-[140px] rounded-full pointer-events-none" />

      {/* Centered Glassmorphism Card */}
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 border border-[var(--color-border)] my-8 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Top Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-[var(--color-val-red)] rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(255,70,85,0.4)] mb-4 border border-white/10 group transition-transform duration-300 hover:scale-105">
            {/* Valorant-style V Logo */}
            <svg
              viewBox="0 0 100 100"
              className="w-10 h-10 text-white fill-current drop-shadow-md"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M18 16 L44 84 H31 L5 16 Z" />
              <path d="M82 16 L56 84 H69 L95 16 Z" />
            </svg>
          </div>

          <h1 className="text-2xl font-black text-[var(--color-text-primary)] tracking-[0.2em] uppercase">
            SPYCAM
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 font-medium">
            Connectez-vous pour continuer
          </p>
        </div>

        {/* API Error Banner */}
        {apiError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium flex items-start gap-3 animate-in fade-in duration-300">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="flex-1">{apiError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate autoComplete="off">
          {/* Hidden honeypot fields to absorb autofill */}
          <input type="text" name="fake_user" autoComplete="username" style={{ position: 'absolute', opacity: 0, height: 0, width: 0, padding: 0, margin: 0, border: 'none', overflow: 'hidden', pointerEvents: 'none' }} tabIndex={-1} aria-hidden="true" />
          <input type="password" name="fake_pass" autoComplete="current-password" style={{ position: 'absolute', opacity: 0, height: 0, width: 0, padding: 0, margin: 0, border: 'none', overflow: 'hidden', pointerEvents: 'none' }} tabIndex={-1} aria-hidden="true" />
          
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
              Email
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-[var(--color-text-secondary)] pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <input
                type="email"
                name="user_email_login"
                value={email}
                autoComplete="off"
                data-protonpass-ignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                data-lpignore="true"
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                placeholder="exemple@domaine.com"
                className={`w-full bg-[rgba(15,25,35,0.7)] border text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50 text-sm rounded-xl pl-11 pr-4 py-3 outline-none transition-all duration-200 ${
                  fieldErrors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-[var(--color-border)] focus:border-[var(--color-val-red)] focus:ring-1 focus:ring-[var(--color-val-red)]'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-red-400 mt-1.5 font-medium flex items-center gap-1">
                <span>{fieldErrors.email}</span>
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
              Mot de passe
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-[var(--color-text-secondary)] pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="user_secret_login"
                value={password}
                autoComplete="off"
                data-protonpass-ignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                data-lpignore="true"
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                placeholder="••••••••"
                className={`w-full bg-[rgba(15,25,35,0.7)] border text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50 text-sm rounded-xl pl-11 pr-11 py-3 outline-none transition-all duration-200 ${
                  fieldErrors.password
                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-[var(--color-border)] focus:border-[var(--color-val-red)] focus:ring-1 focus:ring-[var(--color-val-red)]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-[var(--color-text-secondary)] hover:text-white transition-colors cursor-pointer p-1"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-400 mt-1.5 font-medium flex items-center gap-1">
                <span>{fieldErrors.password}</span>
              </p>
            )}
          </div>

          {/* Rester connecté Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--color-border)] bg-[rgba(15,25,35,0.7)] text-[var(--color-val-red)] focus:ring-[var(--color-val-red)] focus:ring-offset-0 cursor-pointer accent-[var(--color-val-red)]"
              />
              <span>Rester connecté</span>
            </label>
          </div>

          {/* Primary Submit Button: Se connecter */}
          <button
            type="submit"
            disabled={loadingCredentials || loadingGoogle}
            className="w-full mt-6 bg-[var(--color-val-red)] hover:bg-[#ff5a67] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-white font-bold py-3.5 px-6 rounded-xl uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(255,70,85,0.3)] hover:shadow-[0_0_25px_rgba(255,70,85,0.5)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loadingCredentials ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Connexion en cours...</span>
              </>
            ) : (
              <span>Se connecter</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-border)]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[var(--color-val-dark)] px-3 text-[var(--color-text-secondary)] font-medium">
              Ou
            </span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          {/* Continuer avec Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loadingCredentials || loadingGoogle}
            className="w-full bg-white hover:bg-gray-100 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold py-3 px-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer shadow-md"
          >
            {loadingGoogle ? (
              <svg
                className="animate-spin h-5 w-5 text-gray-900"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 flex-shrink-0"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continuer avec Google</span>
          </button>

          {/* Continuer avec Riot Games (Disabled, Bientôt disponible) */}
          <button
            type="button"
            disabled
            className="w-full bg-[#161f28] border border-white/10 text-white font-semibold py-3 px-4 rounded-xl text-sm opacity-50 cursor-not-allowed flex items-center justify-between transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 flex-shrink-0 text-red-500 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M1.333 4.155l1.696 1.488L19.262.8 22.667 11.23l-3.327 1.547.451 4.542-12.01 5.881-6.448-6.136L7.89 8.274 1.333 4.155zm10.742 7.77l-4.59 1.954 1.83 1.74 5.381-2.635-2.621-1.059zm4.279-2.031l-7.794 3.318 1.488 1.413 8.357-4.093-2.051-.638zm2.464-1.285l-9.98 4.25 1.196 1.136 10.37-5.08-1.586-.306z" />
              </svg>
              <span>Continuer avec Riot Games</span>
            </div>
            <span className="bg-red-500/20 text-red-400 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border border-red-500/30">
              Bientôt disponible
            </span>
          </button>
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">
          Pas encore de compte ?{' '}
          <Link
            href="/register"
            className="font-bold text-[var(--color-val-red)] hover:underline hover:text-[#ff5a67] transition-colors ml-1"
          >
            Inscrivez-vous
          </Link>
        </div>
      </div>
    </main>
  );
}
