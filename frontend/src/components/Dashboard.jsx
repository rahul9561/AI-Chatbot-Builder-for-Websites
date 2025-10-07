import  { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChatBubbleLeftRightIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  PlusIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [chatbots, setChatbots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = () => {
    const staticStats = {
      total_chatbots: 3,
      total_conversations: 45,
      total_messages: 234,
      today_conversations: 5,
      plan: 'free_trial',
      trial_ends_at: '2025-11-01T00:00:00Z'
    };

    const staticChatbots = [
      {
        id: 1,
        name: 'Customer Support Bot',
        status: 'active',
        website_url: 'https://example.com/support',
        total_conversations: 20,
        total_messages: 150
      },
      {
        id: 2,
        name: 'Sales Assistant',
        status: 'training',
        website_url: 'https://example.com/sales',
        total_conversations: 15,
        total_messages: 50
      },
      {
        id: 3,
        name: 'FAQ Helper',
        status: 'paused',
        website_url: 'https://example.com/faq',
        total_conversations: 10,
        total_messages: 34
      }
    ];

    setStats(staticStats);
    setChatbots(staticChatbots);
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      training: 'bg-yellow-100 text-yellow-800',
      paused: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your AI chatbots and monitor performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <RocketLaunchIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Chatbots</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_chatbots || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversations</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_conversations || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_messages || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.today_conversations || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbots Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Your Chatbots</h2>
          <Link
            to="/chatbots/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create New Chatbot
          </Link>
        </div>

        <div className="divide-y divide-gray-200">
          {chatbots.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <RocketLaunchIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No chatbots</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new chatbot.</p>
              <div className="mt-6">
                <Link
                  to="/chatbots/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Chatbot
                </Link>
              </div>
            </div>
          ) : (
            chatbots.map((chatbot) => (
              <div key={chatbot.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">{chatbot.name}</h3>
                      {getStatusBadge(chatbot.status)}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{chatbot.website_url}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>{chatbot.total_conversations} conversations</span>
                      <span>•</span>
                      <span>{chatbot.total_messages} messages</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Link
                      to={`/chatbots/${chatbot.id}/analytics`}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Analytics"
                    >
                      <ChartBarIcon className="h-5 w-5" />
                    </Link>
                    <Link
                      to={`/chatbots/${chatbot.id}/settings`}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Settings"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Trial Banner */}
      {stats?.plan === 'free_trial' && stats?.trial_ends_at && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Free Trial Active</h3>
              <p className="mt-1 text-sm text-yellow-700">
                Your trial ends on {new Date(stats.trial_ends_at).toLocaleDateString()}. 
                <Link to="/pricing" className="ml-1 font-medium underline">
                  Upgrade now
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}