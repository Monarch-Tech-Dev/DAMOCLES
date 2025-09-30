'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  ClockIcon,
  DocumentIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useEventTimeline } from '@/lib/damocles-api';

// Event types based on our backend event system
export interface TimelineEvent {
  id: string;
  eventType: 'GDPR_REQUEST' | 'VIOLATION_DETECTED' | 'BLOCKCHAIN_EVIDENCE' | 'RISK_ASSESSMENT' | 'RESPONSE_RECEIVED' | 'TEMPLATE_SELECTED';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
  metadata?: {
    confidenceScore?: number;
    riskLevel?: string;
    templateUsed?: string;
    blockchainHash?: string;
    violationType?: string;
    creditorName?: string;
    [key: string]: any;
  };
}

interface EventTimelineProps {
  userId?: string;
  creditorId?: string;
  maxEvents?: number;
  autoRefresh?: boolean;
  className?: string;
}

const eventTypeIcons = {
  GDPR_REQUEST: DocumentIcon,
  VIOLATION_DETECTED: ExclamationTriangleIcon,
  BLOCKCHAIN_EVIDENCE: LinkIcon,
  RISK_ASSESSMENT: ShieldCheckIcon,
  RESPONSE_RECEIVED: UserIcon,
  TEMPLATE_SELECTED: CheckCircleIcon,
};

const eventTypeColors = {
  GDPR_REQUEST: 'bg-blue-500',
  VIOLATION_DETECTED: 'bg-red-500',
  BLOCKCHAIN_EVIDENCE: 'bg-purple-500',
  RISK_ASSESSMENT: 'bg-orange-500',
  RESPONSE_RECEIVED: 'bg-green-500',
  TEMPLATE_SELECTED: 'bg-indigo-500',
};

const statusColors = {
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
};

