import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workflowService } from '../services/workflowService';
import {
  Plus,
  Play,
  Edit,
  Trash2,
  Copy,
  Workflow,
  Zap,
  Clock,
  AlertCircle,
} from 'lucide-react';

const Dashboard = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const data = await workflowService.getAllWorkflows();
      setWorkflows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.apiError?.message ||
          err.response?.data?.message ||
          'Failed to load workflows',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = async () => {
    try {
      const newWorkflow = await workflowService.createWorkflow(
        'New Workflow',
        '',
      );
      if (newWorkflow?.id) {
        navigate(`/workflow/${newWorkflow.id}`);
      }
    } catch (err) {
      setError(
        err.apiError?.message ||
          err.response?.data?.message ||
          'Failed to create workflow',
      );
    }
  };

  const handleDeleteWorkflow = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this workflow?'))
      return;

    try {
      setWorkflows(workflows.filter((w) => w.id !== id));
    } catch (err) {
      setError(
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
      if (duplicated) {
        setWorkflows([...workflows, duplicated]);
      }
    } catch (err) {
      setError(
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
      alert('Workflow run started successfully');
    } catch (err) {
      setError(
        err.apiError?.message ||
          err.response?.data?.message ||
          'Failed to run workflow',
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-600 font-medium">Loading workflows...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-3">
            <Workflow className="text-primary-600" size={32} />
            Workflows
          </h1>
          <p className="text-gray-600 mt-1 flex items-center gap-2">
            <Zap size={16} className="text-accent-500" />
            Manage your automation workflows
          </p>
        </div>
        <button
          onClick={handleCreateWorkflow}
          className="btn btn-primary bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus size={20} />
          Create Workflow
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-fade-in flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
          <button
            onClick={() => setError('')}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      )}

      {workflows.length === 0 ? (
        <div className="card p-12 text-center bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-300 rounded-2xl animate-scale-in">
          <div className="text-gray-400 mb-4">
            <Workflow size={64} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No workflows yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first workflow to get started with automation
          </p>
          <button
            onClick={handleCreateWorkflow}
            className="btn btn-primary bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus size={20} className="mr-2" />
            Create Your First Workflow
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow, index) => (
            <div
              key={workflow.id}
              className="card p-6 bg-white hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-primary-300 rounded-2xl animate-slide-up group"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => navigate(`/workflow/${workflow.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        workflow.status === 'PUBLISHED'
                          ? 'bg-gradient-to-br from-success-400 to-success-500'
                          : 'bg-gradient-to-br from-gray-400 to-gray-500'
                      }`}
                    >
                      <Workflow size={16} className="text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {workflow.name}
                    </h3>
                  </div>
                  {workflow.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {workflow.description}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    workflow.status === 'PUBLISHED'
                      ? 'bg-gradient-to-r from-success-100 to-success-50 text-success-700 border border-success-200'
                      : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200'
                  }`}
                >
                  {workflow.status === 'PUBLISHED'
                    ? `Published v${workflow.version_number}`
                    : `Draft v${workflow.version_number}`}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Clock size={14} />
                Last modified:{' '}
                {workflow.updated_at
                  ? new Date(workflow.updated_at).toLocaleDateString()
                  : 'Unknown'}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={(e) => handleRunWorkflow(workflow.id, e)}
                  className="flex-1 btn btn-secondary flex items-center justify-center gap-1 text-xs bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white border-0"
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
                  className="flex-1 btn btn-secondary flex items-center justify-center gap-1 text-xs bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white border-0"
                  title="Edit workflow"
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button
                  onClick={(e) => handleDuplicateWorkflow(workflow, e)}
                  className="flex-1 btn btn-secondary flex items-center justify-center gap-1 text-xs bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white border-0"
                  title="Duplicate workflow"
                >
                  <Copy size={14} />
                  Copy
                </button>
                <button
                  onClick={(e) => handleDeleteWorkflow(workflow.id, e)}
                  className="flex-1 btn btn-danger flex items-center justify-center gap-1 text-xs bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0"
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
