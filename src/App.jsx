import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Ticket, AlertTriangle, Settings, FileText, Shield, MessageSquare, Ban } from 'lucide-react';

// Get from environment variables (set in Vercel)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_SECRET = import.meta.env.VITE_API_SECRET || 'your-secret-here';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [applications, setApplications] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [bans, setBans] = useState([]);
  const [staff, setStaff] = useState([]);
  const [messageLogs, setMessageLogs] = useState([]);
  const [settings, setSettings] = useState({});
  const [questions, setQuestions] = useState({ staff: [], admin: [], developer: [] });
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  const fetchData = async (endpoint) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${API_SECRET}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return null;
    }
  };

  // Load all data
  const loadData = async () => {
    setLoading(true);
    const [statsData, ticketsData, appsData, warningsData, bansData, staffData, messagesData, settingsData, questionsData] = await Promise.all([
      fetchData('/stats'),
      fetchData('/tickets'),
      fetchData('/applications'),
      fetchData('/warnings'),
      fetchData('/bans'),
      fetchData('/staff'),
      fetchData('/message-logs'),
      fetchData('/settings'),
      fetchData('/application-questions')
    ]);

    if (statsData) setStats(statsData);
    if (ticketsData) setTickets(ticketsData);
    if (appsData) setApplications(appsData);
    if (warningsData) setWarnings(warningsData);
    if (bansData) setBans(bansData);
    if (staffData) setStaff(staffData);
    if (messagesData) setMessageLogs(messagesData);
    if (settingsData) setSettings(settingsData);
    if (questionsData) setQuestions(questionsData);
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Save settings
  const saveSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${API_SECRET}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  // Save questions
  const saveQuestions = async (type) => {
    try {
      const response = await fetch(`${API_URL}/application-questions`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${API_SECRET}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, questions: questions[type] })
      });
      if (response.ok) {
        alert(`${type} questions saved successfully!`);
      }
    } catch (error) {
      console.error('Error saving questions:', error);
      alert('Failed to save questions');
    }
  };

  // Send message to user
  const sendMessage = async (userId, message) => {
    try {
      const response = await fetch(`${API_URL}/send-message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_SECRET}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from_staff: 'dashboard',
          to_user: userId,
          message: message
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Message sent successfully!');
      } else {
        alert('Failed to send message: ' + data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  // Review application
  const reviewApplication = async (appId, action) => {
    try {
      const response = await fetch(`${API_URL}/applications/${appId}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_SECRET}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, reviewer_id: 'dashboard' })
      });
      if (response.ok) {
        alert(`Application ${action}d successfully!`);
        loadData();
      }
    } catch (error) {
      console.error('Error reviewing application:', error);
      alert('Failed to review application');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-400">🎮 Roblox Bot Dashboard</h1>
          <div className="text-sm text-gray-400">Last updated: {new Date().toLocaleTimeString()}</div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'tickets', label: 'Tickets', icon: Ticket },
            { id: 'applications', label: 'Applications', icon: FileText },
            { id: 'warnings', label: 'Warnings', icon: AlertTriangle },
            { id: 'bans', label: 'Bans', icon: Ban },
            { id: 'staff', label: 'Staff', icon: Shield },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'questions', label: 'App Questions', icon: FileText },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Members" value={stats.members} icon={Users} color="blue" />
              <StatCard title="Open Tickets" value={stats.tickets?.open || 0} icon={Ticket} color="green" />
              <StatCard title="Pending Applications" value={stats.applications?.pending || 0} icon={FileText} color="yellow" />
              <StatCard title="Active Bans" value={stats.bans || 0} icon={Ban} color="red" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Ticket className="mr-2" /> Recent Tickets
                </h3>
                <div className="space-y-2">
                  {tickets.slice(0, 5).map(ticket => (
                    <div key={ticket.id} className="bg-gray-700 p-3 rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Ticket #{ticket.id}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          ticket.status === 'open' ? 'bg-green-600' : 'bg-gray-600'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">User: {ticket.user_id}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <FileText className="mr-2" /> Recent Applications
                </h3>
                <div className="space-y-2">
                  {applications.slice(0, 5).map(app => (
                    <div key={app.id} className="bg-gray-700 p-3 rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{app.type} Application</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          app.status === 'pending' ? 'bg-yellow-600' :
                          app.status === 'approved' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">User: {app.user_id}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">All Tickets</h2>
            <div className="space-y-3">
              {tickets.map(ticket => (
                <div key={ticket.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-lg">Ticket #{ticket.id}</div>
                      <div className="text-sm text-gray-400">User ID: {ticket.user_id}</div>
                      <div className="text-sm text-gray-400">Channel ID: {ticket.channel_id}</div>
                      <div className="text-sm text-gray-400">Created: {new Date(ticket.created_at).toLocaleString()}</div>
                    </div>
                    <span className={`px-3 py-1 rounded ${
                      ticket.status === 'open' ? 'bg-green-600' : 'bg-gray-600'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">All Applications</h2>
            <div className="space-y-4">
              {applications.map(app => (
                <div key={app.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-lg">{app.type.toUpperCase()} Application</div>
                      <div className="text-sm text-gray-400">User ID: {app.user_id}</div>
                      <div className="text-sm text-gray-400">Created: {new Date(app.created_at).toLocaleString()}</div>
                    </div>
                    <span className={`px-3 py-1 rounded ${
                      app.status === 'pending' ? 'bg-yellow-600' :
                      app.status === 'approved' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mt-3">
                    {app.answers && app.answers.map((qa, idx) => (
                      <div key={idx} className="bg-gray-600 p-3 rounded">
                        <div className="font-semibold text-sm text-blue-400">{qa.question}</div>
                        <div className="text-sm mt-1">{qa.answer}</div>
                      </div>
                    ))}
                  </div>

                  {app.status === 'pending' && (
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => reviewApplication(app.id, 'approve')}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => reviewApplication(app.id, 'deny')}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                      >
                        Deny
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings Tab */}
        {activeTab === 'warnings' && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">All Warnings</h2>
            <div className="space-y-3">
              {warnings.map(warn => (
                <div key={warn.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="font-bold">Warning #{warn.id}</div>
                  <div className="text-sm text-gray-400">User ID: {warn.user_id}</div>
                  <div className="text-sm text-gray-400">Moderator ID: {warn.moderator_id}</div>
                  <div className="text-sm mt-2">Reason: {warn.reason}</div>
                  <div className="text-xs text-gray-500 mt-1">{new Date(warn.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bans Tab */}
        {activeTab === 'bans' && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">All Bans</h2>
            <div className="space-y-3">
              {bans.map(ban => (
                <div key={ban.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold">Ban #{ban.id}</div>
                      <div className="text-sm text-gray-400">User ID: {ban.user_id}</div>
                      <div className="text-sm text-gray-400">Moderator ID: {ban.moderator_id}</div>
                      <div className="text-sm mt-2">Reason: {ban.reason}</div>
                      <div className="text-sm text-gray-400">Duration: {ban.duration}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(ban.timestamp).toLocaleString()}</div>
                    </div>
                    <span className={`px-3 py-1 rounded ${
                      ban.active ? 'bg-red-600' : 'bg-gray-600'
                    }`}>
                      {ban.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Staff Members</h2>
            <div className="space-y-3">
              {staff.map(member => (
                <div key={member.user_id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold">User ID: {member.user_id}</div>
                      <div className="text-sm text-gray-400">
                        Rank: {member.rank_info?.name || member.rank}
                      </div>
                      <div className="text-sm text-gray-400">Level: {member.rank_info?.level || 'N/A'}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Promoted: {new Date(member.promoted_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Promoted by</div>
                      <div className="text-sm">{member.promoted_by}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Message User</h2>
            <div className="mb-6">
              <input
                type="text"
                placeholder="User ID"
                id="messageUserId"
                className="w-full bg-gray-700 text-white p-3 rounded mb-3"
              />
              <textarea
                placeholder="Message content..."
                id="messageContent"
                className="w-full bg-gray-700 text-white p-3 rounded mb-3 h-32"
              />
              <button
                onClick={() => {
                  const userId = document.getElementById('messageUserId').value;
                  const content = document.getElementById('messageContent').value;
                  if (userId && content) {
                    sendMessage(userId, content);
                    document.getElementById('messageUserId').value = '';
                    document.getElementById('messageContent').value = '';
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded"
              >
                Send Message
              </button>
            </div>

            <h3 className="text-xl font-bold mb-3">Recent Messages</h3>
            <div className="space-y-3">
              {messageLogs.slice(0, 20).map(log => (
                <div key={log.id} className="bg-gray-700 p-3 rounded">
                  <div className="text-sm text-gray-400">User: {log.user_id}</div>
                  <div className="text-sm text-gray-400">Channel: {log.channel_id}</div>
                  <div className="mt-2">{log.content}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            {['staff', 'admin', 'developer'].map(type => (
              <div key={type} className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 capitalize">{type} Application Questions</h3>
                <div className="space-y-3">
                  {questions[type].map((q, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={q}
                        onChange={(e) => {
                          const newQuestions = { ...questions };
                          newQuestions[type][idx] = e.target.value;
                          setQuestions(newQuestions);
                        }}
                        className="flex-1 bg-gray-700 text-white p-2 rounded"
                      />
                      <button
                        onClick={() => {
                          const newQuestions = { ...questions };
                          newQuestions[type].splice(idx, 1);
                          setQuestions(newQuestions);
                        }}
                        className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newQuestions = { ...questions };
                      newQuestions[type].push('');
                      setQuestions(newQuestions);
                    }}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                  >
                    Add Question
                  </button>
                  <button
                    onClick={() => saveQuestions(type)}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded ml-2"
                  >
                    Save {type} Questions
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Bot Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Ticket Category ID</label>
                <input
                  type="text"
                  value={settings.ticket_category_id || ''}
                  onChange={(e) => setSettings({ ...settings, ticket_category_id: e.target.value })}
                  className="w-full bg-gray-700 text-white p-3 rounded"
                  placeholder="Category ID for tickets"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Staff Role ID</label>
                <input
                  type="text"
                  value={settings.staff_role_id || ''}
                  onChange={(e) => setSettings({ ...settings, staff_role_id: e.target.value })}
                  className="w-full bg-gray-700 text-white p-3 rounded"
                  placeholder="Role ID for staff"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Verified Role ID</label>
                <input
                  type="text"
                  value={settings.verified_role_id || ''}
                  onChange={(e) => setSettings({ ...settings, verified_role_id: e.target.value })}
                  className="w-full bg-gray-700 text-white p-3 rounded"
                  placeholder="Role ID for verified users"
                />
              </div>
              <button
                onClick={saveSettings}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded font-semibold"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600'
  };

  return (
    <div className={`${colorClasses[color]} p-6 rounded-lg`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Icon size={24} />
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

export default App;
