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
import { useToast } from '../context/ToastContext';
import {
  Save,
  Play,
  ArrowLeft,
  Plus,
  Workflow,
  Zap,
  Rocket,
  Settings,
  GitBranch,
  GitPullRequest,
  AlertCircle,
  MessageSquare,
  GitMerge,
  Webhook,
  MousePointerClick,
  Sparkles,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import NodeConfigPanel from '../components/NodeConfigPanel';
import CustomNode, { NodeActionsContext } from '../components/CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

const edgeOptions = {
  type: 'smoothstep',
  animated: true,
  style: { strokeWidth: 2, stroke: '#a5b4fc' },
  markerEnd: { type: 'arrowclosed', color: '#a5b4fc' },
};

const paletteSections = [
  {
    title: 'Triggers',
    icon: Zap,
    iconColor: 'text-success-500',
    items: [
      {
        type: 'TRIGGER',
        subtype: 'GITHUB_PUSH',
        label: 'On Branch Push',
        icon: GitBranch,
        description: 'Runs when code is pushed to a branch',
        highlight: true,
      },
      {
        type: 'TRIGGER',
        subtype: 'manual',
        label: 'Manual Trigger',
        icon: MousePointerClick,
        description: 'Run the workflow manually',
      },
      {
        type: 'TRIGGER',
        subtype: 'WEBHOOK',
        label: 'Webhook Trigger',
        icon: Webhook,
        description: 'Runs on an incoming HTTP request',
      },
    ],
  },
  {
    title: 'Actions',
    icon: Workflow,
    iconColor: 'text-primary-500',
    items: [
      {
        type: 'ACTION',
        subtype: 'github_pr',
        label: 'Create Pull Request',
        icon: GitPullRequest,
        description: 'Open a PR on GitHub',
      },
      {
        type: 'ACTION',
        subtype: 'github_issue',
        label: 'Create Issue',
        icon: AlertCircle,
        description: 'Open a GitHub issue',
      },
      {
        type: 'ACTION',
        subtype: 'github_comment',
        label: 'Comment on Issue',
        icon: MessageSquare,
        description: 'Post a comment on GitHub',
      },
    ],
  },
  {
    title: 'Logic',
    icon: Settings,
    iconColor: 'text-amber-500',
    items: [
      {
        type: 'CONDITION',
        subtype: 'IF_ELSE',
        label: 'Condition',
        icon: GitMerge,
        description: 'Branch on if / else logic',
      },
    ],
  },
];

const WorkflowBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [workflow, setWorkflow] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [running, setRunning] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const nodeIdRef = useRef(0);

  const nextNodeId = () => `node-${Date.now()}-${++nodeIdRef.current}`;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await workflowService.getWorkflow(id);
        if (cancelled) return;
        setWorkflow(data);

        if (data?._rfNodes?.length > 0) {
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

        if (data?._rfEdges?.length > 0) {
          setEdges(data._rfEdges);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(
            err.apiError?.message ||
              err.response?.data?.message ||
              'Failed to load workflow',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (id) load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, ...edgeOptions }, eds)),
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
      id: nextNodeId(),
      type: 'custom',
      position: {
        x: 120 + Math.random() * 300,
        y: 120 + Math.random() * 240,
      },
      data: { label, type, subtype, config: {} },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // One-click template: push trigger -> auto PR
  const handleAddAutoPrTemplate = () => {
    const triggerId = nextNodeId();
    const actionId = nextNodeId();

    const triggerNode = {
      id: triggerId,
      type: 'custom',
      position: { x: 280, y: 80 },
      data: {
        label: 'On Branch Push',
        type: 'TRIGGER',
        subtype: 'GITHUB_PUSH',
        config: { repo: '', branch: '' },
      },
    };
    const actionNode = {
      id: actionId,
      type: 'custom',
      position: { x: 280, y: 260 },
      data: {
        label: 'Auto Create PR',
        type: 'ACTION',
        subtype: 'github_pr',
        config: {
          repo: '',
          head: '{{trigger.branch}}',
          base: 'main',
          title: 'Auto PR: {{trigger.branch}} → main',
          body: 'This pull request was created automatically by Flow after a push to {{trigger.branch}}.',
        },
      },
    };

    setNodes((nds) => [...nds, triggerNode, actionNode]);
    setEdges((eds) =>
      addEdge(
        { id: `edge-${triggerId}-${actionId}`, source: triggerId, target: actionId, ...edgeOptions },
        eds,
      ),
    );
    toast.success(
      'Auto-PR template added! Configure the repo and branches, then publish.',
    );
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await workflowService.updateDraft(id, nodes, edges);
      toast.success('Draft saved successfully');
    } catch (err) {
      toast.error(
        err.apiError?.message ||
          err.response?.data?.message ||
          'Failed to save draft',
      );
    } finally {
      setSaving(false);
    }
  };

  const validateWorkflow = () => {
    if (!nodes.some((n) => n.data?.type === 'TRIGGER')) {
      toast.error('Workflow must have at least one trigger node');
      return false;
    }
    const pushTrigger = nodes.find(
      (n) => n.data?.subtype === 'GITHUB_PUSH',
    );
    if (pushTrigger) {
      const { repo, branch } = pushTrigger.data.config || {};
      if (!repo || !branch) {
        toast.error(
          'The "On Branch Push" trigger needs a repository and branch configured',
        );
        return false;
      }
    }
    return true;
  };

  const handlePublish = async () => {
    if (!validateWorkflow()) return;

    setPublishing(true);
    try {
      await workflowService.updateDraft(id, nodes, edges);
      await workflowService.publishWorkflow(id);
      const updated = await workflowService.getWorkflow(id);
      setWorkflow(updated);
      toast.success('Workflow published successfully');
    } catch (err) {
      toast.error(
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
      toast.success('Workflow run started');
    } catch (err) {
      toast.error(
        err.apiError?.message ||
          err.response?.data?.message ||
          'Failed to run workflow',
      );
    } finally {
      setRunning(false);
    }
  };

  const handleSaveNodeConfig = (config, label) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, config, label: label || node.data.label } }
          : node,
      ),
    );
    setIsConfigPanelOpen(false);
    setSelectedNode(null);
    toast.success('Node configuration saved');
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
      <div className="flex items-center justify-center h-screen animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-600 font-medium">Loading workflow...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between shadow-sm gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary gap-2"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-md shrink-0">
              <Workflow size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {workflow?.name || 'New Workflow'}
              </h1>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <span className="truncate hidden sm:inline">
                  {workflow?.description || 'Create your automation workflow'}
                </span>
                {workflow?.status === 'PUBLISHED' && (
                  <span className="badge bg-success-100 text-success-700">
                    Published v{workflow?.version_number}
                  </span>
                )}
                {workflow?.status === 'DRAFT' && (
                  <span className="badge bg-gray-100 text-gray-600">
                    Draft v{workflow?.version_number}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="btn btn-secondary gap-2"
          >
            <Save size={17} />
            <span className="hidden md:inline">
              {saving ? 'Saving...' : 'Save Draft'}
            </span>
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="btn btn-primary gap-2"
          >
            <Rocket size={17} />
            <span className="hidden md:inline">
              {publishing ? 'Publishing...' : 'Publish'}
            </span>
          </button>
          <button
            onClick={handleRun}
            disabled={running}
            className="btn btn-success gap-2"
          >
            <Play size={17} />
            <span className="hidden md:inline">
              {running ? 'Running...' : 'Run'}
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lifted border border-gray-100 w-72 animate-slide-up overflow-hidden">
            <button
              onClick={() => setPaletteOpen((o) => !o)}
              className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Plus size={16} className="text-primary-600" />
                Add Node
              </span>
              {paletteOpen ? (
                <ChevronDown size={16} className="text-gray-400" />
              ) : (
                <ChevronRight size={16} className="text-gray-400" />
              )}
            </button>

            {paletteOpen && (
              <div className="px-3 pb-3 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
                <button
                  onClick={handleAddAutoPrTemplate}
                  className="w-full p-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-left shadow-md hover:shadow-lifted transition-all duration-200 active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Sparkles
                      size={16}
                      className="group-hover:rotate-12 transition-transform"
                    />
                    Auto PR on Push
                  </div>
                  <p className="text-[11px] text-white/80 mt-1 leading-snug">
                    One-click template: automatically open a pull request
                    whenever code is pushed to your branch.
                  </p>
                </button>

                {paletteSections.map((section) => (
                  <div key={section.title}>
                    <p className="text-xs text-gray-500 mb-2 font-semibold flex items-center gap-1.5 px-1">
                      <section.icon size={12} className={section.iconColor} />
                      {section.title}
                    </p>
                    <div className="space-y-1.5">
                      {section.items.map((item) => (
                        <button
                          key={`${item.type}-${item.subtype}`}
                          onClick={() =>
                            handleAddNode(item.type, item.subtype, item.label)
                          }
                          className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-200 hover:shadow-sm active:scale-[0.98] ${
                            item.highlight
                              ? 'border-success-200 bg-success-50/60 hover:border-success-300 hover:bg-success-50'
                              : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              item.highlight
                                ? 'bg-success-100 text-success-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <item.icon size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-900">
                              {item.label}
                            </p>
                            <p className="text-[11px] text-gray-500 leading-snug">
                              {item.description}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <NodeActionsContext.Provider value={{ onDelete: handleDeleteNode }}>
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
              deleteKeyCode={['Delete', 'Backspace']}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#c7d2fe" gap={20} size={1.5} />
              <Controls />
              <MiniMap
                nodeColor={(n) => {
                  switch (n.data?.type) {
                    case 'TRIGGER':
                      return '#34d399';
                    case 'ACTION':
                      return '#818cf8';
                    case 'CONDITION':
                      return '#fbbf24';
                    default:
                      return '#d1d5db';
                  }
                }}
                maskColor="rgba(238, 242, 255, 0.6)"
              />
            </ReactFlow>
          </NodeActionsContext.Provider>
        </div>

        {isConfigPanelOpen && selectedNode && (
          <NodeConfigPanel
            key={selectedNode.id}
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
    </div>
  );
};

export default WorkflowBuilder;
