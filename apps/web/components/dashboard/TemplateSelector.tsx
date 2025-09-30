'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  DocumentTextIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LanguageIcon,
  BuildingOffice2Icon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useTemplateSelection } from '@/lib/damocles-api';

interface TemplateMetadata {
  detected_jurisdiction: string;
  detected_language: string;
  detected_creditor_type: string;
  template_filename: string;
  template_path: string;
  fallback_chain: string[];
  features: {
    has_schufa_ruling: boolean;
    has_article_22: boolean;
    has_local_laws: boolean;
    has_enhanced_inkasso: boolean;
    supports_nordic_compliance: boolean;
  };
  confidence_score: number;
  schufa_ruling_included: boolean;
  article_22_compliance: boolean;
}

interface TemplateOption {
  id: string;
  name: string;
  description: string;
  jurisdiction: string;
  language: string;
  creditor_type: string;
  features: string[];
  confidence: number;
  recommended: boolean;
}

interface TemplateSelectorProps {
  userEmail?: string;
  creditorName?: string;
  creditorType?: string;
  jurisdiction?: string;
  language?: string;
  onTemplateSelect?: (template: TemplateOption, metadata: TemplateMetadata) => void;
  className?: string;
}

const jurisdictionFlags = {
  norway: '🇳🇴',
  sweden: '🇸🇪',
  denmark: '🇩🇰',
  finland: '🇫🇮',
  eu_general: '🇪🇺',
};

const languageNames = {
  no: 'Norsk',
  sv: 'Svenska',
  da: 'Dansk',
  fi: 'Suomi',
  en: 'English',
};

const creditorTypeIcons = {
  inkasso: BuildingOffice2Icon,
  bank: BuildingOffice2Icon,
  bnpl: DocumentTextIcon,
  default: DocumentTextIcon,
};

