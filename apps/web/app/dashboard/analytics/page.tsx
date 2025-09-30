'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import EventTimeline from '@/components/dashboard/EventTimeline';
import RiskScoreDashboard from '@/components/dashboard/RiskScoreDashboard';
import TemplateSelector from '@/components/dashboard/TemplateSelector';
import {
  ChartBarIcon,
  ClockIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

export default function AnalyticsDashboard() {
  const [selectedCreditor, setSelectedCreditor] = useState<string>('abc123');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const mockUserData = {
    email: 'test@example.no',
    creditorName: 'ABC Inkasso AS',
    creditorType: 'inkasso',
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Comprehensive view of GDPR requests, risk analysis, and template selection
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2" size="sm">
            <ArrowPathIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh All</span>
            <span className="sm:hidden">Refresh</span>
          </Button>
          <Button className="flex items-center gap-2" size="sm">
            <Cog6ToothIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden">Config</span>
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                Sacred Architecture Dashboard
              </h3>
              <p className="text-sm text-blue-800 mt-1">
                This dashboard showcases the new frontend components for event timeline visualization,
                risk score analysis, and intelligent template selection with Article 22 compliance
                and Schufa ruling integration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
            <ChartBarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Home</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
            <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Event Timeline</span>
            <span className="sm:hidden">Events</span>
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
            <ChartBarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Risk Analysis</span>
            <span className="sm:hidden">Risk</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
            <DocumentTextIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Templates</span>
            <span className="sm:hidden">Tmpls</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - All components together */}
        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Event Timeline */}
            <div className="lg:col-span-1">
              <EventTimeline
                key={`timeline-${refreshKey}`}
                userId="cmg45ywwx0000j4fmneiqk23g"
                maxEvents={8}
                autoRefresh={true}
              />
            </div>

            {/* Template Selector */}
            <div className="lg:col-span-1">
              <TemplateSelector
                userEmail={mockUserData.email}
                creditorName={mockUserData.creditorName}
                creditorType={mockUserData.creditorType}
                onTemplateSelect={(template, metadata) => {
                  console.log('Template selected:', template, metadata);
                }}
              />
            </div>
          </div>

          {/* Risk Dashboard - Full width */}
          <div className="w-full">
            <RiskScoreDashboard
              key={`risk-${refreshKey}`}
              collectorId={selectedCreditor}
              showComparison={true}
            />
          </div>
        </TabsContent>

        {/* Individual Component Tabs */}
        <TabsContent value="timeline" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Event Timeline - Detailed View</CardTitle>
              <p className="text-xs sm:text-sm text-gray-600">
                Real-time visualization of GDPR requests, blockchain evidence, and violation detection events
              </p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <EventTimeline
                key={`timeline-detail-${refreshKey}`}
                userId="cmg45ywwx0000j4fmneiqk23g"
                maxEvents={30}
                autoRefresh={true}
                className="border-0 shadow-none"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Risk Score Analysis - Detailed View</CardTitle>
              <p className="text-xs sm:text-sm text-gray-600">
                Comprehensive risk assessment with trend analysis and collector comparison
              </p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <RiskScoreDashboard
                key={`risk-detail-${refreshKey}`}
                collectorId={selectedCreditor}
                showComparison={true}
                className="border-0 shadow-none"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Template Selection - Advanced</CardTitle>
                <p className="text-xs sm:text-sm text-gray-600">
                  AI-powered template selection with jurisdiction detection and Schufa ruling integration
                </p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <TemplateSelector
                  userEmail={mockUserData.email}
                  creditorName={mockUserData.creditorName}
                  creditorType={mockUserData.creditorType}
                  onTemplateSelect={(template, metadata) => {
                    console.log('Template selected:', template, metadata);
                  }}
                  className="border-0 shadow-none"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Template Features</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-green-50 rounded-lg">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-green-900">Article 22 Compliance</h4>
                      <p className="text-xs sm:text-sm text-green-800">
                        Full integration of EU Court of Justice ruling C-634/21 for automated decision-making
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50 rounded-lg">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-blue-900">Schufa Ruling Integration</h4>
                      <p className="text-xs sm:text-sm text-blue-800">
                        Incorporates requirements for meaningful information about credit scoring algorithms
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-purple-50 rounded-lg">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-purple-900">Multi-Jurisdiction Support</h4>
                      <p className="text-xs sm:text-sm text-purple-800">
                        Templates for Norwegian, Swedish, Danish, Finnish, and EU jurisdictions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-orange-50 rounded-lg">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-orange-900">Intelligent Detection</h4>
                      <p className="text-xs sm:text-sm text-orange-800">
                        Automatic jurisdiction and language detection with confidence scoring
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6">
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">24/7</p>
                <p className="text-xs sm:text-sm text-gray-600">Real-time monitoring</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">95%</p>
                <p className="text-xs sm:text-sm text-gray-600">Template accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <DocumentTextIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">100%</p>
                <p className="text-xs sm:text-sm text-gray-600">GDPR compliant</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}