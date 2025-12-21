import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Ticket, AlertTriangle, Settings, FileText, Shield, Code } from 'lucide-react';

// Get from environment variables (set in Vercel)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_SECRET = import.meta.env.VITE_API_SECRET || 'YOUR_API_SECRET_HERE';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [applications, setApplications] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [settings, setSettings] = useState(null);
  const [appQuestions, setAppQuestions] = useState({ staff: [], admin: [], developer: [] });
  const [loading, setLoading] = useState(true);

  // Fetch data
  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${API_SECRET}` };
      
      const [statsRes, ticketsRes, appsRes, warningsRes, settingsRes, questionsRes] = await Promise.all([
        fetch(`${API_URL}/stats`, { headers }),
        fetch(`${API_URL}/tickets`, { headers }),
        fetch(`${API_URL}/applications`, { headers }),
        fetch(`${API_URL}/warnings`, { headers }),
        fetch(`${API_URL}/settings`, { headers }),
        fetch(`${API_URL}/application-questions`, { headers })
      ]);

      setStats(await statsRes.json());
      setTickets(await ticketsRes.json());
      setApplications(await appsRes.json());
      setWarnings(await warningsRes.json());
      setSettings(await settingsRes.json());
      setAppQuestions(await questionsRes.json());
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      alert('Failed to connect to bot API. Make sure your bot is running!');
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // Update settings
  const updateSettings = async (newSettings) => {
    try {
      const response = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${API_SECRET}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
      });
      const data = await response.json();
      setSettings(data.settings);
      alert('✅ Settings updated!');
    } catch (error) {
      alert('❌ Failed to update settings');
    }
  };

  // Update application questions
  const updateQuestions = async (type, questions) => {
    try {
      const response = await fetch(`${API_URL}/application-questions`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${API_SECRET}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, questions })
      });
      const data = await response.json();
      setAppQuestions(prev => ({ ...prev, [type]: data.questions }));
      alert('✅ Questions updated!');
    } catch (error) {
      alert('❌ Failed to update questions');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-black bg-opacity-50 backdrop-blur-lg border-b border-purple-500/30 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Roblox Bot Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Manage your Discord server</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-green-500/20 px-4 py-2 rounded-lg border border-green-500/30">
              <span className="text-green-400">● Bot Online</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Navigation */}
        <nav className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'overview', icon: BarChart3, label: 'Overview' },
            { id: 'tickets', icon: Ticket, label: 'Tickets' },
            { id: 'applications', icon: FileText, label: 'Applications' },
            { id: 'questions', icon: Code, label: 'App Questions' },
            { id: 'warnings', icon: AlertTriangle, label: 'Warnings' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Members"
                value={stats.members}
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Open Tickets"
                value={stats.tickets.open}
                subtitle={`${stats.tickets.total} total`}
                icon={Ticket}
                color="green"
              />
              <StatCard
                title="Pending Apps"
                value={stats.applications.pending}
                subtitle={`${stats.applications.total} total`}
                icon={FileText}
                color="yellow"
              />
              <StatCard
                title="Total Warnings"
                value={stats.warnings}
                icon={AlertTriangle}
                color="red"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-bold mb-4">Recent Tickets</h3>
                <div className="space-y-3">
                  {tickets.slice(0, 5).map(ticket => (
                    <div key={ticket.id} className="bg-white/5 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{ticket.id}</p>
                          <p className="text-sm text-gray-400">User ID: {ticket.user_id}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          ticket.status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-bold mb-4">Recent Applications</h3>
                <div className="space-y-3">
                  {applications.slice(0, 5).map(app => (
                    <div key={app.id} className="bg-white/5 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium capitalize">{app.type} Application</p>
                          <p className="text-sm text-gray-400">User ID: {app.user_id}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          app.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
            <h2 className="text-2xl font-bold mb-6">All Tickets</h2>
            <div className="space-y-3">
              {tickets.map(ticket => (
                <div key={ticket.id} className="bg-white/5 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg">{ticket.id}</p>
                      <p className="text-gray-400">Channel ID: {ticket.channel_id}</p>
                      <p className="text-gray-400">User ID: {ticket.user_id}</p>
                      <p className="text-sm text-gray-500">Created: {new Date(ticket.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg ${
                      ticket.status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {ticket.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
              {tickets.length === 0 && (
                <p className="text-center text-gray-400 py-8">No tickets yet</p>
              )}
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
            <h2 className="text-2xl font-bold mb-6">All Applications</h2>
            <div className="space-y-4">
              {applications.map(app => (
                <div key={app.id} className="bg-white/5 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-lg capitalize">{app.type} Application</p>
                      <p className="text-gray-400">User ID: {app.user_id}</p>
                      <p className="text-sm text-gray-500">Submitted: {new Date(app.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg ${
                      app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      app.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      app.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {app.status.toUpperCase()}
                    </span>
                  </div>
                  {app.answers && app.answers.length > 0 && (
                    <div className="space-y-2 mt-3 border-t border-white/10 pt-3">
                      {app.answers.map((qa, i) => (
                        <div key={i} className="bg-white/5 p-3 rounded">
                          <p className="text-sm font-semibold text-purple-400">{qa.question}</p>
                          <p className="text-gray-300 mt-1">{qa.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {applications.length === 0 && (
                <p className="text-center text-gray-400 py-8">No applications yet</p>
              )}
            </div>
          </div>
        )}

        {/* Application Questions Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            {['staff', 'admin', 'developer'].map(type => (
              <QuestionEditor
                key={type}
                type={type}
                questions={appQuestions[type]}
                onSave={(questions) => updateQuestions(type, questions)}
              />
            ))}
          </div>
        )}

        {/* Warnings Tab */}
        {activeTab === 'warnings' && (
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
            <h2 className="text-2xl font-bold mb-6">All Warnings</h2>
            <div className="space-y-3">
              {warnings.map(warn => (
                <div key={warn.id} className="bg-white/5 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold">User ID: {warn.userId}</p>
                      <p className="text-gray-400 mt-1">Reason: {warn.reason}</p>
                      <p className="text-sm text-gray-500">By: {warn.moderator_id}</p>
                      <p className="text-sm text-gray-500">Date: {new Date(warn.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
              {warnings.length === 0 && (
                <p className="text-center text-gray-400 py-8">No warnings issued yet</p>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && settings && (
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
            <h2 className="text-2xl font-bold mb-6">Bot Settings</h2>
            <SettingsForm settings={settings} onSave={updateSettings} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-6 shadow-lg`}>
      <div className="flex items-center justify-between mb-3">
        <Icon size={32} className="opacity-80" />
        <div className="text-right">
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
        </div>
      </div>
      <p className="font-medium">{title}</p>
    </div>
  );
}

