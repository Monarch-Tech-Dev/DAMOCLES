'use client'

import React, { useState, useRef, useEffect } from 'react'
import { AlertTriangle, Shield, XCircle, CheckCircle } from 'lucide-react'

interface TermsConsentProps {
  onAccept: () => void
  onDecline: () => void
  documentType?: 'terms' | 'document-send' | 'action-confirmation'
  documentContent?: string
  highRiskUser?: boolean
}

export function TermsConsent({
  onAccept,
  onDecline,
  documentType = 'terms',
  documentContent,
  highRiskUser = false
}: TermsConsentProps) {
  const [hasScrolled, setHasScrolled] = useState(false)
  const [checkboxes, setCheckboxes] = useState({
    reviewed: false,
    notLegalAdvice: false,
    accurate: false,
    understandRisks: false,
    ownRisk: false,
    responsibility: false
  })
  const [coolingOff, setCoolingOff] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const allChecked = Object.values(checkboxes).every(v => v)
  const canAccept = hasScrolled && allChecked

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current
        if (scrollTop + clientHeight >= scrollHeight - 10) {
          setHasScrolled(true)
        }
      }
    }

    const element = contentRef.current
    if (element) {
      element.addEventListener('scroll', handleScroll)
      return () => element.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleCheckbox = (key: keyof typeof checkboxes) => {
    setCheckboxes(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleAccept = () => {
    if (coolingOff) {
      // Schedule for 24 hours later
      alert('Document scheduled to send in 24 hours. You can cancel anytime from your dashboard.')
    }
    onAccept()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header with strong warnings */}
        <div className="bg-red-50 border-b-4 border-red-500 p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-red-900 mb-2">
                ⚠️ CRITICAL WARNING - NOT LEGAL ADVICE ⚠️
              </h2>
              <p className="text-red-800 font-semibold">
                DAMOCLES is NOT a law firm. We do NOT provide legal advice.
                You are about to use an automated tool at YOUR OWN RISK.
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable content area */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto p-6 bg-gray-50"
          style={{ maxHeight: '400px' }}
        >
          {documentType === 'document-send' && documentContent ? (
            <div className="space-y-6">
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                <h3 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Document You're About to Send:
                </h3>
                <div className="bg-white p-4 rounded border border-yellow-300 font-mono text-sm">
                  <pre className="whitespace-pre-wrap">{documentContent}</pre>
                </div>
              </div>

              <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4">
                <h3 className="font-bold text-red-900 mb-2">
                  Potential Consequences:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-red-800">
                  <li>Creditor may respond negatively</li>
                  <li>May trigger accelerated collection</li>
                  <li>Could affect credit relationships</li>
                  <li>May create binding legal obligations</li>
                  <li>Could harm your legal position if incorrect</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="prose prose-red max-w-none">
              <h3>By Using This Service You Understand:</h3>
              <ul className="space-y-3">
                <li>This is an AUTOMATED TOOL, not personalized legal advice</li>
                <li>Generated documents may NOT fit your specific situation</li>
                <li>Incorrect use could SERIOUSLY HARM your legal position</li>
                <li>You should CONSIDER CONSULTING A LAWYER before proceeding</li>
                <li>DAMOCLES accepts NO LIABILITY for any outcomes</li>
                <li>You bear FULL RESPONSIBILITY for all consequences</li>
              </ul>

              <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4 my-6">
                <h4 className="font-bold text-blue-900 mb-2">
                  Free Legal Resources Available:
                </h4>
                <ul className="space-y-1 text-blue-800">
                  <li>📞 Jussbuss: Free legal aid</li>
                  <li>📞 Juridisk rådgivning: Legal counseling</li>
                  <li>📞 Crisis Helpline: 116 123 (24/7)</li>
                </ul>
              </div>
            </div>
          )}

          {!hasScrolled && (
            <div className="mt-6 p-4 bg-yellow-100 border-2 border-yellow-500 rounded-lg animate-pulse">
              <p className="text-center font-semibold text-yellow-900">
                ⬇️ Please scroll to read all warnings before proceeding ⬇️
              </p>
            </div>
          )}
        </div>

        {/* Consent checkboxes */}
        <div className="border-t-2 border-gray-300 p-6 bg-gray-100">
          <h3 className="font-bold mb-4 text-gray-900">
            Required Confirmations {highRiskUser && '(High Risk User - Extra Confirmations Required)'}
          </h3>

          <div className="space-y-3">
            {[
              { key: 'reviewed', label: 'I have reviewed this document/terms completely' },
              { key: 'notLegalAdvice', label: 'I understand this is NOT legal advice' },
              { key: 'accurate', label: 'I verify all information is accurate (if applicable)' },
              { key: 'understandRisks', label: 'I understand the risks and potential negative consequences' },
              { key: 'ownRisk', label: 'I choose to proceed at my own risk' },
              { key: 'responsibility', label: 'I accept FULL responsibility for ALL outcomes' }
            ].map(({ key, label }) => (
              <label
                key={key}
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  checkboxes[key as keyof typeof checkboxes]
                    ? 'bg-green-50 border-2 border-green-300'
                    : 'bg-white border-2 border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checkboxes[key as keyof typeof checkboxes]}
                  onChange={() => handleCheckbox(key as keyof typeof checkboxes)}
                  className="mt-1 w-5 h-5 cursor-pointer"
                  disabled={!hasScrolled}
                />
                <span className={`flex-1 ${
                  checkboxes[key as keyof typeof checkboxes]
                    ? 'text-green-900 font-medium'
                    : 'text-gray-700'
                }`}>
                  {label}
                  {key === 'responsibility' && (
                    <span className="block text-sm mt-1 text-red-600 font-bold">
                      This includes financial losses, legal consequences, and creditor actions
                    </span>
                  )}
                </span>
                {checkboxes[key as keyof typeof checkboxes] && (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                )}
              </label>
            ))}

            {highRiskUser && (
              <div className="mt-4 p-4 bg-orange-50 border-2 border-orange-400 rounded-lg">
                <p className="text-orange-900 font-semibold mb-2">
                  ⚠️ High Risk Indicator Detected
                </p>
                <p className="text-orange-800">
                  Based on your situation, we strongly recommend consulting with a
                  professional advisor or trusted person before proceeding.
                </p>
              </div>
            )}

            {documentType === 'document-send' && (
              <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-400 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={coolingOff}
                    onChange={(e) => setCoolingOff(e.target.checked)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <span className="text-blue-900">
                    Enable 24-hour cooling-off period (recommended)
                  </span>
                </label>
                <p className="text-sm text-blue-700 mt-2 ml-8">
                  Delay sending for 24 hours. You can cancel anytime.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-6 bg-white border-t-2 border-gray-300">
          <div className="flex gap-4 justify-end">
            <button
              onClick={onDecline}
              className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              Cancel / Decline
            </button>

            {documentType === 'document-send' && (
              <button
                className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save as Draft
              </button>
            )}

            <button
              onClick={handleAccept}
              disabled={!canAccept}
              className={`px-8 py-3 font-bold rounded-lg transition-all flex items-center gap-2 ${
                canAccept
                  ? 'bg-red-600 text-white hover:bg-red-700 transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Shield className="w-5 h-5" />
              {coolingOff ? 'Schedule Send (24hr delay)' : 'CONFIRM AND PROCEED AT MY OWN RISK'}
            </button>
          </div>

          {!canAccept && (
            <p className="text-center text-sm text-gray-500 mt-4">
              {!hasScrolled
                ? 'Please scroll through and read all warnings first'
                : 'Please confirm all checkboxes to proceed'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default TermsConsent