'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Copy, ExternalLink, Code, Monitor, Smartphone, Globe } from 'lucide-react'

export default function WidgetsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, widgetName: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(widgetName)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const widgets = [
    {
      id: 'national-counter',
      name: 'National Debt Health Counter',
      description: 'Live counter displaying Norway\'s current debt health score, similar to the Oil Fund counter',
      preview: `
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #991b1b 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 10px 0; font-size: 18px;">Norway's Debt Health Index</h3>
          <div style="font-size: 48px; font-weight: bold; color: #fbbf24;">72.2<span style="font-size: 24px; opacity: 0.7;">/100</span></div>
          <div style="font-size: 14px; opacity: 0.8; margin-top: 10px;">Updated live • 678,750 participants</div>
        </div>
      `,
      embedCode: `<iframe
  src="https://damocles.no/embed/national-counter"
  width="300"
  height="150"
  frameborder="0"
  style="border-radius: 8px;">
</iframe>`,
      sizes: ['300x150', '400x200', '500x250']
    },
    {
      id: 'regional-map',
      name: 'Regional Debt Health Map',
      description: 'Interactive map showing debt health scores across Norwegian regions',
      preview: `
        <div style="background: #111827; color: white; padding: 20px; border-radius: 8px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 15px 0; font-size: 16px;">Regional Debt Health</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
            <div style="background: #065f46; padding: 8px; border-radius: 4px;">Oslo: 74.1</div>
            <div style="background: #7c2d12; padding: 8px; border-radius: 4px;">Bergen: 68.7</div>
            <div style="background: #065f46; padding: 8px; border-radius: 4px;">Stavanger: 77.5</div>
            <div style="background: #ea580c; padding: 8px; border-radius: 4px;">Nord-Norge: 51.2</div>
          </div>
        </div>
      `,
      embedCode: `<iframe
  src="https://damocles.no/embed/regional-map"
  width="400"
  height="300"
  frameborder="0"
  style="border-radius: 8px;">
</iframe>`,
      sizes: ['400x300', '600x400', '800x500']
    },
    {
      id: 'crisis-alert',
      name: 'Crisis Alert Feed',
      description: 'Real-time alerts when regional debt health scores drop to critical levels',
      preview: `
        <div style="background: #7f1d1d; color: white; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626; font-family: Arial, sans-serif;">
          <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">🚨 DEBT HEALTH ALERT</div>
          <div style="font-size: 12px;">Nord-Norge PDI drops to 51.2 - Critical level reached</div>
          <div style="font-size: 10px; opacity: 0.7; margin-top: 5px;">2 minutes ago</div>
        </div>
      `,
      embedCode: `<iframe
  src="https://damocles.no/embed/crisis-alerts"
  width="350"
  height="100"
  frameborder="0"
  style="border-radius: 8px;">
</iframe>`,
      sizes: ['350x100', '400x120', '500x150']
    },
    {
      id: 'statistics-banner',
      name: 'Key Statistics Banner',
      description: 'Horizontal banner with key debt health statistics for article headers',
      preview: `
        <div style="background: linear-gradient(90deg, #1f2937 0%, #374151 100%); color: white; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; font-family: Arial, sans-serif; font-size: 12px;">
          <div style="text-align: center;"><strong style="color: #ef4444;">137,819</strong><br/>In Crisis</div>
          <div style="text-align: center;"><strong style="color: #f59e0b;">199B NOK</strong><br/>At Risk</div>
          <div style="text-align: center;"><strong style="color: #3b82f6;">678,750</strong><br/>Protected</div>
          <div style="text-align: center;"><strong style="color: #10b981;">72.2/100</strong><br/>National Score</div>
        </div>
      `,
      embedCode: `<iframe
  src="https://damocles.no/embed/statistics-banner"
  width="500"
  height="60"
  frameborder="0"
  style="border-radius: 8px;">
</iframe>`,
      sizes: ['500x60', '600x70', '800x80']
    }
  ]

  const apiEndpoints = [
    {
      endpoint: 'GET /api/public/pdi/national',
      description: 'National debt health statistics',
      example: `{
  "nationalAverage": 72.2,
  "totalUsers": 678750,
  "criticalPercentage": 20.3,
  "totalDebtStress": 199796938365,
  "regionsInCrisis": 0,
  "trend": "stable",
  "changePercent": 0.05
}`
    },
    {
      endpoint: 'GET /api/public/pdi/regional',
      description: 'All regional debt health data',
      example: `[
  {
    "regionName": "Oslo",
    "averagePDI": 74.1,
    "totalProfiles": 105000,
    "criticalPercentage": 18.2
  },
  {
    "regionName": "Nord-Norge",
    "averagePDI": 51.2,
    "totalProfiles": 72000,
    "criticalPercentage": 32.7
  }
]`
    },
    {
      endpoint: 'GET /api/public/pdi/alerts',
      description: 'Recent crisis alerts and warnings',
      example: `[
  {
    "region": "Nord-Norge",
    "severity": "critical",
    "message": "PDI drops to 51.2",
    "timestamp": "2025-09-17T19:30:00Z"
  }
]`
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Media <span className="text-blue-400">Embedding</span> Widgets
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Embed real-time Norwegian debt health data directly into your news articles,
            websites, and reporting. Free for all media organizations.
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center bg-green-500/20 text-green-400 px-4 py-2 rounded-full">
              <Globe className="h-4 w-4 mr-2" />
              Free for Media Use
            </div>
            <div className="flex items-center bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full">
              <Monitor className="h-4 w-4 mr-2" />
              Real-time Updates
            </div>
            <div className="flex items-center bg-purple-500/20 text-purple-400 px-4 py-2 rounded-full">
              <Code className="h-4 w-4 mr-2" />
              Easy Integration
            </div>
          </div>
        </div>

        {/* Widgets Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Available Widgets</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {widgets.map((widget) => (
              <Card key={widget.id} className="bg-gray-800 border-gray-700 p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">{widget.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{widget.description}</p>

                  {/* Preview */}
                  <div className="bg-gray-900 p-4 rounded-lg mb-4">
                    <div className="text-xs text-gray-500 mb-2">Preview:</div>
                    <div dangerouslySetInnerHTML={{ __html: widget.preview }} />
                  </div>

                  {/* Size Options */}
                  <div className="flex gap-2 mb-4">
                    <span className="text-xs text-gray-500">Sizes:</span>
                    {widget.sizes.map((size) => (
                      <span key={size} className="text-xs bg-gray-700 px-2 py-1 rounded">
                        {size}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Embed Code */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-400">EMBED CODE</span>
                    <button
                      onClick={() => copyToClipboard(widget.embedCode, widget.id)}
                      className="flex items-center text-xs text-blue-400 hover:text-blue-300"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {copiedCode === widget.id ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="text-xs text-gray-300 overflow-x-auto">
                    <code>{widget.embedCode}</code>
                  </pre>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* API Documentation */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">API Access for Developers</h2>
          <p className="text-gray-400 mb-8">
            For custom integrations, use our public API endpoints. All data is real-time and GDPR-compliant.
          </p>

          <div className="space-y-6">
            {apiEndpoints.map((api, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700 p-6">
                <div className="mb-4">
                  <code className="text-lg font-semibold text-blue-400">{api.endpoint}</code>
                  <p className="text-gray-400 mt-2">{api.description}</p>
                </div>

                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-400">EXAMPLE RESPONSE</span>
                    <button
                      onClick={() => copyToClipboard(api.example, `api-${index}`)}
                      className="flex items-center text-xs text-blue-400 hover:text-blue-300"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {copiedCode === `api-${index}` ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="text-xs text-gray-300 overflow-x-auto">
                    <code>{api.example}</code>
                  </pre>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Integration Guide */}
        <Card className="bg-gray-800 border-gray-700 p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6">Integration Guide</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-400">For News Websites</h3>
              <ol className="space-y-2 text-sm text-gray-300">
                <li>1. Choose a widget from above</li>
                <li>2. Copy the embed code</li>
                <li>3. Paste into your article HTML</li>
                <li>4. Customize size if needed</li>
                <li>5. Widget updates automatically</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-400">For Custom Applications</h3>
              <ol className="space-y-2 text-sm text-gray-300">
                <li>1. Use our public API endpoints</li>
                <li>2. Fetch data every 5 minutes</li>
                <li>3. Cache responses appropriately</li>
                <li>4. Display with your own styling</li>
                <li>5. No API key required</li>
              </ol>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-start">
              <ExternalLink className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-400 mb-1">Need Custom Integration?</h4>
                <p className="text-sm text-gray-300">
                  Contact our team for custom widgets, white-label solutions, or dedicated API access.
                  Email: <a href="mailto:developers@damocles.no" className="text-blue-400">developers@damocles.no</a>
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Usage Examples */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Real-World Usage Examples</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-3 text-yellow-400">Breaking News Articles</h3>
              <p className="text-sm text-gray-400 mb-4">
                "Nord-Norge Debt Crisis Deepens" - embed live regional data to show real-time impact
              </p>
              <div className="text-xs bg-gray-900 p-3 rounded">
                Use: Regional Map + Crisis Alerts
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-400">Economic Analysis</h3>
              <p className="text-sm text-gray-400 mb-4">
                "State of Norwegian Household Debt" - comprehensive data visualization for in-depth reporting
              </p>
              <div className="text-xs bg-gray-900 p-3 rounded">
                Use: National Counter + Statistics Banner
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-3 text-green-400">Live Blog Coverage</h3>
              <p className="text-sm text-gray-400 mb-4">
                Real-time updates during financial policy announcements or crisis events
              </p>
              <div className="text-xs bg-gray-900 p-3 rounded">
                Use: Crisis Alerts + National Counter
              </div>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/50 p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Start Using DAMOCLES Data Today</h2>
          <p className="text-gray-300 mb-6">
            Join major Norwegian media outlets already using our widgets for real-time debt health reporting.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:press@damocles.no"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Contact Press Team
            </a>
            <a
              href="mailto:developers@damocles.no"
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Technical Support
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}