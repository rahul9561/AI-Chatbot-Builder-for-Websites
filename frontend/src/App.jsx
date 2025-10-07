import { useState, useEffect } from 'react';
import { Bot, Plus, Settings, MessageSquare, Copy, Check, LogOut, Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [view, setView] = useState('login');
  const [chatbots, setChatbots] = useState([]);
  const [selectedChatbot, setSelectedChatbot] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchChatbots();
      setView('dashboard');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchChatbots = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/chatbots`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch chatbots');
      const data = await res.json();
      setChatbots(data);
    } catch (err) {
      console.error('Error fetching chatbots:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async (chatbotId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/conversations/${chatbotId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch conversations');
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setView('login');
    setChatbots([]);
    setSelectedChatbot(null);
    setConversations([]);
  };

  if (!token || view === 'login') {
    return <AuthView setToken={setToken} />;
  }

  if (view === 'create') {
    return <CreateChatbotView 
      token={token} 
      setView={setView} 
      fetchChatbots={fetchChatbots} 
    />;
  }

  if (view === 'conversations' && selectedChatbot) {
    return <ConversationsView 
      chatbot={selectedChatbot} 
      conversations={conversations}
      loading={loading}
      setView={setView}
      setSelectedChatbot={setSelectedChatbot}
      fetchConversations={fetchConversations}
    />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">Chatbot Builder</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Your Chatbots</h2>
            <p className="text-gray-600 mt-1">Manage and monitor your AI assistants</p>
          </div>
          <button 
            onClick={() => setView('create')}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Create New Chatbot
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : chatbots.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No chatbots yet</h3>
            <p className="text-gray-600 mb-6">Create your first chatbot to get started</p>
            <button 
              onClick={() => setView('create')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Your First Chatbot
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chatbots.map((bot) => (
              <ChatbotCard 
                key={bot.id} 
                bot={bot} 
                onViewConversations={() => {
                  setSelectedChatbot(bot);
                  fetchConversations(bot.id);
                  setView('conversations');
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AuthView({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!res.ok) throw new Error('Authentication failed');
      
      const data = await res.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
    } catch (err) {
      setError(isLogin ? 'Invalid credentials' : 'Registration failed');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Bot className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">Chatbot Builder</h1>
          <p className="text-gray-600 mt-2">Build AI chatbots for your website</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
              required
              disabled={loading}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </div>

        <p className="text-center mt-6 text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 font-semibold hover:underline"
            disabled={loading}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}

function CreateChatbotView({ token, setView, fetchChatbots }) {
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState('');
  const [scrapingStatus, setScrapingStatus] = useState('');

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    setScrapingStatus('Scraping website content...');
    
    try {
      const res = await fetch(`${API_URL}/chatbots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name, 
          website_url: websiteUrl
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to create chatbot');
      }
      
      const data = await res.json();
      setEmbedCode(data.embed_code);
      setCreated(true);
      setScrapingStatus(`Successfully scraped ${data.pages_scraped || 1} page(s)!`);
      await fetchChatbots();
    } catch (err) {
      console.error('Error creating chatbot:', err);
      setError(err.message || 'Failed to create chatbot. Please check the URL and try again.');
      setScrapingStatus('');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBack = () => {
    setView('dashboard');
    setName('');
    setWebsiteUrl('');
    setEmbedCode('');
    setCreated(false);
    setError('');
    setScrapingStatus('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-3xl mx-auto py-8">
        <button 
          onClick={handleBack}
          className="mb-6 text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
          disabled={loading}
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Create New Chatbot</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chatbot Name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                placeholder="Support Assistant"
                required
                disabled={loading || created}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
                <span className="text-gray-500 text-xs ml-2">(We'll automatically scrape your website content)</span>
              </label>
              <input 
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                placeholder="https://yourwebsite.com"
                required
                disabled={loading || created}
              />
              <p className="mt-2 text-sm text-gray-500">
                💡 We'll automatically extract content from your website to train the chatbot
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {scrapingStatus && !error && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-600 text-sm flex items-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {scrapingStatus}
                </p>
              </div>
            )}

            <button 
              onClick={handleCreate}
              disabled={loading || created || !name || !websiteUrl}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Creating Chatbot...' : 'Create Chatbot'}
            </button>
          </div>

          {created && (
            <div className="mt-8 p-6 bg-green-50 rounded-lg border-2 border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-4">🎉 Chatbot Created Successfully!</h3>
              <p className="text-gray-600 mb-4">Copy this code and paste it before the closing &lt;/body&gt; tag on your website:</p>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                  {embedCode}
                </pre>
                <button 
                  onClick={copyCode}
                  className="absolute top-2 right-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center gap-1"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <button 
                onClick={handleBack}
                className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatbotCard({ bot, onViewConversations }) {
  const [copied, setCopied] = useState(false);

  const copyApiKey = () => {
    navigator.clipboard.writeText(bot.api_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <Bot className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{bot.name}</h3>
            <p className="text-sm text-gray-500 truncate max-w-xs">{bot.website_url}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">API Key</p>
          <div className="flex items-center gap-2">
            <code className="text-sm text-gray-700 flex-1 truncate">{bot.api_key}</code>
            <button 
              onClick={copyApiKey}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Copy API Key"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
            </button>
          </div>
        </div>

        <button 
          onClick={onViewConversations}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          View Conversations
        </button>
      </div>
    </div>
  );
}

function ConversationsView({ chatbot, conversations, loading, setView, setSelectedChatbot, fetchConversations }) {
  const handleRefresh = () => {
    if (chatbot) {
      fetchConversations(chatbot.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-5xl mx-auto py-8">
        <button 
          onClick={() => {
            setView('dashboard');
            setSelectedChatbot(null);
          }}
          className="mb-6 text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bot className="w-8 h-8 text-indigo-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{chatbot.name}</h2>
                <p className="text-gray-600">{conversations.length} conversations</p>
              </div>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No conversations yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bot Response</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {conversations.map((conv, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-900 max-w-md">
                        {conv.user_message}
                      </td>
                      <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-600 max-w-md">
                        {conv.bot_response}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(conv.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}