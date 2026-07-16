import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { workflowService } from '../services/workflowService';
import { useToast } from '../context/ToastContext';
import {
  Plus,
  Play,
  Edit,
  Trash2,
  Copy,
  Workflow,
  Zap,
  Clock,
  Search,
  Rocket,
  FileEdit,
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, gradient }) => (
  <div className="card p-5 flex items-center gap-4 animate-slide-up">
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-md`}
    >
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    workflowService
      .getAllWorkflows()
      .then((data) => {
        if (!cancelled) setWorkflows(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(
            err.apiError?.message ||
              err.response?.data?.message ||
              'Failed to load workflows',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredWorkflows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return workflows;
    return workflows.filter(
      (w) =>
        w.name?.toLowerCase().includes(q) ||
        w.description?.toLowerCase().includes(q),
    );
  }, [workflows, search]);

  const publishedCount = workflows.filter(
    (w) => w.status === 'PUBLISHED',
  ).length;

  const handleCreateWorkflow = async () => {
    setCreating(true);
    try {
      const newWorkflow = await workflowService.createWorkflow(
        'New Workflow',
        '',
      );
      if (newWorkflow?.id) {
        navigate(`/workflow/${newWorkflow.id}`);
      } else {
        toast.error('Workflow was created but no ID was returned');
      }
    } catch (err) {
      toast.error(
        err.apiError?.message ||
          err.response?.data?.message ||
          'Failed to create workflow',
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteWorkflow = (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this workflow?'))
      return;
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
    toast.info('Workflow removed from your dashboard');
  };

  const handleDuplicateWorkflow = async (workflow, e) => {
    e.stopPropagation();
    try {
      const duplicated = await workflowService.createWorkflow(
        `${workflow.name} (Copy)`,
        workflow.description || '',
      );
      if (duplicated?.id) {
        // Copy the source workflow's nodes and edges into the new draft
        try {
          const source = await workflowService.getWorkflow(workflow.id);
          if (source?._rfNodes?.length > 0) {
            const nodesCopy = source._rfNodes.map((n) => ({
              ...n,
              data: { ...n.data, serverId: undefined },
            }));
            const edgesCopy = source._rfEdges.map((edge) => ({
              ...edge,
              id: `reactflow__copy-${edge.source}-${edge.target}`,
            }));
            await workflowService.updateDraft(
              duplicated.id,
              nodesCopy,
              edgesCopy,
            );
          }
        } catch {
          // Duplicate still exists even if content copy failed
        }
        setWorkflows((prev) => [...prev, duplicated]);
        toast.success(`Duplicated "${workflow.name}"`);
      }
    } catch (err) {
      toast.error(
        err.apiError?.message ||
          err.response?.data?.message ||
          'Failed to duplicate workflow',
      );
    }
  };

  const handleRunWorkflow = async (id, e) => {
    e.stopPropagation();
    try {
      await workflowService.runWorkflow(id);
      toast.success('Workflow run started');
    } catch (err) {
      toast.error(
        err.apiError?.message ||
          err.response?.data?.message ||
          'Failed to run workflow',
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-24">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 h-48 overflow-hidden">
              <div className="h-5 w-2/3 bg-gray-100 rounded-lg mb-4 animate-pulse" />
              <div className="h-4 w-full bg-gray-100 rounded-lg mb-2 animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-md">
              <Workflow className="text-white" size={24} />
            </span>
            Workflows
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Zap size={16} className="text-accent-500" />
            Manage your automation workflows
          </p>
        </div>
        <button
          onClick={handleCreateWorkflow}
          disabled={creating}
          className="btn btn-primary gap-2"
        >
          <Plus size={20} />
          {creating ? 'Creating...' : 'Create Workflow'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={Workflow}
          label="Total Workflows"
          value={workflows.length}
          gradient="from-primary-500 to-secondary-500"
        />
        <StatCard
          icon={Rocket}
          label="Published"
          value={publishedCount}
          gradient="from-success-500 to-accent-500"
        />
        <StatCard
          icon={FileEdit}
          label="Drafts"
          value={workflows.length - publishedCount}
          gradient="from-amber-400 to-amber-500"
        />
      </div>

      {workflows.length > 0 && (
        <div className="relative mb-6 max-w-md">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
            placeholder="Search workflows..."
          />
        </div>
      )}

      {workflows.length === 0 ? (
        <div className="card p-12 text-center border-2 border-dashed border-gray-200 animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
            <Workflow size={40} className="text-primary-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No workflows yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first workflow to get started with automation
          </p>
          <button
            onClick={handleCreateWorkflow}
            disabled={creating}
            className="btn btn-primary gap-2"
          >
            <Plus size={20} />
            Create Your First Workflow
          </button>
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="card p-12 text-center animate-fade-in">
          <p className="text-gray-500">
            No workflows match &ldquo;{search}&rdquo;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow, index) => (
            <div
              key={workflow.id}
              className="card p-6 hover:shadow-lifted hover:-translate-y-1 transition-all duration-300 cursor-pointer hover:border-primary-200 animate-slide-up group"
              style={{ animationDelay: `${Math.min(index, 8) * 0.06}s` }}
              onClick={() => navigate(`/workflow/${workflow.id}`)}
            >
              <div className="flex items-start justify-between mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                        workflow.status === 'PUBLISHED'
                          ? 'bg-gradient-to-br from-success-400 to-accent-500'
                          : 'bg-gradient-to-br from-gray-300 to-gray-400'
                      }`}
                    >
                      <Workflow size={16} className="text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                      {workflow.name}
                    </h3>
                  </div>
                  {workflow.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {workflow.description}
                    </p>
                  )}
                </div>
                <span
                  className={`badge shrink-0 ${
                    workflow.status === 'PUBLISHED'
                      ? 'bg-success-100 text-success-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {workflow.status === 'PUBLISHED' ? 'Published' : 'Draft'} v
                  {workflow.version_number}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <Clock size={14} />
                Last modified:{' '}
                {workflow.updated_at
                  ? new Date(workflow.updated_at).toLocaleDateString()
                  : 'Unknown'}
              </div>

              <div className="flex items-center gap-1.5 pt-4 border-t border-gray-100">
                <button
                  onClick={(e) => handleRunWorkflow(workflow.id, e)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium text-success-700 bg-success-50 hover:bg-success-100 transition-colors"
                  title="Run workflow"
                >
                  <Play size={14} />
                  Run
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/workflow/${workflow.id}`);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors"
                  title="Edit workflow"
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button
                  onClick={(e) => handleDuplicateWorkflow(workflow, e)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium text-secondary-700 bg-secondary-50 hover:bg-secondary-100 transition-colors"
                  title="Duplicate workflow"
                >
                  <Copy size={14} />
                  Copy
                </button>
                <button
                  onClick={(e) => handleDeleteWorkflow(workflow.id, e)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  title="Delete workflow"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
