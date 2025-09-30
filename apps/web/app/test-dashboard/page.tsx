'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, UserCheck, FileText, AlertTriangle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  tier: string;
  bankIdVerified: boolean;
  tokenBalance: number;
  onboardingStatus: string;
}

interface Debt {
  id: string;
  creditorName: string;
  originalAmount: number;
  currentAmount: number;
  status: string;
  accountNumber: string;
  description: string;
}

export default function TestDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [gdprLoading, setGdprLoading] = useState(false);
  const [gdprMessage, setGdprMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/test-login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadDebts(token);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/test-login');
    }
  }, [router]);

  const loadDebts = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/debts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Transform the data to match our interface
        const transformedDebts = data.debts?.map((debt: any) => ({
          id: debt.id,
          creditorName: debt.creditor?.name || 'Unknown Creditor',
          originalAmount: debt.originalAmount,
          currentAmount: debt.currentAmount,
          status: debt.status,
          accountNumber: debt.accountNumber,
          description: debt.description || 'No description',
        })) || [];
        setDebts(transformedDebts);
      }
    } catch (error) {
      console.error('Error loading debts:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateGDPRRequest = async (creditorId: string) => {
    setGdprLoading(true);
    setGdprMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/gdpr/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id,
          creditor_id: creditorId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setGdprMessage(`✅ GDPR request generated successfully! ID: ${result.request_id}`);
      } else {
        setGdprMessage(`❌ Error: ${result.detail || result.error || 'Failed to generate GDPR request'}`);
      }
    } catch (error) {
      setGdprMessage(`❌ Network error: ${error}`);
    } finally {
      setGdprLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/test-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-10 w-10 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">DAMOCLES Test Dashboard</h1>
                <p className="text-blue-200">Velkommen, {user.name}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Logg ut
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <UserCheck className="h-6 w-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Brukerinformasjon</h2>
            </div>
            <div className="space-y-2 text-blue-200">
              <p><strong>E-post:</strong> {user.email}</p>
              <p><strong>Shield Tier:</strong> {user.tier}</p>
              <p><strong>BankID Verifisert:</strong> {user.bankIdVerified ? 'Ja' : 'Nei'}</p>
              <p><strong>Token Balance:</strong> {user.tokenBalance}</p>
              <p><strong>Status:</strong> {user.onboardingStatus}</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Gjeld Oversikt</h2>
            </div>
            <div className="text-blue-200">
              <p><strong>Antall gjeld:</strong> {debts.length}</p>
              <p><strong>Total beløp:</strong> {debts.reduce((sum, debt) => sum + debt.currentAmount, 0).toLocaleString('no')} kr</p>
            </div>
          </div>
        </div>

        {/* Debts List */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <FileText className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Mine Gjeld</h2>
          </div>

          {debts.length === 0 ? (
            <p className="text-blue-200">Ingen gjeld funnet.</p>
          ) : (
            <div className="space-y-4">
              {debts.map((debt) => (
                <div key={debt.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{debt.creditorName}</h3>
                      <p className="text-blue-200">{debt.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{debt.currentAmount.toLocaleString('no')} kr</p>
                      <p className="text-blue-300 text-sm">Opprinnelig: {debt.originalAmount.toLocaleString('no')} kr</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-blue-200">
                      <p>Kontonummer: {debt.accountNumber}</p>
                      <p>Status: {debt.status}</p>
                    </div>

                    <button
                      onClick={() => generateGDPRRequest('cmg42h75f000010yda69jo8zz')}
                      disabled={gdprLoading}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] disabled:scale-100"
                    >
                      {gdprLoading ? 'Genererer...' : 'Send GDPR Forespørsel'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {gdprMessage && (
            <div className={`mt-4 p-3 rounded-lg ${
              gdprMessage.includes('✅')
                ? 'bg-green-500/20 border border-green-500/30 text-green-200'
                : 'bg-red-500/20 border border-red-500/30 text-red-200'
            }`}>
              {gdprMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}