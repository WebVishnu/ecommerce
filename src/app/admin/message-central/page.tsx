"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  DollarSign, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Activity,
  BarChart3
} from 'lucide-react';

interface MessageCentralStatus {
  account: {
    balance?: number;
    balanceStatus: string;
    balanceMessage: string;
  };
  otpStats: {
    total: number;
    expired: number;
    active: number;
  };
  deliveryStatus?: {
    messageId: string;
    status: string;
    success: boolean;
    message: string;
  };
  timestamp: string;
}

export default function MessageCentralPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<MessageCentralStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageId, setMessageId] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
    }
  }, [isAdmin, router]);

  const fetchStatus = async (msgId?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = msgId 
        ? `/api/admin/message-central-status?messageId=${msgId}`
        : '/api/admin/message-central-status';
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setStatus(data.data);
      } else {
        setError(data.message || 'Failed to fetch status');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStatus(messageId);
    setRefreshing(false);
  };

  const handleCheckDelivery = async () => {
    if (messageId.trim()) {
      await fetchStatus(messageId.trim());
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStatus();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Message Central Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Monitor SMS delivery status and account information
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
          </div>
        ) : status ? (
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Account Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Account Balance</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{status.account.balance || 0}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {status.account.balanceStatus === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm text-gray-500">
                      {status.account.balanceMessage}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="text-sm text-gray-500">
                      {new Date(status.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* OTP Statistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                OTP Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-600">Total OTPs</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mt-2">
                    {status.otpStats.total}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-600">Active OTPs</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mt-2">
                    {status.otpStats.active}
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-red-600" />
                    <span className="text-gray-600">Expired OTPs</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600 mt-2">
                    {status.otpStats.expired}
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Status Check */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Check Delivery Status
              </h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={messageId}
                  onChange={(e) => setMessageId(e.target.value)}
                  placeholder="Enter Message ID to check delivery status"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleCheckDelivery}
                  disabled={!messageId.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  Check Status
                </button>
              </div>
              
              {status.deliveryStatus && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Delivery Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Message ID:</span>
                      <span className="font-mono">{status.deliveryStatus.messageId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        status.deliveryStatus.success ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {status.deliveryStatus.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Message:</span>
                      <span className="text-gray-900">{status.deliveryStatus.message}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
} 