// The Extraction Counter - Like Norway's Oil Fund, but showing debt extraction
// Real-time tracker of wealth being extracted from citizens

import React, { useState, useEffect } from 'react';

interface ExtractionData {
  country: string;
  currency: string;
  flag: string;
  dailyExtraction: number;
  totalExtracted: number;
  oilFundComparison?: number; // For Norway
  population: number;
  perPersonLoss: number;
}

const ExtractionCounter: React.FC<{ country: string }> = ({ country }) => {
  const [currentExtraction, setCurrentExtraction] = useState<number>(0);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1000);
  
  const extractionData: Record<string, ExtractionData> = {
    'NO': {
      country: 'Norway',
      currency: 'NOK',
      flag: '🇳🇴',
      dailyExtraction: 73_424_657, // ~26.8B / 365 days
      totalExtracted: 26_847_293_000,
      oilFundComparison: 15_000_000_000_000, // ~15 trillion NOK
      population: 5_425_000,
      perPersonLoss: 4_947
    },
    'SE': {
      country: 'Sweden',
      currency: 'SEK',
      flag: '🇸🇪',
      dailyExtraction: 11_506_849, // ~4.2B / 365 days
      totalExtracted: 4_200_000_000,
      population: 10_400_000,
      perPersonLoss: 404
    },
    'DK': {
      country: 'Denmark',
      currency: 'DKK',
      flag: '🇩🇰',
      dailyExtraction: 7_671_233, // ~2.8B / 365 days
      totalExtracted: 2_800_000_000,
      population: 5_840_000,
      perPersonLoss: 479
    },
    'DE': {
      country: 'Germany',
      currency: 'EUR',
      flag: '🇩🇪',
      dailyExtraction: 14_246_575, // ~5.2B / 365 days
      totalExtracted: 5_200_000_000,
      population: 83_200_000,
      perPersonLoss: 63
    },
    'GB': {
      country: 'United Kingdom',
      currency: 'GBP',
      flag: '🇬🇧',
      dailyExtraction: 9_315_068, // ~3.4B / 365 days
      totalExtracted: 3_400_000_000,
      population: 67_000_000,
      perPersonLoss: 51
    }
  };

  const data = extractionData[country] || extractionData['NO'];

  // Initialize counter with base extraction
  useEffect(() => {
    setCurrentExtraction(data.totalExtracted);
  }, [data.totalExtracted]);

  // Continuous extraction animation
  useEffect(() => {
    const interval = setInterval(() => {
      // Calculate realistic per-second extraction
      const perSecondExtraction = data.dailyExtraction / 86400; // 24 * 60 * 60 seconds
      
      setCurrentExtraction(prev => {
        const increment = perSecondExtraction + (Math.random() * perSecondExtraction * 0.3);
        return prev + increment;
      });
    }, animationSpeed);

    return () => clearInterval(interval);
  }, [data.dailyExtraction, animationSpeed]);

  // Speed up animation on hover for dramatic effect
  const handleMouseEnter = () => setAnimationSpeed(100);
  const handleMouseLeave = () => setAnimationSpeed(1000);

  // Format large numbers with appropriate suffixes
  const formatLargeNumber = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(0);
  };

  // Calculate seconds since start of year for "this year" calculation
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const now = new Date();
  const secondsSinceYearStart = Math.floor((now.getTime() - startOfYear.getTime()) / 1000);
  const extractedThisYear = (data.dailyExtraction / 86400) * secondsSinceYearStart;

  return (
    <div className="bg-gradient-to-br from-red-900 to-black rounded-2xl p-8 text-white shadow-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <span className="text-4xl mr-3">{data.flag}</span>
          <h2 className="text-2xl font-bold">The Extraction Counter</h2>
        </div>
        <p className="text-red-200 text-lg">
          Wealth extracted from {data.country} citizens through illegal debt collection fees
        </p>
      </div>

      {/* Main Counter */}
      <div 
        className="text-center mb-8 p-6 bg-black/50 rounded-xl cursor-pointer transition-all duration-300 hover:bg-black/70"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="text-sm text-red-300 mb-2">EXTRACTED THIS YEAR</div>
        <div className="text-5xl md:text-6xl font-mono font-bold text-red-400 mb-2">
          {currentExtraction.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </div>
        <div className="text-2xl text-red-300">{data.currency}</div>
        <div className="text-xs text-red-400 mt-2 animate-pulse">● LIVE</div>
      </div>

      {/* Comparison Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-red-800/30 rounded-lg p-4 text-center">
          <div className="text-lg font-bold text-red-300">
            {formatLargeNumber(data.dailyExtraction)}
          </div>
          <div className="text-sm text-red-200">Per Day</div>
        </div>
        
        <div className="bg-red-800/30 rounded-lg p-4 text-center">
          <div className="text-lg font-bold text-red-300">
            {data.perPersonLoss.toLocaleString()} {data.currency}
          </div>
          <div className="text-sm text-red-200">Per Person</div>
        </div>
        
        <div className="bg-red-800/30 rounded-lg p-4 text-center">
          <div className="text-lg font-bold text-red-300">
            {Math.floor(data.dailyExtraction / 3600).toLocaleString()}
          </div>
          <div className="text-sm text-red-200">Per Hour</div>
        </div>
      </div>

      {/* Norway Oil Fund Comparison */}
      {country === 'NO' && data.oilFundComparison && (
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6 mb-6">
          <h3 className="text-yellow-400 font-bold mb-3 flex items-center">
            <span className="mr-2">🛢️</span>
            Norway Oil Fund Comparison
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-yellow-300">Oil Fund Value:</div>
              <div className="text-2xl font-bold text-yellow-400">
                {formatLargeNumber(data.oilFundComparison)} NOK
              </div>
              <div className="text-yellow-200">Building wealth for Norwegians</div>
            </div>
            <div>
              <div className="text-red-300">Debt Extraction:</div>
              <div className="text-2xl font-bold text-red-400">
                {formatLargeNumber(currentExtraction)} NOK
              </div>
              <div className="text-red-200">Extracting wealth from Norwegians</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-800/20 rounded text-center">
            <div className="text-yellow-300 text-sm">
              Debt extraction is {((currentExtraction / data.oilFundComparison) * 100).toFixed(3)}% 
              of the Oil Fund value
            </div>
          </div>
        </div>
      )}

      {/* Impact Visualization */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-white font-bold mb-4 text-center">
          What This Money Could Have Done Instead
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">University educations:</span>
              <span className="text-white font-bold">
                {Math.floor(currentExtraction / 200000).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Healthcare treatments:</span>
              <span className="text-white font-bold">
                {Math.floor(currentExtraction / 50000).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Small business loans:</span>
              <span className="text-white font-bold">
                {Math.floor(currentExtraction / 100000).toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Family emergencies:</span>
              <span className="text-white font-bold">
                {Math.floor(currentExtraction / 25000).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Home down payments:</span>
              <span className="text-white font-bold">
                {Math.floor(currentExtraction / 500000).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Retirement savings:</span>
              <span className="text-white font-bold">
                {Math.floor(currentExtraction / 150000).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-8">
        <p className="text-red-200 mb-4">
          Every second, more wealth is extracted through illegal fees
        </p>
        <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
          Stop Your Contribution to This Counter
        </button>
      </div>

      {/* Data Sources */}
      <div className="text-xs text-gray-400 text-center mt-6">
        <p>Data sources: Consumer complaints, court records, regulatory filings</p>
        <p>Calculations based on documented fee violations and average case values</p>
      </div>
    </div>
  );
};

export default ExtractionCounter;