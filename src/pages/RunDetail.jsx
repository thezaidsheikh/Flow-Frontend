import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { runService } from '../services/runService';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';

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
      return { icon: Loader2, label: 'Running', className: 'bg-blue-100 text-blue-700', iconClass: 'animate-spin' };
    case 'COMPLETED':
      return { icon: CheckCircle, label: 'Completed', className: 'bg-green-100 text-green-700', iconClass: 'text-green-600' };
    case 'FAILED':
      return { icon: XCircle, label: 'Failed', className: 'bg-red-100 text-red-700', iconClass: 'text-red-600' };
    default:
      return { icon: Loader2, label: status || '-', className: 'bg-gray-100 text-gray-700', iconClass: 'text-gray-600' };
  }
};

const RunDetail = () => {
  const { runId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [runDetail, setRunDetail] = useState(null);
  const [nodeLogs, setNodeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    runService.getRunDetail(runId)
      .then((data) => {
        if (!cancelled) setRunDetail(data);
      })
      .catch((err) => {
        if (!cancelled) toast.error('Failed to load run details');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [runId, toast]);

  useEffect(() => {
    let cancelled = false;
    runService.getRunLogs(runId)
      .then((data) => {
        if (!cancelled) setNodeLogs(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLogsLoading(false);
      });
    return () => { cancelled = true; };
  }, [runId]);

  if (loading) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="card p-12 text-center">
          <Loader2 size={32} className="animate-spin text-primary-500 mx-auto" />
          <p className="text-gray-500 mt-4">Loading run details...</p>
        </div>
      </div>
    );
  }

  if (!runDetail) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="card p-12 text-center">
          <XCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Run not found</h3>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary gap-2">
            <ArrowLeft size={18} /> Back
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(runDetail.status);
  const StatusIcon = statusConfig.icon;

  const nodeHeaders = ['Node Name', 'Type', 'Status', 'Started', 'Duration', 'Error'];

  return (
    <div className="p-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Workflow Run Details</h1>
          <p className="text-sm text-gray-500">ID: {runDetail.id}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${statusConfig.className}`}>
          <StatusIcon size={18} className={statusConfig.iconClass} />
          <span className="font-medium">{statusConfig.label}</span>
        </div>
      </div>

      {/* Run Summary Card */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Run Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">Workflow Name</p>
            <p className="text-sm font-medium text-gray-900">{runDetail.workflow_name}</p>
            <p className="text-xs text-gray-500">
              {runDetail.workflow_version_id ? `v${runDetail.workflow_version_id.slice(0,8)}` : '-'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">Trigger Type</p>
            <p className="text-sm font-medium text-gray-900">{runDetail.trigger_type === 'WEBHOOK' ? 'Webhook' : 'Manual'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">Started</p>
            <p className="text-sm font-medium text-gray-900">{formatTimestamp(runDetail.started_at)}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">Finished</p>
            <p className="text-sm font-medium text-gray-900">{runDetail.finished_at ? formatTimestamp(runDetail.finished_at) : '-'}</p>
          </div>
        </div>
        {runDetail.error_message && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600 font-medium mb-1">Error</p>
            <p className="text-sm text-red-600">{runDetail.error_message}</p>
          </div>
        )}
      </div>

      {/* Node Execution Logs Table */}
      <div className="card overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 p-6 pb-4">Node Execution Logs</h2>
        {logsLoading ? (
          <div className="text-center py-8">
            <Loader2 size={24} className="animate-spin text-primary-500 mx-auto" />
            <p className="text-gray-500 mt-2">Loading...</p>
          </div>
        ) : nodeLogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No node logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {nodeHeaders.map((h, i) => (
                    <th key={i} className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {nodeLogs.map((log, idx) => {
                  const nodeStatus = getStatusConfig(log.status);
                  const StatusIcon = nodeStatus.icon;
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{log.node_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">{log.node_type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${nodeStatus.className}`}>
                          <StatusIcon size={14} className={nodeStatus.iconClass} />
                          {nodeStatus.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatTimestamp(log.started_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDuration(log.started_at, log.finished_at)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {log.error_message ? (
                          <span className="text-red-600 truncate block max-w-xs">{log.error_message}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RunDetail;
