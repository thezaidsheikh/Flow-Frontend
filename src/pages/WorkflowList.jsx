import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { workflowService } from '../services/workflowService';
import { useToast } from '../context/ToastContext';
import {
  Plus,
  Search,
  Workflow,
  Edit,
  Trash2,
  Copy,
  Webhook,
  Play,
  FileEdit,
  Calendar,
  Clock,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const WorkflowList = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [editingNameId, setEditingNameId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [sortField, setSortField] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState('desc');
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

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString();
  };

  const filteredAndSortedWorkflows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = workflows.filter(
      (w) =>
        w.name?.toLowerCase().includes(q) ||
        w.description?.toLowerCase().includes(q),
    );

    return filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (aValue === null) aValue = '';
      if (bValue === null) bValue = '';

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [workflows, search, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp size={14} className="ml-1" />
    ) : (
      <ChevronDown size={14} className="ml-1" />
    );
  };

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

  const handleDeleteWorkflow = async (id, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await workflowService.deleteWorkflow(id);
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
      toast.success(`Workflow "${name}" deleted`);
    } catch (err) {
      toast.error(
        err.apiError?.message ||
          err.response?.data?.message ||
          'Failed to delete workflow',
      );
    }
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

  const startEditingName = (workflow, e) => {
    e.stopPropagation();
    setEditingNameId(workflow.id);
    setEditingName(workflow.name);
  };

  const cancelEditingName = (e) => {
    e.stopPropagation();
    setEditingNameId(null);
    setEditingName('');
  };

  const saveEditingName = async (id, e) => {
    e.stopPropagation();
    const name = editingName.trim();
    if (!name) return;
    try {
      const updated = await workflowService.updateWorkflowName(id, name);
      setWorkflows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, name: updated.name } : w)),
      );
      toast.success('Workflow renamed');
    } catch (err) {
      toast.error(
        err.apiError?.message ||
          err.response?.data?.message ||
          'Failed to rename workflow',
      );
    }
    cancelEditingName();
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
        <div className="card p-12 text-center">
          <Workflow size={32} className="animate-pulse text-primary-400 mx-auto" />
          <p className="text-gray-500 mt-4">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Workflow size={24} className="text-primary-600" />
            Workflows
          </h1>
          <p className="text-gray-600 mt-1">
            {workflows.length} total workflows
          </p>
        </div>
        <button
          onClick={handleCreateWorkflow}
          disabled={creating}
          className="btn btn-primary gap-2"
        >
          <Plus size={18} />
          {creating ? 'Creating...' : 'Create Workflow'}
        </button>
      </div>

      {workflows.length > 0 && (
        <div className="relative mb-4 max-w-md">
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
            <Workflow size={32} className="text-primary-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No workflows yet
          </h3>
          <p className="text-gray-500 mb-4">
            Create your first workflow to get started with automation
          </p>
          <button
            onClick={handleCreateWorkflow}
            disabled={creating}
            className="btn btn-primary gap-2"
          >
            <Plus size={18} />
            Create Your First Workflow
          </button>
        </div>
      ) : filteredAndSortedWorkflows.length === 0 ? (
        <div className="card p-8 text-center animate-fade-in">
          <p className="text-gray-500">
            No workflows match &ldquo;{search}&rdquo;
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-600 uppercase tracking-wider">
            <div className="col-span-4 cursor-pointer hover:text-gray-900 transition-colors" onClick={() => handleSort('name')}>Name {getSortIcon('name')}</div>
            <div className="col-span-2 cursor-pointer hover:text-gray-900 transition-colors" onClick={() => handleSort('status')}>Status {getSortIcon('status')}</div>
            <div className="col-span-2 cursor-pointer hover:text-gray-900 transition-colors" onClick={() => handleSort('updatedAt')}>Updated {getSortIcon('updatedAt')}</div>
            <div className="col-span-2 cursor-pointer hover:text-gray-900 transition-colors text-right" onClick={() => handleSort('version_number')}>Version {getSortIcon('version_number')}</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredAndSortedWorkflows.map((workflow, index) => (
              <div
                key={workflow.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-all cursor-pointer animate-slide-up"
                style={{ animationDelay: `${Math.min(index, 15) * 0.02}s` }}
                onClick={() => navigate(`/workflow/${workflow.id}`)}
              >
                <div className="col-span-4 flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mr-3 shrink-0">
                    <Workflow size={16} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {editingNameId === workflow.id ? (
                        <input
                          autoFocus
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditingName(workflow.id, e);
                            if (e.key === 'Escape') cancelEditingName(e);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="input py-1 px-2 text-sm w-full"
                        />
                      ) : (
                        <div onClick={(e) => startEditingName(workflow, e)} className="cursor-pointer">
                          {workflow.name}
                        </div>
                      )}
                    </div>
                    {workflow.description && (
                      <div className="text-xs text-gray-500 truncate mt-1">
                        {workflow.description}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-2 flex items-center">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      workflow.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {workflow.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="col-span-2 flex items-center text-xs text-gray-600">
                  <Calendar size={14} className="mr-1.5" />
                  {formatRelativeTime(workflow.updated_at)}
                </div>

                <div className="col-span-2 flex items-center justify-end text-xs text-gray-600">
                  v{workflow.version_number}
                </div>

                <div className="col-span-2 flex items-center justify-end gap-1">
                  <button
                    onClick={(e) => handleRunWorkflow(workflow.id, e)}
                    className="p-1.5 rounded-lg text-green-600 bg-green-50 hover:bg-green-100 transition-colors"
                    title="Run workflow"
                  >
                    <Play size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/workflow/${workflow.id}`);
                    }}
                    className="p-1.5 rounded-lg text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors"
                    title="Edit workflow"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={(e) => handleDuplicateWorkflow(workflow, e)}
                    className="p-1.5 rounded-lg text-secondary-600 bg-secondary-50 hover:bg-secondary-100 transition-colors"
                    title="Duplicate workflow"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteWorkflow(workflow.id, workflow.name, e)}
                    className="p-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                    title="Delete workflow"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowList;