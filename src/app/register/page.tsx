'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const errors: typeof fieldErrors = {};

    if (!firstName.trim()) {
      errors.firstName = 'Le prénom est requis.';
    }

    if (!lastName.trim()) {
      errors.lastName = 'Le nom est requis.';
    }

    if (!email.trim()) {
      errors.email = 'L\'adresse email est requise.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Veuillez entrer une adresse email valide.';
    }

    if (!password) {
      errors.password = 'Le mot de passe est requis.';
    } else if (password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Veuillez confirmer votre mot de passe.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas.';
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

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || 'Une erreur est survenue lors de l\'inscription.');
        setLoading(false);
        return;
      }

      // Auto-login after successful registration
      const loginResult = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (loginResult?.error) {
        setApiError('Compte créé avec succès, mais échec de la connexion automatique. Veuillez vous connecter.');
        setLoading(false);
        return;
      }

      // Redirect to onboarding page
      router.push('/onboarding');
    } catch (err) {
      console.error('Erreur lors de l\'inscription:', err);
      setApiError('Une erreur de connexion est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[var(--color-background)]">
      {/* Background ambient glowing elements */}
      <div className="fixed top-[-15%] left-[-10%] w-[55%] h-[55%] bg-[var(--color-val-red)] opacity-15 blur-[140px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[55%] h-[55%] bg-[var(--color-val-red)] opacity-10 blur-[140px] rounded-full pointer-events-none" />

      {/* Centered Glassmorphism Card */}
      <div className="w-full max-w-lg glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 border border-[var(--color-border)] animate-in fade-in zoom-in-95 duration-500 my-8">
        
        {/* Top Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-[var(--color-val-red)] rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(255,70,85,0.4)] mb-4 border border-white/10 group transition-transform duration-300 hover:scale-105">
            {/* Sharp angular Valorant-style V Logo */}
            <svg
              viewBox="0 0 100 100"
              className="w-10 h-10 text-white fill-current drop-shadow-md"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M18 16 L44 84 H31 L5 16 Z" />
              <path d="M82 16 L56 84 H69 L95 16 Z" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-[var(--color-text-primary)]">
            CRÉER UN COMPTE
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 font-medium">
            Rejoignez la communauté
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Prénom & Nom Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Prénom */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                Prénom
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
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (fieldErrors.firstName) {
                      setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
                    }
                  }}
                  placeholder="Votre prénom"
                  className={`w-full bg-[rgba(15,25,35,0.7)] border text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50 text-sm rounded-xl pl-11 pr-4 py-3 outline-none transition-all duration-200 ${
                    fieldErrors.firstName
                      ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-[var(--color-border)] focus:border-[var(--color-val-red)] focus:ring-1 focus:ring-[var(--color-val-red)]'
                  }`}
                />
              </div>
              {fieldErrors.firstName && (
                <p className="text-xs text-red-400 mt-1.5 font-medium flex items-center gap-1">
                  <span>{fieldErrors.firstName}</span>
                </p>
              )}
            </div>

            {/* Nom */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                Nom
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
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (fieldErrors.lastName) {
                      setFieldErrors((prev) => ({ ...prev, lastName: undefined }));
                    }
                  }}
                  placeholder="Votre nom"
                  className={`w-full bg-[rgba(15,25,35,0.7)] border text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50 text-sm rounded-xl pl-11 pr-4 py-3 outline-none transition-all duration-200 ${
                    fieldErrors.lastName
                      ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-[var(--color-border)] focus:border-[var(--color-val-red)] focus:ring-1 focus:ring-[var(--color-val-red)]'
                  }`}
                />
              </div>
              {fieldErrors.lastName && (
                <p className="text-xs text-red-400 mt-1.5 font-medium flex items-center gap-1">
                  <span>{fieldErrors.lastName}</span>
                </p>
              )}
            </div>
          </div>

          {/* Email */}
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
                value={email}
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

          {/* Mot de passe */}
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
                value={password}
                autoComplete="off"
                data-protonpass-ignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
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

          {/* Confirmer le mot de passe */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
              Confirmer le mot de passe
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
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                autoComplete="off"
                data-protonpass-ignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }
                }}
                placeholder="••••••••"
                className={`w-full bg-[rgba(15,25,35,0.7)] border text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50 text-sm rounded-xl pl-11 pr-11 py-3 outline-none transition-all duration-200 ${
                  fieldErrors.confirmPassword
                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-[var(--color-border)] focus:border-[var(--color-val-red)] focus:ring-1 focus:ring-[var(--color-val-red)]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 text-[var(--color-text-secondary)] hover:text-white transition-colors cursor-pointer p-1"
                aria-label={showConfirmPassword ? 'Masquer la confirmation' : 'Afficher la confirmation'}
              >
                {showConfirmPassword ? (
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
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-400 mt-1.5 font-medium flex items-center gap-1">
                <span>{fieldErrors.confirmPassword}</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-[var(--color-val-red)] hover:bg-[#ff5a67] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-white font-bold py-3.5 px-6 rounded-xl uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(255,70,85,0.3)] hover:shadow-[0_0_25px_rgba(255,70,85,0.5)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
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
                <span>Création du compte...</span>
              </>
            ) : (
              <span>Créer mon compte</span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">
          Déjà un compte ?{' '}
          <Link
            href="/login"
            className="font-bold text-[var(--color-val-red)] hover:underline hover:text-[#ff5a67] transition-colors ml-1"
          >
            Connectez-vous
          </Link>
        </div>
      </div>
    </main>
  );
}