export function EventTimeline({
  userId,
  creditorId,
  maxEvents = 20,
  autoRefresh = true,
  className
}: EventTimelineProps) {
  const { data: eventData, loading, error, refetch } = useEventTimeline({
    userId,
    creditorId,
    limit: maxEvents,
    orderBy: 'timestamp',
    order: 'desc'
  });

  const events = eventData?.events || generateMockEvents();

  useEffect(() => {
    // Auto-refresh every 30 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(refetch, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refetch]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('no-NO', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderEventIcon = (event: TimelineEvent) => {
    const IconComponent = eventTypeIcons[event.eventType];
    const colorClass = eventTypeColors[event.eventType];

    return (
      <div className={cn(
        'flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full flex-shrink-0',
        colorClass
      )}>
        <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
      </div>
    );
  };

  const renderStatusBadge = (status: string) => {
    return (
      <Badge
        variant="outline"
        className={cn('text-xs', statusColors[status as keyof typeof statusColors])}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const renderMetadata = (metadata?: TimelineEvent['metadata']) => {
    if (!metadata) return null;

    return (
      <div className="mt-2 flex flex-wrap gap-1 sm:gap-2">
        {metadata.confidenceScore && (
          <span className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs text-gray-600">
            <span className="hidden sm:inline">Confidence: </span>
            <span className="sm:hidden">Conf: </span>
            {Math.round(metadata.confidenceScore * 100)}%
          </span>
        )}
        {metadata.riskLevel && (
          <span className={cn(
            "inline-flex items-center rounded-md px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs",
            metadata.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' :
            metadata.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :
            metadata.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          )}>
            <span className="hidden sm:inline">Risk: </span>
            {metadata.riskLevel}
          </span>
        )}
        {metadata.templateUsed && (
          <span className="inline-flex items-center rounded-md bg-indigo-100 px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs text-indigo-800">
            <span className="hidden sm:inline">Template: </span>
            <span className="sm:hidden">Tmpl: </span>
            <span className="truncate max-w-16 sm:max-w-none">
              {metadata.templateUsed}
            </span>
          </span>
        )}
        {metadata.blockchainHash && (
          <span className="inline-flex items-center rounded-md bg-purple-100 px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs text-purple-800">
            <span className="hidden sm:inline">Blockchain: </span>
            <span className="sm:hidden">BC: </span>
            {metadata.blockchainHash.substring(0, 6)}...
          </span>
        )}
        {metadata.creditorName && (
          <span className="inline-flex items-center rounded-md bg-blue-100 px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs text-blue-800 truncate max-w-24 sm:max-w-none">
            {metadata.creditorName}
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Event Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Event Timeline
          </div>
          <button
            onClick={refetch}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            disabled={loading}
          >
            Refresh
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p>No events found</p>
            <p className="text-sm">Timeline will update as actions occur</p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {events.map((event, eventIdx) => (
                <li key={event.id}>
                  <div className="relative pb-6 sm:pb-8">
                    {eventIdx !== events.length - 1 ? (
                      <span
                        className="absolute left-3 top-6 sm:left-4 sm:top-8 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-2 sm:space-x-3">
                      <div>{renderEventIcon(event)}</div>
                      <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:justify-between sm:space-x-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900 pr-2">
                              {event.title}
                            </p>
                            <div className="flex items-center justify-between sm:justify-start">
                              {renderStatusBadge(event.status)}
                              <div className="sm:hidden text-xs text-gray-500">
                                <time dateTime={event.timestamp}>
                                  {formatTimestamp(event.timestamp)}
                                </time>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                            {event.description}
                          </p>
                          {renderMetadata(event.metadata)}
                        </div>
                        <div className="hidden sm:block whitespace-nowrap text-right text-sm text-gray-500">
                          <time dateTime={event.timestamp}>
                            {formatTimestamp(event.timestamp)}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Mock data for development/testing
function generateMockEvents(): TimelineEvent[] {
  const now = new Date();

  return [
    {
      id: '1',
      eventType: 'GDPR_REQUEST',
      title: 'GDPR Request Generated',
      description: 'Generated comprehensive GDPR request with Article 22 compliance for Norwegian jurisdiction',
      timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
      status: 'success',
      metadata: {
        confidenceScore: 0.95,
        templateUsed: 'gdpr_inkasso.html',
        creditorName: 'ABC Inkasso AS'
      }
    },
    {
      id: '2',
      eventType: 'BLOCKCHAIN_EVIDENCE',
      title: 'Evidence Recorded on Blockchain',
      description: 'GDPR request evidence timestamped on Cardano blockchain for legal integrity',
      timestamp: new Date(now.getTime() - 10 * 60000).toISOString(),
      status: 'success',
      metadata: {
        blockchainHash: 'abc123def456789',
        confidenceScore: 1.0
      }
    },
    {
      id: '3',
      eventType: 'RISK_ASSESSMENT',
      title: 'Collector Risk Assessment Completed',
      description: 'Comprehensive risk analysis shows high violation probability',
      timestamp: new Date(now.getTime() - 20 * 60000).toISOString(),
      status: 'warning',
      metadata: {
        riskLevel: 'HIGH',
        confidenceScore: 0.87,
        creditorName: 'ABC Inkasso AS'
      }
    },
    {
      id: '4',
      eventType: 'VIOLATION_DETECTED',
      title: 'GDPR Violation Pattern Detected',
      description: 'Settlement logic contradiction found in creditor response patterns',
      timestamp: new Date(now.getTime() - 35 * 60000).toISOString(),
      status: 'error',
      metadata: {
        violationType: 'SETTLEMENT_LOGIC',
        confidenceScore: 0.92,
        creditorName: 'ABC Inkasso AS'
      }
    },
    {
      id: '5',
      eventType: 'TEMPLATE_SELECTED',
      title: 'Intelligent Template Selection',
      description: 'Selected Norwegian inkasso template with Schufa ruling integration',
      timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
      status: 'info',
      metadata: {
        templateUsed: 'gdpr_inkasso.html',
        confidenceScore: 0.98
      }
    }
  ];
}

export default EventTimeline;