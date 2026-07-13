import { useState, useEffect } from 'react';
import { credentialService } from '../services/credentialService';
import {
  Plus,
  Trash2,
  Key,
  Shield,
  Lock,
  Sparkles,
  Github,
} from 'lucide-react';

const Credentials = () => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCredential, setNewCredential] = useState({
    provider: 'github',
    name: '',
    secrets: { token: '' },
  });

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      const data = await credentialService.getAllCredentials();
      setCredentials(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.apiError?.message ||
          err.response?.data?.message ||
          'Failed to load credentials',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredential = async (e) => {
    e.preventDefault();
    try {
      await credentialService.createCredential(
        newCredential.name,
        newCredential.provider,
        newCredential.secrets,
      );
      setNewCredential({
        provider: 'github',
        name: '',
        secrets: { token: '' },
      });
      setShowAddForm(false);
      loadCredentials();
    } catch (err) {
      setError(
        err.apiError?.message ||
          err.response?.data?.message ||
          'Failed to add credential',
      );
    }
  };

  const handleDeleteCredential = async (id) => {
    if (!window.confirm('Are you sure you want to delete this credential?'))
      return;

    try {
      await credentialService.deleteCredential(id);
      setCredentials(credentials.filter((c) => c.id !== id));
    } catch (err) {
      setError(
        err.apiError?.message ||
          err.response?.data?.message ||
          'Failed to delete credential',
      );
    }
  };

  const getProviderIcon = (provider) => {
    switch (provider?.toLowerCase()) {
      case 'github':
        return Github;
      default:
        return Key;
    }
  };

  const getProviderColor = (provider) => {
    switch (provider?.toLowerCase()) {
      case 'github':
        return 'from-gray-800 to-gray-900';
      case 'slack':
        return 'from-purple-500 to-purple-700';
      default:
        return 'from-primary-500 to-primary-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-600 font-medium">
            Loading credentials...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-3">
            <Shield className="text-accent-600" size={32} />
            Credentials
          </h1>
          <p className="text-gray-600 mt-1 flex items-center gap-2">
            <Lock size={16} className="text-primary-500" />
            Manage your API keys and secrets securely
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-700 hover:to-accent-600 flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus size={20} />
          Add Credential
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-fade-in flex items-center gap-2">
          <Sparkles size={18} />
          {error}
          <button
            onClick={() => setError('')}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      )}

      {showAddForm && (
        <div className="card p-6 mb-6 bg-gradient-to-br from-white to-gray-50 border-2 border-accent-200 rounded-2xl shadow-lg animate-scale-in">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="text-accent-600" size={24} />
            Add New Credential
          </h2>
          <form onSubmit={handleAddCredential} className="space-y-4">
            <div
              className="animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              <label
                htmlFor="provider"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Provider
              </label>
              <select
                id="provider"
                value={newCredential.provider}
                onChange={(e) =>
                  setNewCredential({
                    ...newCredential,
                    provider: e.target.value,
                    secrets:
                      e.target.value === 'github'
                        ? { token: '' }
                        : e.target.value === 'slack'
                          ? { bot_token: '', signing_secret: '' }
                          : {},
                  })
                }
                className="input border-gray-300 focus:border-accent-500 focus:ring-accent-500 transition-all duration-200"
              >
                <option value="github">GitHub</option>
                <option value="slack">Slack</option>
              </select>
            </div>

            <div
              className="animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={newCredential.name}
                onChange={(e) =>
                  setNewCredential({ ...newCredential, name: e.target.value })
                }
                className="input border-gray-300 focus:border-accent-500 focus:ring-accent-500 transition-all duration-200"
                placeholder="My GitHub Token"
                required
              />
            </div>

            {newCredential.provider === 'github' && (
              <div
                className="animate-slide-up"
                style={{ animationDelay: '0.3s' }}
              >
                <label
                  htmlFor="token"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Personal Access Token
                </label>
                <input
                  id="token"
                  type="password"
                  value={newCredential.secrets.token || ''}
                  onChange={(e) =>
                    setNewCredential({
                      ...newCredential,
                      secrets: { token: e.target.value },
                    })
                  }
                  className="input border-gray-300 focus:border-accent-500 focus:ring-accent-500 transition-all duration-200"
                  placeholder="ghp_xxxxxxxxxxxx"
                  required
                />
              </div>
            )}

            {newCredential.provider === 'slack' && (
              <>
                <div
                  className="animate-slide-up"
                  style={{ animationDelay: '0.3s' }}
                >
                  <label
                    htmlFor="bot_token"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Bot Token
                  </label>
                  <input
                    id="bot_token"
                    type="password"
                    value={newCredential.secrets.bot_token || ''}
                    onChange={(e) =>
                      setNewCredential({
                        ...newCredential,
                        secrets: {
                          ...newCredential.secrets,
                          bot_token: e.target.value,
                        },
                      })
                    }
                    className="input border-gray-300 focus:border-accent-500 focus:ring-accent-500 transition-all duration-200"
                    placeholder="xoxb-xxxxxxxxxxxx"
                    required
                  />
                </div>
                <div
                  className="animate-slide-up"
                  style={{ animationDelay: '0.4s' }}
                >
                  <label
                    htmlFor="signing_secret"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Signing Secret
                  </label>
                  <input
                    id="signing_secret"
                    type="password"
                    value={newCredential.secrets.signing_secret || ''}
                    onChange={(e) =>
                      setNewCredential({
                        ...newCredential,
                        secrets: {
                          ...newCredential.secrets,
                          signing_secret: e.target.value,
                        },
                      })
                    }
                    className="input border-gray-300 focus:border-accent-500 focus:ring-accent-500 transition-all duration-200"
                    placeholder="xxxxxxxxxxxxxxxxxxxx"
                  />
                </div>
              </>
            )}

            <div
              className="flex gap-2 animate-slide-up"
              style={{ animationDelay: '0.5s' }}
            >
              <button
                type="submit"
                className="btn btn-primary bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-700 hover:to-accent-600 flex-1"
              >
                Add Credential
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {credentials.length === 0 ? (
        <div className="card p-12 text-center bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-300 rounded-2xl animate-scale-in">
          <div className="text-gray-400 mb-4">
            <Shield size={64} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No credentials yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add your first credential to connect to external services securely
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-700 hover:to-accent-600 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus size={20} className="mr-2" />
            Add Your First Credential
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credentials.map((credential, index) => {
            const ProviderIcon = getProviderIcon(credential.provider);
            return (
              <div
                key={credential.id}
                className="card p-6 bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-accent-300 rounded-2xl animate-slide-up group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${getProviderColor(credential.provider)} shadow-md`}
                    >
                      <ProviderIcon size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {credential.name}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize flex items-center gap-1">
                        {credential.provider}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCredential(credential.id)}
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                    title="Delete credential"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Lock size={12} />
                    Stored Secret Keys
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {credential.secret_keys?.map((key) => (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md border border-gray-200 text-sm text-gray-700 font-mono"
                      >
                        <Lock size={12} className="text-gray-400" />
                        {key}
                      </span>
                    ))}
                    {(!credential.secret_keys ||
                      credential.secret_keys.length === 0) && (
                      <span className="text-sm text-gray-500 italic">
                        No keys configured
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-4 flex items-center gap-1">
                  <Sparkles size={12} />
                  Created:{' '}
                  {new Date(credential.created_at).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Credentials;
