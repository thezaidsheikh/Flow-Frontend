import { useState, useEffect } from 'react';
import {
  X,
  Save,
  Trash2,
  GitBranch,
  Copy,
  Check,
  Info,
} from 'lucide-react';
import { credentialService } from '../services/credentialService';

const Field = ({ label, children, hint }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
  </div>
);

const NodeConfigPanel = ({ node, isOpen, onClose, onSave, onDelete }) => {
  const [config, setConfig] = useState(node.data.config || {});
  const [label, setLabel] = useState(node.data.label || '');
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const needsCredentials =
    node.data.type === 'ACTION' || node.data.subtype === 'GITHUB_PUSH';

  useEffect(() => {
    setConfig(node.data.config || {});
    setLabel(node.data.label || '');
    if (needsCredentials) {
      loadCredentials();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node]);

  const loadCredentials = async () => {
    setLoading(true);
    try {
      const data = await credentialService.getAllCredentials();
      setCredentials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load credentials:', err);
      setCredentials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(config, label.trim() || node.data.label);
  };

  const webhookUrl = () => {
    const repo = config.repo || 'owner/repo';
    const branch = config.branch || 'main';
    return `${window.location.origin}/api/v1/webhooks/github/push?repo=${encodeURIComponent(repo)}&branch=${encodeURIComponent(branch)}`;
  };

  const handleCopyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — ignore silently
    }
  };

  const renderCredentialSelect = () => (
    <Field label="Credential">
      {loading ? (
        <div className="text-sm text-gray-500">Loading credentials...</div>
      ) : (
        <select
          value={config.credentialId || ''}
          onChange={(e) => handleConfigChange('credentialId', e.target.value)}
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
      {!loading && credentials.length === 0 && (
        <p className="text-xs text-amber-600 mt-1">
          No credentials found. Add one on the Credentials page first.
        </p>
      )}
    </Field>
  );

  const renderConfigFields = () => {
    switch (node.data.subtype) {
      case 'GITHUB_PUSH':
        return (
          <>
            <div className="mb-4 p-3 bg-primary-50 border border-primary-100 rounded-xl flex gap-2">
              <Info size={16} className="text-primary-600 shrink-0 mt-0.5" />
              <p className="text-xs text-primary-700 leading-relaxed">
                This trigger fires automatically whenever code is pushed to the
                watched branch. Connect it to a{' '}
                <span className="font-semibold">Create Pull Request</span>{' '}
                action to auto-open a PR to your target branch.
              </p>
            </div>
            <Field label="Repository" hint="Format: owner/repo">
              <input
                type="text"
                value={config.repo || ''}
                onChange={(e) => handleConfigChange('repo', e.target.value)}
                className="input"
                placeholder="owner/repo"
              />
            </Field>
            <Field
              label="Branch to Watch"
              hint="Workflow runs when code is pushed to this branch"
            >
              <div className="relative">
                <GitBranch
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={config.branch || ''}
                  onChange={(e) => handleConfigChange('branch', e.target.value)}
                  className="input pl-9"
                  placeholder="feature/*  or  develop"
                />
              </div>
            </Field>
            {renderCredentialSelect()}
            <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-2">
                GitHub Webhook URL
              </p>
              <div className="flex items-center gap-2">
                <code className="text-[11px] text-gray-600 bg-white border border-gray-200 rounded-lg px-2 py-1.5 flex-1 truncate">
                  {webhookUrl()}
                </code>
                <button
                  type="button"
                  onClick={handleCopyWebhook}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-primary-600 hover:border-primary-300 transition-colors shrink-0"
                  title="Copy webhook URL"
                >
                  {copied ? (
                    <Check size={14} className="text-success-600" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-2">
                Add this URL as a webhook in your GitHub repo (Settings →
                Webhooks → push events).
              </p>
            </div>
          </>
        );

      case 'WEBHOOK':
        return (
          <>
            <Field label="Webhook Path">
              <input
                type="text"
                value={config.path || ''}
                onChange={(e) => handleConfigChange('path', e.target.value)}
                className="input"
                placeholder="/webhook/my-trigger"
              />
            </Field>
            <Field label="HTTP Method">
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
            </Field>
          </>
        );

      case 'github_pr':
        return (
          <>
            <Field label="Repository" hint="Format: owner/repo">
              <input
                type="text"
                value={config.repo || ''}
                onChange={(e) => handleConfigChange('repo', e.target.value)}
                className="input"
                placeholder="owner/repo"
              />
            </Field>
            <Field
              label="Source Branch"
              hint="Use {{trigger.branch}} to pick up the pushed branch automatically"
            >
              <input
                type="text"
                value={config.head || ''}
                onChange={(e) => handleConfigChange('head', e.target.value)}
                className="input"
                placeholder="{{trigger.branch}}"
              />
            </Field>
            <Field
              label="Target Branch"
              hint="The branch the pull request will be opened against"
            >
              <input
                type="text"
                value={config.base || ''}
                onChange={(e) => handleConfigChange('base', e.target.value)}
                className="input"
                placeholder="main"
              />
            </Field>
            <Field label="Title">
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                className="input"
                placeholder="Auto PR: {{trigger.branch}} → main"
              />
            </Field>
            <Field label="Body">
              <textarea
                value={config.body || ''}
                onChange={(e) => handleConfigChange('body', e.target.value)}
                className="input"
                rows={3}
                placeholder="PR description"
              />
            </Field>
            {renderCredentialSelect()}
          </>
        );

      case 'github_issue':
        return (
          <>
            <Field label="Repository" hint="Format: owner/repo">
              <input
                type="text"
                value={config.repo || ''}
                onChange={(e) => handleConfigChange('repo', e.target.value)}
                className="input"
                placeholder="owner/repo"
              />
            </Field>
            <Field label="Title">
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                className="input"
                placeholder="Issue title"
              />
            </Field>
            <Field label="Body">
              <textarea
                value={config.body || ''}
                onChange={(e) => handleConfigChange('body', e.target.value)}
                className="input"
                rows={3}
                placeholder="Issue description"
              />
            </Field>
            {renderCredentialSelect()}
          </>
        );

      case 'github_comment':
        return (
          <>
            <Field label="Repository" hint="Format: owner/repo">
              <input
                type="text"
                value={config.repo || ''}
                onChange={(e) => handleConfigChange('repo', e.target.value)}
                className="input"
                placeholder="owner/repo"
              />
            </Field>
            <Field label="Issue Number">
              <input
                type="number"
                value={config.issueNumber || ''}
                onChange={(e) =>
                  handleConfigChange('issueNumber', e.target.value)
                }
                className="input"
                placeholder="123"
              />
            </Field>
            <Field label="Comment">
              <textarea
                value={config.comment || ''}
                onChange={(e) => handleConfigChange('comment', e.target.value)}
                className="input"
                rows={3}
                placeholder="Your comment"
              />
            </Field>
            {renderCredentialSelect()}
          </>
        );

      case 'IF_ELSE':
      case 'condition':
        return (
          <>
            <Field label="Source">
              <select
                value={config.source || 'trigger'}
                onChange={(e) => handleConfigChange('source', e.target.value)}
                className="input"
              >
                <option value="trigger">Trigger Data</option>
                <option value="variables">Variables</option>
                <option value="previous">Previous Node</option>
              </select>
            </Field>
            <Field label="Field">
              <input
                type="text"
                value={config.field || config.variable || ''}
                onChange={(e) => {
                  setConfig((prev) => ({
                    ...prev,
                    field: e.target.value,
                    variable: e.target.value,
                  }));
                }}
                className="input"
                placeholder="field.name or {{trigger.email}}"
              />
            </Field>
            <Field label="Operator">
              <select
                value={config.operator || 'equals'}
                onChange={(e) => handleConfigChange('operator', e.target.value)}
                className="input"
              >
                <option value="equals">Equals</option>
                <option value="not_equals">Not Equals</option>
                <option value="exists">Exists</option>
              </select>
            </Field>
            {config.operator !== 'exists' && (
              <Field label="Value">
                <input
                  type="text"
                  value={config.value || ''}
                  onChange={(e) => handleConfigChange('value', e.target.value)}
                  className="input"
                  placeholder="Expected value"
                />
              </Field>
            )}
          </>
        );

      case 'DELAY':
        return (
          <>
            <Field label="Duration">
              <input
                type="number"
                value={config.duration ?? ''}
                onChange={(e) =>
                  handleConfigChange('duration', parseInt(e.target.value) || 0)
                }
                className="input"
                placeholder="30"
                min="0"
              />
            </Field>
            <Field label="Unit">
              <select
                value={config.unit || 'seconds'}
                onChange={(e) => handleConfigChange('unit', e.target.value)}
                className="input"
              >
                <option value="seconds">Seconds</option>
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
              </select>
            </Field>
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
    <div className="w-96 bg-white border-l border-gray-200 shadow-lifted overflow-y-auto animate-slide-in-right">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 truncate pr-2">
            Configure {node.data.label}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors shrink-0"
            aria-label="Close panel"
          >
            <X size={20} />
          </button>
        </div>

        <Field label="Node Name">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="input"
            placeholder="Node name"
          />
        </Field>

        <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
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
          <button onClick={onClose} className="btn btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary flex-1 gap-2"
          >
            <Save size={18} />
            Save
          </button>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(node.id)}
            className="btn btn-danger w-full mt-3 gap-2 text-sm"
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
