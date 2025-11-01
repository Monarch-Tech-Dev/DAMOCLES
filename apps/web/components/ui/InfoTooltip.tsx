/**
 * InfoTooltip Component
 *
 * A reusable tooltip system for explaining technical terms to non-technical users.
 * Uses Radix UI Tooltip primitive for accessibility.
 *
 * Usage:
 * <InfoTooltip term="pdi_score" />
 * or
 * <InfoTooltip content="Custom explanation text">PDI Score</InfoTooltip>
 */

import * as Tooltip from '@radix-ui/react-tooltip';
import { HelpCircle, Info } from 'lucide-react';
import { glossary } from './glossary-data';

interface InfoTooltipProps {
  /** Pre-defined term from glossary */
  term?: keyof typeof glossary;

  /** Custom tooltip content (overrides term) */
  content?: string | React.ReactNode;

  /** Children to wrap (if not provided, shows info icon) */
  children?: React.ReactNode;

  /** Icon variant */
  variant?: 'info' | 'help';

  /** Size of icon */
  size?: number;

  /** Side preference for tooltip placement */
  side?: 'top' | 'right' | 'bottom' | 'left';

  /** Custom class for trigger element */
  className?: string;
}

export function InfoTooltip({
  term,
  content,
  children,
  variant = 'info',
  size = 16,
  side = 'top',
  className = '',
}: InfoTooltipProps) {
  // Get content from glossary or use custom content
  const tooltipContent = content || (term && glossary[term]?.description) || 'No description available';
  const title = term && glossary[term]?.title;
  const learnMoreUrl = term && glossary[term]?.learnMoreUrl;

  // Choose icon
  const Icon = variant === 'help' ? HelpCircle : Info;

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {children ? (
            <span
              className={`inline-flex items-center gap-1 cursor-help border-b border-dashed border-gray-400 ${className}`}
            >
              {children}
              <Icon
                size={size}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              />
            </span>
          ) : (
            <button
              type="button"
              className={`inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors ${className}`}
              aria-label={title || 'More information'}
            >
              <Icon size={size} />
            </button>
          )}
        </Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content
            side={side}
            sideOffset={5}
            className="max-w-xs z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg"
          >
            {title && (
              <div className="font-semibold mb-1">{title}</div>
            )}

            <div className="text-gray-200">
              {typeof tooltipContent === 'string' ? (
                <p>{tooltipContent}</p>
              ) : (
                tooltipContent
              )}
            </div>

            {learnMoreUrl && (
              <a
                href={learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 text-xs mt-2 inline-block"
              >
                Lær mer →
              </a>
            )}

            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

/**
 * Inline help text for forms
 */
export function HelpText({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-sm text-gray-600 mt-1 flex items-start gap-1 ${className}`}>
      <Info size={14} className="mt-0.5 flex-shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/**
 * Example usage component
 */
export function TooltipExamples() {
  return (
    <div className="space-y-4 p-6">
      <h3 className="text-lg font-semibold">Tooltip Examples</h3>

      {/* Icon only */}
      <div className="flex items-center gap-2">
        <span>PDI Score</span>
        <InfoTooltip term="pdi_score" />
      </div>

      {/* Wrapped text */}
      <div>
        <InfoTooltip term="sword_token">
          SWORD Token
        </InfoTooltip>
      </div>

      {/* Custom content */}
      <div className="flex items-center gap-2">
        <span>Custom Tooltip</span>
        <InfoTooltip content="This is a custom tooltip with specific information for this context." />
      </div>

      {/* Help text */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Email Address
        </label>
        <input type="email" className="border rounded px-3 py-2 w-full" />
        <HelpText>
          Vi bruker e-postadressen din kun for å sende deg viktige oppdateringer om saken din.
        </HelpText>
      </div>
    </div>
  );
}
