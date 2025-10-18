'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertTriangle,
  TrendingDown,
  Shield,
  Award,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Creditor {
  id: string;
  name: string;
  type: string;
  violationScore: number;
  totalViolations: number;
  averageSettlementRate: number;
  _count?: {
    debts: number;
  };
}

export default function CreditorRankingsPage() {
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreditors();
  }, []);

  const fetchCreditors = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/creditors?limit=100`);
      const data = await response.json();
      setCreditors(data.creditors || []);
    } catch (error) {
      console.error('Failed to fetch creditors:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const getGradeColor = (grade: string): string => {
    const colors: Record<string, string> = {
      'A': 'bg-green-100 text-green-800 border-green-300',
      'B': 'bg-blue-100 text-blue-800 border-blue-300',
      'C': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'D': 'bg-orange-100 text-orange-800 border-orange-300',
      'F': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[grade] || colors['F'];
  };

  const getGradeIcon = (grade: string) => {
    if (grade === 'A') return <Award className="w-4 h-4 text-green-600" />;
    if (grade === 'B') return <CheckCircle className="w-4 h-4 text-blue-600" />;
    if (grade === 'C') return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    if (grade === 'D') return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const getStatusBadge = (violations: number) => {
    if (violations === 0) return <Badge className="bg-green-500">Clean</Badge>;
    if (violations < 5) return <Badge className="bg-yellow-500">Minor Issues</Badge>;
    if (violations < 10) return <Badge className="bg-orange-500">Concerning</Badge>;
    return <Badge className="bg-red-500">High Risk</Badge>;
  };

  // Sort creditors by violation score (descending) for "shame board"
  const sortedCreditors = [...creditors].sort((a, b) =>
    b.violationScore - a.violationScore
  );

  const topOffenders = sortedCreditors.slice(0, 5);
  const bestPerformers = [...sortedCreditors].reverse().slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Norwegian Creditor Transparency Board
          </h1>
          <p className="text-lg text-gray-600">
            Public accountability for GDPR compliance and consumer protection
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Inspired by the @ElonJet approach - Using public data to create accountability
          </p>
        </div>

        {/* Top Offenders - The "Shame Board" */}
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="w-6 h-6" />
              Top 5 Worst Offenders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topOffenders.map((creditor, index) => {
                const grade = calculateGrade(100 - creditor.violationScore);
                return (
                  <div
                    key={creditor.id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-red-600">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{creditor.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{creditor.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Violations</p>
                        <p className="text-2xl font-bold text-red-600">
                          {creditor.totalViolations}
                        </p>
                      </div>
                      <div className={`px-4 py-2 rounded-full border-2 ${getGradeColor(grade)} flex items-center gap-2`}>
                        {getGradeIcon(grade)}
                        <span className="font-bold text-xl">{grade}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Best Performers */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Shield className="w-6 h-6" />
              Top 5 Best Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bestPerformers.map((creditor, index) => {
                const grade = calculateGrade(100 - creditor.violationScore);
                return (
                  <div
                    key={creditor.id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-green-600">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{creditor.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{creditor.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Violations</p>
                        <p className="text-2xl font-bold text-green-600">
                          {creditor.totalViolations}
                        </p>
                      </div>
                      <div className={`px-4 py-2 rounded-full border-2 ${getGradeColor(grade)} flex items-center gap-2`}>
                        {getGradeIcon(grade)}
                        <span className="font-bold text-xl">{grade}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Full Rankings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Creditor Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Creditor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead className="text-center">Violations</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Cases</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCreditors.map((creditor, index) => {
                  const grade = calculateGrade(100 - creditor.violationScore);
                  return (
                    <TableRow key={creditor.id}>
                      <TableCell className="font-medium">#{index + 1}</TableCell>
                      <TableCell className="font-semibold">{creditor.name}</TableCell>
                      <TableCell className="capitalize">{creditor.type}</TableCell>
                      <TableCell className="text-center">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${getGradeColor(grade)}`}>
                          {getGradeIcon(grade)}
                          <span className="font-bold">{grade}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {creditor.totalViolations}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(creditor.totalViolations)}
                      </TableCell>
                      <TableCell className="text-right">
                        {creditor._count?.debts || 0}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="mb-2">
            Rankings updated in real-time based on GDPR compliance and consumer protection violations
          </p>
          <p>
            Data is public and verifiable through DAMOCLES platform
          </p>
          <p className="mt-4">
            <a href="/" className="text-blue-600 hover:underline font-medium">
              Check your creditor →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
