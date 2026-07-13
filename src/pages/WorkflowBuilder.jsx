import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { workflowService } from '../services/workflowService';
import {
  Save,
  Play,
  ArrowLeft,
  Plus,
  Workflow,
  Zap,
  Sparkles,
  Settings,
} from 'lucide-react';
import NodeConfigPanel from '../components/NodeConfigPanel';
import CustomNode from '../components/CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

const WorkflowBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const errorTimerRef = useRef(null);

  useEffect(() => {
    if (id) {
      loadWorkflow(id);
    }
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, [id]);

  const showError = (msg) => {
    setError(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setError(''), 5000);
  };

  const loadWorkflow = async (workflowId) => {
    try {
      const data = await workflowService.getWorkflow(workflowId);
      setWorkflow(data);

      if (data._rfNodes && data._rfNodes.length > 0) {
        setNodes(data._rfNodes);
      } else {
        setNodes([
          {
            id: 'trigger-1',
            type: 'custom',
            position: { x: 250, y: 50 },
            data: {
              label: 'Manual Trigger',
              type: 'TRIGGER',
              subtype: 'manual',
              config: {},
            },
          },
        ]);
      }

      if (data._rfEdges && data._rfEdges.length > 0) {
        setEdges(data._rfEdges);
      }
    } catch (err) {
      showError(
        err.apiError?.message ||
          err.response?.data?.message ||
          'Failed to load workflow',
      );
    } finally {
      setLoading(false);
    }
  };

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
            style: { strokeWidth: 2, stroke: '#94a3b8' },
            markerEnd: { type: 'arrowclosed', color: '#94a3b8' },
          },
          eds,
        ),
      ),
    [setEdges],
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setIsConfigPanelOpen(true);
  }, []);

  const onPaneClick = useCallback(() => {
    setIsConfigPanelOpen(false);
    setSelectedNode(null);
  }, []);

  const handleAddNode = (type, subtype, label) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        label,
        type,
        subtype,
        config: {},
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await workflowService.updateDraft(id, nodes, edges);
      showError('');
      alert('Draft saved successfully');
    } catch (err) {
      showError(
        err.apiError?.message ||
          err.response?.data?.message ||
          'Failed to save draft',
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!nodes.some((n) => n.data?.type === 'TRIGGER')) {
      alert('Workflow must have at least one trigger node');
      return;
    }

    setPublishing(true);
    try {
      await workflowService.updateDraft(id, nodes, edges);
      await workflowService.publishWorkflow(id);
      const updated = await workflowService.getWorkflow(id);
      setWorkflow(updated);
      alert('Workflow published successfully');
    } catch (err) {
      showError(
        err.apiError?.message ||
          err.response?.data?.message ||
          'Failed to publish workflow',
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    try {
      await workflowService.runWorkflow(id);
      alert('Workflow started successfully');
    } catch (err) {
      showError(
        err.apiError?.message ||
          err.response?.data?.message ||
          'Failed to run workflow',
      );
    } finally {
      setRunning(false);
    }
  };

  const handleSaveNodeConfig = (config) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, config } }
          : node,
      ),
    );
    setIsConfigPanelOpen(false);
    setSelectedNode(null);
  };

  const handleDeleteNode = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeId && e.target !== nodeId),
      );
      setIsConfigPanelOpen(false);
      setSelectedNode(null);
    },
    [setNodes, setEdges],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-600 font-medium">Loading workflow...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-secondary-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary flex items-center gap-2 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-xl flex items-center justify-center shadow-md">
              <Workflow size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {workflow?.name || 'New Workflow'}
              </h1>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Zap size={14} className="text-accent-500" />
                {workflow?.description || 'Create your automation workflow'}
                {workflow?.status === 'PUBLISHED' && (
                  <span className="ml-2 px-2 py-0.5 bg-success-100 text-success-700 text-xs rounded-full font-medium">
                    Published v{workflow?.version_number}
                  </span>
                )}
                {workflow?.status === 'DRAFT' && (
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                    Draft v{workflow?.version_number}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="btn btn-secondary flex items-center gap-2 disabled:opacity-50 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 border-0 transition-all duration-200"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="btn btn-primary flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-md hover:shadow-lg transition-all duration-200 border-0 disabled:opacity-50"
          >
            <Settings size={18} className={publishing ? 'animate-spin' : ''} />
            {publishing ? 'Publishing...' : 'Publish'}
          </button>
          <button
            onClick={handleRun}
            disabled={running}
            className="btn btn-primary flex items-center gap-2 bg-gradient-to-r from-success-600 to-success-500 hover:from-success-700 hover:to-success-600 shadow-md hover:shadow-lg transition-all duration-200 border-0 disabled:opacity-50"
          >
            <Play size={18} />
            {running ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 relative">
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4 w-64 animate-slide-up">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Plus size={16} className="text-primary-600" />
              Add Node
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600 mb-2 font-semibold flex items-center gap-1">
                  <Zap size={12} className="text-accent-500" />
                  Triggers
                </p>
                <button
                  onClick={() =>
                    handleAddNode('TRIGGER', 'manual', 'Manual Trigger')
                  }
                  className="btn btn-secondary text-xs w-full bg-gradient-to-r from-accent-50 to-accent-100 hover:from-accent-100 hover:to-accent-200 border-accent-300 transition-all duration-200"
                >
                  Manual Trigger
                </button>
                <button
                  onClick={() =>
                    handleAddNode('TRIGGER', 'WEBHOOK', 'Webhook Trigger')
                  }
                  className="btn btn-secondary text-xs w-full mt-1 bg-gradient-to-r from-accent-50 to-accent-100 hover:from-accent-100 hover:to-accent-200 border-accent-300 transition-all duration-200"
                >
                  Webhook Trigger
                </button>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-2 font-semibold flex items-center gap-1">
                  <Workflow size={12} className="text-secondary-500" />
                  Actions
                </p>
                <button
                  onClick={() =>
                    handleAddNode('ACTION', 'github_pr', 'GitHub PR')
                  }
                  className="btn btn-secondary text-xs w-full mb-1 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300 transition-all duration-200"
                >
                  Create Pull Request
                </button>
                <button
                  onClick={() =>
                    handleAddNode('ACTION', 'github_issue', 'GitHub Issue')
                  }
                  className="btn btn-secondary text-xs w-full mb-1 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300 transition-all duration-200"
                >
                  Create Issue
                </button>
                <button
                  onClick={() =>
                    handleAddNode('ACTION', 'github_comment', 'GitHub Comment')
                  }
                  className="btn btn-secondary text-xs w-full bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300 transition-all duration-200"
                >
                  Comment on Issue
                </button>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-2 font-semibold flex items-center gap-1">
                  <Settings size={12} className="text-primary-500" />
                  Logic
                </p>
                <button
                  onClick={() =>
                    handleAddNode('CONDITION', 'IF_ELSE', 'Condition')
                  }
                  className="btn btn-secondary text-xs w-full bg-gradient-to-r from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 border-primary-300 transition-all duration-200"
                >
                  If / Else Condition
                </button>
              </div>
            </div>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode="Delete"
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {isConfigPanelOpen && selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            isOpen={isConfigPanelOpen}
            onClose={() => {
              setIsConfigPanelOpen(false);
              setSelectedNode(null);
            }}
            onSave={handleSaveNodeConfig}
            onDelete={handleDeleteNode}
          />
        )}
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg animate-fade-in flex items-center gap-2 z-50">
          <Sparkles size={18} />
          {error}
          <button
            onClick={() => setError('')}
            className="ml-2 text-red-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkflowBuilder;
