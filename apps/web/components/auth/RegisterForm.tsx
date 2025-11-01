'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, User, Lock, Mail, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passordene matcher ikke');
      setLoading(false);
      return;
    }

    try {
      // Always use window.location.origin in browser (works for both dev and prod)
      const apiUrl = typeof window !== 'undefined'
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_API_URL || '');

      const response = await fetch(`${apiUrl}/api/auth/register-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || errorData.error || 'Registrering feilet');
        setLoading(false);
        return;
      }

      // Auto-login after successful registration
      const loginSuccess = await login(formData.email, formData.password);

      if (loginSuccess) {
        router.push('/dashboard');
      } else {
        setError('Registrering vellykket, men pålogging feilet. Prøv å logge inn manuelt.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(`Noe gikk galt. Prøv igjen. ${err instanceof Error ? err.message : ''}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVippsRegister = async () => {
    setError('Vipps-registrering kommer snart. Bruk e-post og passord for nå.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">DAMOCLES</h1>
          <p className="text-blue-200">Opprett ny konto</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-6">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              Fullt navn
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ditt fulle navn"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              E-post
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="din@epost.no"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              Passord
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Minimum 8 tegn"
                required
                minLength={8}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              Bekreft passord
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Gjenta passordet"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                <span>Opprett konto</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-blue-200">eller</span>
            </div>
          </div>

          <button
            onClick={handleVippsRegister}
            disabled={loading}
            className="mt-4 w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
          >
            <CreditCard className="h-5 w-5" />
            <span>Registrer med Vipps</span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-blue-300 hover:text-blue-200 text-sm transition duration-200"
          >
            Har du allerede en konto? Logg inn her
          </a>
        </div>
      </div>
    </div>
  );
}