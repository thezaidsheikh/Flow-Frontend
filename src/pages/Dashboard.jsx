import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workflowService } from '../services/workflowService';
import { runService } from '../services/runService';
import { useToast } from '../context/ToastContext';
import {
  Workflow,
  Rocket,
  FileEdit,
  History,
  Plus,
  ArrowRight,
  PlayCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Zap,
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, gradient, loading }) => (
  <div className="card p-5 flex items-center gap-4 animate-slide-up">
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-md shrink-0`}
    >
      <Icon size={22} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-bold text-gray-900">
        {loading ? (
          <span className="inline-block w-10 h-6 bg-gray-200 rounded animate-pulse" />
        ) : (
          value
        )}
      </p>
      <p className="text-sm text-gray-500 truncate">{label}</p>
    </div>
  </div>
);

const formatTimestamp = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'});
};

const formatDuration = (startedAt, finishedAt) => {
  if (!startedAt) return '-';
  const start = new Date(startedAt);
  const end = finishedAt ? new Date(finishedAt) : new Date();
  const diffMs = end - start;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  const remainSec = diffSec % 60;
  return `${diffMin}m ${remainSec}s`;
};

const getStatusConfig = (status) => {
  switch (status) {
    case 'RUNNING':
      return { icon: Loader2, label: 'Running', className: 'bg-blue-100 text-blue-700', iconClass: 'text-blue-600' };
    case 'COMPLETED':
      return { icon: CheckCircle, label: 'Completed', className: 'bg-green-100 text-green-700', iconClass: 'text-green-600' };
    case 'FAILED':
      return { icon: XCircle, label: 'Failed', className: 'bg-red-100 text-red-700', iconClass: 'text-red-600' };
    default:
      return { icon: PlayCircle, label: status || '-', className: 'bg-gray-100 text-gray-700', iconClass: 'text-gray-600' };
  }
};

const Dashboard = () => {
  const [workflows, setWorkflows] = useState([]);
  const [wfLoading, setWfLoading] = useState(true);
  const [runs, setRuns] = useState([]);
  const [runsLoading, setRunsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    workflowService.getAllWorkflows()
      .then((data) => {
        if (!cancelled) setWorkflows(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setWfLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    runService.getAllRuns(0, 10)
      .then((data) => {
        if (!cancelled) setRuns(data?.items || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setRunsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const publishedCount = workflows.filter((w) => w.status === 'PUBLISHED').length;
  const draftCount = workflows.length - publishedCount;

  const headers = ['Status', 'Workflow', 'Trigger', 'Started', 'Duration', ''];

  return (
    <div className="p-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-md">
              <Workflow className="text-white" size={24} />
            </span>
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Zap size={16} className="text-accent-500" />
            Overview of your workflows and recent executions
          </p>
        </div>
        <button
          onClick={async () => {
            setCreating(true);
            try {
              const newWf = await workflowService.createWorkflow('New Workflow', '');
              if (newWf?.id) navigate(`/workflow/${newWf.id}`);
            } catch (err) {
              toast.error('Failed to create workflow');
            } finally {
              setCreating(false);
            }
          }}
          disabled={creating}
          className="btn btn-primary gap-2"
        >
          <Plus size={20} />
          {creating ? 'Creating...' : 'Create Workflow'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={Workflow}
          label="Total Workflows"
          value={workflows.length}
          gradient="from-primary-500 to-secondary-500"
          loading={wfLoading}
        />
        <StatCard
          icon={Rocket}
          label="Published"
          value={publishedCount}
          gradient="from-success-500 to-accent-500"
          loading={wfLoading}
        />
        <StatCard
          icon={FileEdit}
          label="Drafts"
          value={draftCount}
          gradient="from-amber-400 to-amber-500"
          loading={wfLoading}
        />
      </div>

      {/* Recent Run Logs */}
      <div className="flex items-center gap-2 mb-4">
        <History size={20} className="text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-900">Recent Runs</h2>
        {runs.length > 0 && (
          <span className="text-sm text-gray-400 ml-auto">Last {runs.length} runs</span>
        )}
      </div>

      {runsLoading ? (
        <div className="card p-12 text-center">
          <Loader2 size={28} className="animate-spin text-primary-500 mx-auto" />
          <p className="text-gray-500 mt-3">Loading recent runs...</p>
        </div>
      ) : runs.length === 0 ? (
        <div className="card p-12 text-center border-2 border-dashed border-gray-200">
          <PlayCircle size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No workflow runs yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {headers.map((header, i) => (
                    <th key={i} className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {runs.map((run, idx) => {
                  const statusConfig = getStatusConfig(run.status);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <tr key={run.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => navigate(`/runs/${run.id}`)}>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${statusConfig.className}`}>
                          <StatusIcon size={14} className={statusConfig.iconClass} />
                          {statusConfig.label}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{run.workflow_name}</div>
                        <div className="text-xs text-gray-500">
                          {run.workflow_version_id ? `v${run.workflow_version_id.slice(0,8)}` : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {run.trigger_type === 'WEBHOOK' ? 'Webhook' : 'Manual'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatTimestamp(run.started_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDuration(run.started_at, run.finished_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                          <ArrowRight size={18} className="text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
