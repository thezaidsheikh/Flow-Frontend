import { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { credentialService } from '../services/credentialService';

const NodeConfigPanel = ({ node, isOpen, onClose, onSave, onDelete }) => {
  const [config, setConfig] = useState(node.data.config || {});
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setConfig(node.data.config || {});
    if (node.data.type === 'ACTION') {
      loadCredentials();
    }
  }, [node]);

  const loadCredentials = async () => {
    setLoading(true);
    try {
      const data = await credentialService.getAllCredentials();
      setCredentials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load credentials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(config);
  };

  const renderConfigFields = () => {
    switch (node.data.subtype) {
      case 'WEBHOOK':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook Path
              </label>
              <input
                type="text"
                value={config.path || ''}
                onChange={(e) => handleConfigChange('path', e.target.value)}
                className="input"
                placeholder="/webhook/my-trigger"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HTTP Method
              </label>
              <select
                value={config.method || 'POST'}
                onChange={(e) => handleConfigChange('method', e.target.value)}
                className="input"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
          </>
        );

      case 'github_pr':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repository
              </label>
              <input
                type="text"
                value={config.repo || ''}
                onChange={(e) => handleConfigChange('repo', e.target.value)}
                className="input"
                placeholder="owner/repo"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source Branch
              </label>
              <input
                type="text"
                value={config.head || ''}
                onChange={(e) => handleConfigChange('head', e.target.value)}
                className="input"
                placeholder="feature/my-change"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Branch
              </label>
              <input
                type="text"
                value={config.base || ''}
                onChange={(e) => handleConfigChange('base', e.target.value)}
                className="input"
                placeholder="main"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                className="input"
                placeholder="PR title"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body
              </label>
              <textarea
                value={config.body || ''}
                onChange={(e) => handleConfigChange('body', e.target.value)}
                className="input"
                rows={3}
                placeholder="PR description"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credential
              </label>
              {loading ? (
                <div className="text-sm text-gray-500">Loading credentials...</div>
              ) : (
                <select
                  value={config.credentialId || ''}
                  onChange={(e) =>
                    handleConfigChange('credentialId', e.target.value)
                  }
                  className="input"
                >
                  <option value="">Select a credential</option>
                  {credentials.map((cred) => (
                    <option key={cred.id} value={cred.id}>
                      {cred.name} ({cred.provider})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </>
        );

      case 'github_issue':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repository
              </label>
              <input
                type="text"
                value={config.repo || ''}
                onChange={(e) => handleConfigChange('repo', e.target.value)}
                className="input"
                placeholder="owner/repo"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                className="input"
                placeholder="Issue title"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body
              </label>
              <textarea
                value={config.body || ''}
                onChange={(e) => handleConfigChange('body', e.target.value)}
                className="input"
                rows={3}
                placeholder="Issue description"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credential
              </label>
              {loading ? (
                <div className="text-sm text-gray-500">Loading credentials...</div>
              ) : (
                <select
                  value={config.credentialId || ''}
                  onChange={(e) =>
                    handleConfigChange('credentialId', e.target.value)
                  }
                  className="input"
                >
                  <option value="">Select a credential</option>
                  {credentials.map((cred) => (
                    <option key={cred.id} value={cred.id}>
                      {cred.name} ({cred.provider})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </>
        );

      case 'github_comment':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repository
              </label>
              <input
                type="text"
                value={config.repo || ''}
                onChange={(e) => handleConfigChange('repo', e.target.value)}
                className="input"
                placeholder="owner/repo"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Number
              </label>
              <input
                type="number"
                value={config.issueNumber || ''}
                onChange={(e) =>
                  handleConfigChange('issueNumber', e.target.value)
                }
                className="input"
                placeholder="123"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment
              </label>
              <textarea
                value={config.comment || ''}
                onChange={(e) => handleConfigChange('comment', e.target.value)}
                className="input"
                rows={3}
                placeholder="Your comment"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credential
              </label>
              {loading ? (
                <div className="text-sm text-gray-500">Loading credentials...</div>
              ) : (
                <select
                  value={config.credentialId || ''}
                  onChange={(e) =>
                    handleConfigChange('credentialId', e.target.value)
                  }
                  className="input"
                >
                  <option value="">Select a credential</option>
                  {credentials.map((cred) => (
                    <option key={cred.id} value={cred.id}>
                      {cred.name} ({cred.provider})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </>
        );

      case 'IF_ELSE':
      case 'condition':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                value={config.source || 'trigger'}
                onChange={(e) => handleConfigChange('source', e.target.value)}
                className="input"
              >
                <option value="trigger">Trigger Data</option>
                <option value="variables">Variables</option>
                <option value="previous">Previous Node</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field
              </label>
              <input
                type="text"
                value={config.field || config.variable || ''}
                onChange={(e) => {
                  handleConfigChange('field', e.target.value);
                  handleConfigChange('variable', e.target.value);
                }}
                className="input"
                placeholder="field.name or {{trigger.email}}"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operator
              </label>
              <select
                value={config.operator || 'equals'}
                onChange={(e) => handleConfigChange('operator', e.target.value)}
                className="input"
              >
                <option value="equals">Equals</option>
                <option value="not_equals">Not Equals</option>
                <option value="exists">Exists</option>
              </select>
            </div>
            {config.operator !== 'exists' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value
                </label>
                <input
                  type="text"
                  value={config.value || ''}
                  onChange={(e) => handleConfigChange('value', e.target.value)}
                  className="input"
                  placeholder="Expected value"
                />
              </div>
            )}
          </>
        );

      case 'DELAY':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <input
                type="number"
                value={config.duration || ''}
                onChange={(e) =>
                  handleConfigChange('duration', parseInt(e.target.value) || 0)
                }
                className="input"
                placeholder="30"
                min="0"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={config.unit || 'seconds'}
                onChange={(e) => handleConfigChange('unit', e.target.value)}
                className="input"
              >
                <option value="seconds">Seconds</option>
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
              </select>
            </div>
          </>
        );

      default:
        return (
          <div className="text-gray-500 text-sm">
            No configuration options available for this node type.
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-96 bg-white border-l border-gray-200 shadow-lg overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Configure {node.data.label}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Node Name
          </label>
          <input
            type="text"
            value={node.data.label || ''}
            onChange={(e) => {
              const newLabel = e.target.value;
              const event = { target: { value: newLabel } };
              handleConfigChange('__label', newLabel);
            }}
            className="input"
            placeholder="Node name"
          />
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Node Type</p>
          <p className="text-sm font-medium text-gray-700">
            {node.data.type}
            {node.data.subtype ? ` / ${node.data.subtype}` : ''}
          </p>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Settings</h3>
          {renderConfigFields()}
        </div>

        <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Save
          </button>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(node.id)}
            className="btn btn-danger w-full mt-3 flex items-center justify-center gap-2 text-sm"
          >
            <Trash2 size={16} />
            Delete Node
          </button>
        )}
      </div>
    </div>
  );
};

export default NodeConfigPanel;