export function TemplateSelector({
  userEmail,
  creditorName,
  creditorType,
  jurisdiction,
  language,
  onTemplateSelect,
  className
}: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateOption | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<TemplateOption[]>([]);
  const [previewContent, setPreviewContent] = useState<string>('');

  const userData = {
    user_email: userEmail,
    creditor_name: creditorName,
    creditor_type: creditorType,
    jurisdiction,
    language,
  };

  const { data: templateResponse, loading, error, selectTemplate } = useTemplateSelection(userData);

  useEffect(() => {
    if (templateResponse?.metadata) {
      const options = generateTemplateOptions(templateResponse.metadata);
      setAvailableTemplates(options);

      // Auto-select the recommended template
      const recommended = options.find(opt => opt.recommended);
      if (recommended) {
        setSelectedTemplate(recommended);
      }
    } else if (!loading && !error) {
      // Fallback to mock data
      const mockMetadata = generateMockMetadata();
      const mockOptions = generateTemplateOptions(mockMetadata);
      setAvailableTemplates(mockOptions);
      setSelectedTemplate(mockOptions[0]);
    }
  }, [templateResponse, loading, error]);

  const generateTemplateOptions = (metadata: TemplateMetadata): TemplateOption[] => {
    const base = {
      jurisdiction: metadata.detected_jurisdiction,
      language: metadata.detected_language,
      creditor_type: metadata.detected_creditor_type,
    };

    const templates: TemplateOption[] = [
      {
        id: 'recommended',
        name: `${base.creditor_type.charAt(0).toUpperCase() + base.creditor_type.slice(1)} Template`,
        description: `Optimized for ${base.jurisdiction} jurisdiction with ${languageNames[base.language as keyof typeof languageNames]} language`,
        jurisdiction: base.jurisdiction,
        language: base.language,
        creditor_type: base.creditor_type,
        features: [
          metadata.features.has_schufa_ruling ? 'Schufa Ruling (EU C-634/21)' : '',
          metadata.features.has_article_22 ? 'Article 22 Compliance' : '',
          metadata.features.has_local_laws ? 'Local Law Integration' : '',
          metadata.features.has_enhanced_inkasso ? 'Enhanced Inkasso Features' : '',
          metadata.features.supports_nordic_compliance ? 'Nordic Compliance' : '',
        ].filter(Boolean),
        confidence: metadata.confidence_score,
        recommended: true,
      },
    ];

    // Add alternative templates
    if (base.language !== 'en') {
      templates.push({
        id: 'english',
        name: 'English Template',
        description: `Same jurisdiction (${base.jurisdiction}) but in English`,
        jurisdiction: base.jurisdiction,
        language: 'en',
        creditor_type: base.creditor_type,
        features: ['Article 22 Compliance', 'Schufa Ruling'],
        confidence: 0.7,
        recommended: false,
      });
    }

    if (base.jurisdiction !== 'eu_general') {
      templates.push({
        id: 'eu_general',
        name: 'EU General Template',
        description: 'General EU template with broad compliance coverage',
        jurisdiction: 'eu_general',
        language: 'en',
        creditor_type: base.creditor_type,
        features: ['Article 22 Compliance', 'GDPR Compliance'],
        confidence: 0.5,
        recommended: false,
      });
    }

    return templates;
  };

  const handleTemplateSelect = (template: TemplateOption) => {
    setSelectedTemplate(template);
    if (onTemplateSelect && templateResponse?.metadata) {
      onTemplateSelect(template, templateResponse.metadata);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return CheckCircleIcon;
    if (confidence >= 0.6) return ExclamationTriangleIcon;
    return InformationCircleIcon;
  };

  const renderFeatures = (features: string[]) => {
    const displayFeatures = features.slice(0, 3);
    const remainingCount = features.length - 3;

    return (
      <div className="flex flex-wrap gap-1 mt-1 sm:mt-2">
        {displayFeatures.map((feature, index) => (
          <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5">
            <span className="hidden sm:inline">{feature}</span>
            <span className="sm:hidden">
              {feature.includes('Schufa') ? 'Schufa' :
               feature.includes('Article') ? 'Art.22' :
               feature.includes('Local') ? 'Local' :
               feature.includes('Enhanced') ? 'Enhanced' :
               feature.includes('Nordic') ? 'Nordic' :
               feature.substring(0, 8)}
            </span>
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            +{remainingCount}
          </Badge>
        )}
      </div>
    );
  };

  const renderTemplateOption = (template: TemplateOption) => {
    const isSelected = selectedTemplate?.id === template.id;
    const CreditorIcon = creditorTypeIcons[template.creditor_type as keyof typeof creditorTypeIcons];
    const ConfidenceIcon = getConfidenceIcon(template.confidence);

    return (
      <div
        key={template.id}
        className={cn(
          'relative rounded-lg border p-3 sm:p-4 cursor-pointer transition-all',
          isSelected
            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
            : 'border-gray-200 hover:border-gray-300',
          template.recommended && 'ring-2 ring-green-500 border-green-500'
        )}
        onClick={() => handleTemplateSelect(template)}
      >
        {template.recommended && (
          <div className="absolute -top-2 -right-2">
            <Badge className="bg-green-500 text-white">Recommended</Badge>
          </div>
        )}

        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-shrink-0">
            <CreditorIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {template.name}
              </h3>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-base sm:text-lg">
                  {jurisdictionFlags[template.jurisdiction as keyof typeof jurisdictionFlags]}
                </span>
                <span className="text-xs text-gray-500">
                  {languageNames[template.language as keyof typeof languageNames]}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
              {template.description}
            </p>

            {renderFeatures(template.features)}

            <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-3">
              <ConfidenceIcon className={cn('h-3 w-3 sm:h-4 sm:w-4', getConfidenceColor(template.confidence))} />
              <span className={cn('text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded', getConfidenceColor(template.confidence))}>
                {Math.round(template.confidence * 100)}% conf
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5" />
            Template Selection
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
        <CardTitle className="flex items-center gap-2">
          <DocumentTextIcon className="h-5 w-5" />
          Template Selection
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          AI-powered template selection with jurisdiction and language detection
        </p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error.message}
          </div>
        )}

        {templateResponse?.metadata && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Detection Results</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
              <div className="flex justify-between sm:block">
                <span className="text-gray-600">Jurisdiction:</span>
                <span className="ml-1 sm:ml-2 font-medium">
                  {jurisdictionFlags[templateResponse.metadata.detected_jurisdiction as keyof typeof jurisdictionFlags]}{' '}
                  <span className="hidden sm:inline">{templateResponse.metadata.detected_jurisdiction}</span>
                </span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-gray-600">Language:</span>
                <span className="ml-1 sm:ml-2 font-medium">
                  {languageNames[templateResponse.metadata.detected_language as keyof typeof languageNames]}
                </span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-gray-600">Creditor Type:</span>
                <span className="ml-1 sm:ml-2 font-medium capitalize">
                  {templateResponse.metadata.detected_creditor_type}
                </span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-gray-600">Confidence:</span>
                <span className={cn('ml-1 sm:ml-2 font-medium', getConfidenceColor(templateResponse.metadata.confidence_score))}>
                  {Math.round(templateResponse.metadata.confidence_score * 100)}%
                </span>
              </div>
            </div>

            {templateResponse.metadata.fallback_chain.length > 0 && (
              <div className="mt-3">
                <span className="text-gray-600 text-xs">Fallbacks used:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {templateResponse.metadata.fallback_chain.map((fallback, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5">
                      {fallback.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Available Templates</h4>
          {availableTemplates.map(renderTemplateOption)}
        </div>

        {selectedTemplate && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleIcon className="h-5 w-5 text-blue-600" />
              <h4 className="text-sm font-medium text-blue-900">Selected Template</h4>
            </div>
            <p className="text-sm text-blue-800 mb-3">
              {selectedTemplate.name} - {selectedTemplate.description}
            </p>

            <div className="flex items-center gap-2">
              <ScaleIcon className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-blue-800">
                Includes: Article 22 compliance, Schufa ruling integration, and local legal requirements
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            onClick={() => selectTemplate()}
            variant="outline"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
            size="sm"
          >
            <GlobeAltIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Re-detect</span>
            <span className="sm:hidden">Detect</span>
          </Button>

          {selectedTemplate && (
            <Button
              onClick={() => selectedTemplate && templateResponse?.metadata && onTemplateSelect?.(selectedTemplate, templateResponse.metadata)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
              size="sm"
            >
              <DocumentTextIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Use Template</span>
              <span className="sm:hidden">Use</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function generateMockMetadata(): TemplateMetadata {
  return {
    detected_jurisdiction: 'norway',
    detected_language: 'no',
    detected_creditor_type: 'inkasso',
    template_filename: 'gdpr_inkasso.html',
    template_path: '/templates/gdpr_inkasso.html',
    fallback_chain: [],
    features: {
      has_schufa_ruling: true,
      has_article_22: true,
      has_local_laws: true,
      has_enhanced_inkasso: true,
      supports_nordic_compliance: true,
    },
    confidence_score: 0.95,
    schufa_ruling_included: true,
    article_22_compliance: true,
  };
}

export default TemplateSelector;