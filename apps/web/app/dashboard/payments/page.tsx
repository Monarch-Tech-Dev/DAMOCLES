'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Receipt, AlertCircle, CheckCircle } from 'lucide-react';

interface Invoice {
  id: string;
  caseId: string;
  recoveryAmount: number;
  platformFee: number;
  vatAmount: number;
  processingFee: number;
  totalDue: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  description?: string;
  dueDate: string;
  paidAt?: string;
  debt: {
    creditorName: string;
    description: string;
  };
}

interface PaymentHistory {
  id: string;
  amount: number;
  method: string;
  status: string;
  description: string;
  processedAt: string;
  debt: {
    creditorName: string;
    originalAmount: number;
    description: string;
  };
}

export default function PaymentsPage() {
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      // Mock data - in production this would come from API
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          caseId: 'debt-123',
          recoveryAmount: 4196,
          platformFee: 1049,
          vatAmount: 262,
          processingFee: 32,
          totalDue: 1343,
          status: 'pending',
          description: 'DAMOCLES Success Fee - Case 456abc78',
          dueDate: '2025-10-01T00:00:00Z',
          debt: {
            creditorName: 'Kredinor AS',
            description: 'Illegal fee recovery'
          }
        }
      ];

      const mockHistory: PaymentHistory[] = [
        {
          id: '1',
          amount: 875,
          method: 'stripe',
          status: 'completed',
          description: 'Success fee payment',
          processedAt: '2025-01-15T10:30:00Z',
          debt: {
            creditorName: 'Lindorff Norge AS',
            originalAmount: 3500,
            description: 'Processing fee violation'
          }
        }
      ];

      setPendingInvoices(mockInvoices);
      setPaymentHistory(mockHistory);
    } catch (error) {
      console.error('Failed to fetch payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFeeBreakdown = (recoveryAmount: number) => {
    const platformFee = Math.round(recoveryAmount * 0.25);
    const vatAmount = Math.round(platformFee * 0.25);
    const processingFee = Math.min(50, Math.round(platformFee * 0.029) + 2);
    const userNet = recoveryAmount - platformFee - vatAmount - processingFee;

    return {
      recoveryAmount,
      platformFee,
      vatAmount,
      processingFee,
      userNet,
      totalFee: platformFee + vatAmount + processingFee
    };
  };

  const handlePayment = async (invoiceId: string, method: 'stripe' | 'vipps') => {
    setProcessingPayment(invoiceId);

    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, this would call the payment API
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          paymentMethod: method,
          paymentMethodId: 'pm_mock_card'
        })
      });

      if (response.ok) {
        // Update the invoice status
        setPendingInvoices(prev =>
          prev.map(invoice =>
            invoice.id === invoiceId
              ? { ...invoice, status: 'paid' as const, paidAt: new Date().toISOString() }
              : invoice
          )
        );

        // Refresh payment history
        await fetchPaymentData();
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessingPayment(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-md w-1/4 mb-6"></div>
          <div className="grid gap-4">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CreditCard className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Payment Management</h1>
      </div>

      {/* Pending Invoices */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Pending Success Fees ({pendingInvoices.length})
        </h2>

        {pendingInvoices.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8 text-center">
              <div className="space-y-2">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <p className="text-gray-600">No pending payments</p>
                <p className="text-sm text-gray-500">All your success fees have been paid</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          pendingInvoices.map((invoice) => (
            <Card key={invoice.id} className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Success Fee - {invoice.debt.creditorName}
                  </CardTitle>
                  {getStatusBadge(invoice.status)}
                </div>
                <p className="text-sm text-gray-600">{invoice.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Fee Breakdown */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700">Fee Breakdown</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-600">Recovery Amount:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(invoice.recoveryAmount)}</span>

                    <span className="text-gray-600">Platform Fee (25%):</span>
                    <span>{formatCurrency(invoice.platformFee)}</span>

                    <span className="text-gray-600">VAT (25%):</span>
                    <span>{formatCurrency(invoice.vatAmount)}</span>

                    <span className="text-gray-600">Processing Fee:</span>
                    <span>{formatCurrency(invoice.processingFee)}</span>

                    <hr className="col-span-2 my-1" />

                    <span className="font-semibold">Total Due:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(invoice.totalDue)}</span>

                    <span className="font-semibold text-green-600">Your Net Recovery:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(invoice.recoveryAmount - invoice.totalDue)}
                    </span>
                  </div>
                </div>

                {/* Payment Actions */}
                {invoice.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handlePayment(invoice.id, 'stripe')}
                      disabled={processingPayment === invoice.id}
                      className="flex-1"
                    >
                      {processingPayment === invoice.id ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay with Card
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handlePayment(invoice.id, 'vipps')}
                      disabled={processingPayment === invoice.id}
                    >
                      Vipps
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <AlertCircle className="h-4 w-4" />
                  Due: {new Date(invoice.dueDate).toLocaleDateString('no-NO')}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Payment History */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Payment History</h2>

        {paymentHistory.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-gray-500">
              No payment history yet
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {paymentHistory.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <p className="font-medium">{payment.debt.creditorName}</p>
                    <p className="text-sm text-gray-600">{payment.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(payment.processedAt).toLocaleDateString('no-NO')} • {payment.method.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                    {getStatusBadge(payment.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Success Fee Explanation */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            How Success Fees Work
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2">
          <p className="text-sm">
            • You only pay when we successfully recover money for you
          </p>
          <p className="text-sm">
            • Our fee is 25% of the recovered amount + VAT and processing fees
          </p>
          <p className="text-sm">
            • You keep 70-75% of all money we recover on your behalf
          </p>
          <p className="text-sm">
            • No recovery = no fee. We only succeed when you do.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}