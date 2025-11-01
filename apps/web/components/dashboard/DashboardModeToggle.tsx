'use client';

/**
 * Dashboard Mode Toggle
 *
 * Allows users to switch between beginner, intermediate, and advanced dashboard modes.
 * Shows clear descriptions of each mode and persists user preference.
 */

import { useState } from 'react';
import { Sparkles, BarChart3, Zap, Settings, Check } from 'lucide-react';
import { DashboardMode } from '@/lib/user-progress';

interface DashboardModeToggleProps {
  currentMode: DashboardMode;
  onModeChange: (mode: DashboardMode) => void;
}

interface ModeInfo {
  id: DashboardMode;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
}

const modes: ModeInfo[] = [
  {
    id: 'beginner',
    name: 'Nybegynner',
    description: 'Enkel, steg-for-steg veiledning',
    icon: <Sparkles size={24} />,
    features: [
      'Klare neste steg',
      'Forenklet visning',
      'Detaljerte forklaringer',
      'Gradvis læring',
    ],
    color: 'blue',
  },
  {
    id: 'intermediate',
    name: 'Mellomnivå',
    description: 'Balansert visning med nøkkelmetrikker',
    icon: <BarChart3 size={24} />,
    features: [
      'Basis metrikker',
      'Aktive saker oversikt',
      'Nye funksjoner varsler',
      'Anbefalte steg',
    ],
    color: 'purple',
  },
  {
    id: 'advanced',
    name: 'Avansert',
    description: 'Fullstendig dashboard med alle funksjoner',
    icon: <Zap size={24} />,
    features: [
      'Detaljert analyse',
      'Alle metrikker',
      'Sammenligningsverktøy',
      'Prediktive innsikter',
    ],
    color: 'indigo',
  },
];

export function DashboardModeToggle({ currentMode, onModeChange }: DashboardModeToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleModeChange = (mode: DashboardMode) => {
    onModeChange(mode);
    setIsOpen(false);

    // Persist preference
    localStorage.setItem('dashboard-mode-preference', mode);
  };

  const currentModeInfo = modes.find((m) => m.id === currentMode);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
      >
        <Settings size={18} />
        <span className="hidden sm:inline">Visning:</span>
        <span className="font-semibold">{currentModeInfo?.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="absolute right-0 mt-2 w-screen max-w-2xl bg-white rounded-lg shadow-2xl border border-gray-200 z-50 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Velg dashboard visning
              </h3>
              <p className="text-sm text-gray-600">
                Tilpass kompleksiteten basert på din erfaring
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {modes.map((mode) => {
                const isActive = mode.id === currentMode;
                const colorClasses = {
                  blue: {
                    border: 'border-blue-500',
                    bg: 'bg-blue-50',
                    icon: 'text-blue-600',
                    button: 'bg-blue-600 hover:bg-blue-700',
                  },
                  purple: {
                    border: 'border-purple-500',
                    bg: 'bg-purple-50',
                    icon: 'text-purple-600',
                    button: 'bg-purple-600 hover:bg-purple-700',
                  },
                  indigo: {
                    border: 'border-indigo-500',
                    bg: 'bg-indigo-50',
                    icon: 'text-indigo-600',
                    button: 'bg-indigo-600 hover:bg-indigo-700',
                  },
                };

                const colors = colorClasses[mode.color as keyof typeof colorClasses];

                return (
                  <div
                    key={mode.id}
                    className={`relative border-2 rounded-lg p-4 transition-all ${
                      isActive
                        ? `${colors.border} ${colors.bg}`
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute top-3 right-3">
                        <div className={`w-6 h-6 ${colors.button} rounded-full flex items-center justify-center`}>
                          <Check className="text-white" size={16} />
                        </div>
                      </div>
                    )}

                    {/* Icon */}
                    <div className={`mb-3 ${colors.icon}`}>
                      {mode.icon}
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-gray-900 mb-1">{mode.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{mode.description}</p>

                    {/* Features */}
                    <ul className="space-y-1.5 mb-4">
                      {mode.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Action Button */}
                    {isActive ? (
                      <button
                        disabled
                        className={`w-full py-2 ${colors.button} text-white rounded-lg font-medium text-sm cursor-default`}
                      >
                        Aktiv visning
                      </button>
                    ) : (
                      <button
                        onClick={() => handleModeChange(mode.id)}
                        className={`w-full py-2 border-2 ${colors.border} ${colors.icon} ${colors.bg} bg-opacity-0 hover:bg-opacity-100 rounded-lg font-medium text-sm transition-all`}
                      >
                        Bytt til {mode.name}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Help Text */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                💡 Du kan når som helst bytte mellom visninger. Ditt valg lagres automatisk.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Compact inline mode toggle (for mobile or sidebar)
 */
export function CompactModeToggle({ currentMode, onModeChange }: DashboardModeToggleProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
      {modes.map((mode) => {
        const isActive = mode.id === currentMode;
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
              isActive
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title={mode.description}
          >
            {mode.name}
          </button>
        );
      })}
    </div>
  );
}
