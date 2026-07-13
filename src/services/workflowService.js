import api from './api';

const convertNodeToAPI = (node) => ({
  id: node.data?.serverId || undefined,
  name: node.data.label,
  type: node.data.type,
  sub_type: node.data.subtype || null,
  position_x: Math.round(node.position.x),
  position_y: Math.round(node.position.y),
  config: node.data.config || {},
});

const convertNodeToReactFlow = (node) => ({
  id: node.id,
  type: 'custom',
  position: { x: node.position_x, y: node.position_y },
  data: {
    label: node.name,
    type: node.type,
    subtype: node.sub_type || '',
    config: node.config || {},
    serverId: node.id,
  },
});

const convertEdgeToAPI = (edge) => ({
  id: edge.id?.startsWith('reactflow__') ? undefined : edge.id,
  source_node_id: edge.source,
  target_node_id: edge.target,
  label: edge.label || null,
});

const convertEdgeToReactFlow = (edge) => ({
  id: edge.id || `edge-${edge.source_node_id}-${edge.target_node_id}`,
  source: edge.source_node_id,
  target: edge.target_node_id,
  label: edge.label || undefined,
  type: 'smoothstep',
  animated: true,
  style: { strokeWidth: 2, stroke: '#94a3b8' },
  markerEnd: { type: 'arrowclosed', color: '#94a3b8' },
});

export const workflowService = {
  getAllWorkflows: async () => {
    const response = await api.get('/workflows');
    return response.data?.data || [];
  },

  getWorkflow: async (id) => {
    const response = await api.get(`/workflows/${id}`);
    const workflow = response.data?.data || response.data;

    if (workflow) {
      workflow._rfNodes = (workflow.nodes || []).map(convertNodeToReactFlow);
      workflow._rfEdges = (workflow.edges || []).map(convertEdgeToReactFlow);
    }

    return workflow;
  },

  createWorkflow: async (name, description) => {
    const response = await api.post('/workflows', { name, description });
    return response.data?.data;
  },

  updateDraft: async (id, nodes, edges) => {
    const payload = {
      nodes: nodes.map(convertNodeToAPI),
      edges: edges.map(convertEdgeToAPI),
    };
    const response = await api.put(`/workflows/${id}/draft`, payload);
    return response.data?.data;
  },

  publishWorkflow: async (id) => {
    const response = await api.post(`/workflows/${id}/publish`);
    return response.data?.data;
  },

  runWorkflow: async (id, triggerData = null, variables = null) => {
    const payload = {};
    if (triggerData) payload.trigger_data = triggerData;
    if (variables) payload.variables = variables;
    const response = await api.post(`/workflows/${id}/run`, payload);
    return response.data?.data;
  },

  getWorkflowRuns: async (id, page = 0, size = 20) => {
    const response = await api.get(`/workflows/${id}/runs`, {
      params: { page, size },
    });
    return response.data?.data;
  },
};