function QuestionEditor({ type, questions, onSave }) {
  const [editedQuestions, setEditedQuestions] = useState(questions);

  const addQuestion = () => {
    setEditedQuestions([...editedQuestions, '']);
  };

  const updateQuestion = (index, value) => {
    const updated = [...editedQuestions];
    updated[index] = value;
    setEditedQuestions(updated);
  };

  const removeQuestion = (index) => {
    setEditedQuestions(editedQuestions.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
      <h3 className="text-xl font-bold mb-4 capitalize">{type} Application Questions</h3>
      <div className="space-y-3 mb-4">
        {editedQuestions.map((q, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={q}
              onChange={(e) => updateQuestion(i, e.target.value)}
              placeholder={`Question ${i + 1}`}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={() => removeQuestion(i)}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={addQuestion}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Add Question
        </button>
        <button
          onClick={() => onSave(editedQuestions)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Save Questions
        </button>
      </div>
    </div>
  );
}

function SettingsForm({ settings, onSave }) {
  const [edited, setEdited] = useState(settings);

  const handleChange = (key, value) => {
    setEdited({ ...edited, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Ticket Category ID</label>
        <input
          type="text"
          value={edited.ticket_category_id || ''}
          onChange={(e) => handleChange('ticket_category_id', e.target.value)}
          placeholder="Category ID for tickets"
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Staff Role ID</label>
        <input
          type="text"
          value={edited.staff_role_id || ''}
          onChange={(e) => handleChange('staff_role_id', e.target.value)}
          placeholder="Role ID for staff members"
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Admin Role ID</label>
        <input
          type="text"
          value={edited.admin_role_id || ''}
          onChange={(e) => handleChange('admin_role_id', e.target.value)}
          placeholder="Role ID for administrators"
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Verified Role ID</label>
        <input
          type="text"
          value={edited.verified_role_id || ''}
          onChange={(e) => handleChange('verified_role_id', e.target.value)}
          placeholder="Role ID for verified users"
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Log Channel ID</label>
        <input
          type="text"
          value={edited.log_channel_id || ''}
          onChange={(e) => handleChange('log_channel_id', e.target.value)}
          placeholder="Channel ID for logs"
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Application Channel ID</label>
        <input
          type="text"
          value={edited.application_channel_id || ''}
          onChange={(e) => handleChange('application_channel_id', e.target.value)}
          placeholder="Channel ID for application reviews"
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Welcome Message</label>
        <textarea
          value={edited.welcome_message || ''}
          onChange={(e) => handleChange('welcome_message', e.target.value)}
          placeholder="Welcome message for new members"
          rows={3}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Welcome Channel ID</label>
        <input
          type="text"
          value={edited.welcome_channel_id || ''}
          onChange={(e) => handleChange('welcome_channel_id', e.target.value)}
          placeholder="Channel ID for welcome messages"
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
        />
      </div>

      <button
        onClick={() => onSave(edited)}
        className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Save All Settings
      </button>
    </div>
  );
}
