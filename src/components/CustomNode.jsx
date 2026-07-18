import { memo, createContext, useContext } from 'react';
import { Handle, Position } from 'reactflow';
import {
  Play,
  GitPullRequest,
  GitBranch,
  AlertCircle,
  GitMerge,
  MessageSquare,
  Clock,
  Webhook,
  X,
} from 'lucide-react';

// Lets nodes call back into the builder to remove themselves,
// without storing a function on node.data (which gets serialized).
export const NodeActionsContext = createContext({ onDelete: () => {} });

const nodeStyles = {
  TRIGGER: {
    border: 'border-success-400',
    bg: 'bg-gradient-to-br from-success-50 to-white',
    iconBg: 'bg-success-100 text-success-600',
    tag: 'text-success-600',
  },
  ACTION: {
    border: 'border-primary-400',
    bg: 'bg-gradient-to-br from-primary-50 to-white',
    iconBg: 'bg-primary-100 text-primary-600',
    tag: 'text-primary-600',
  },
  CONDITION: {
    border: 'border-amber-400',
    bg: 'bg-gradient-to-br from-amber-50 to-white',
    iconBg: 'bg-amber-100 text-amber-600',
    tag: 'text-amber-600',
  },
  DELAY: {
    border: 'border-secondary-400',
    bg: 'bg-gradient-to-br from-secondary-50 to-white',
    iconBg: 'bg-secondary-100 text-secondary-600',
    tag: 'text-secondary-600',
  },
  default: {
    border: 'border-gray-300',
    bg: 'bg-gradient-to-br from-gray-50 to-white',
    iconBg: 'bg-gray-100 text-gray-600',
    tag: 'text-gray-600',
  },
};

const getIcon = (data) => {
  switch (data.type) {
    case 'TRIGGER':
      if (data.subtype === 'GITHUB_PUSH') return GitBranch;
      if (data.subtype === 'WEBHOOK') return Webhook;
      return Play;
    case 'ACTION':
      if (data.subtype === 'github_comment') return MessageSquare;
      if (data.subtype === 'github_issue') return AlertCircle;
      return GitPullRequest;
    case 'CONDITION':
      return GitMerge;
    case 'DELAY':
      return Clock;
    default:
      return AlertCircle;
  }
};

const subtypeLabel = (data) => {
  if (data.subtype === 'GITHUB_PUSH') return 'on push';
  return data.subtype ? data.subtype.toLowerCase().replace(/_/g, ' ') : '';
};

const CustomNode = ({ id, data, selected }) => {
  const style = nodeStyles[data.type] || nodeStyles.default;
  const Icon = getIcon(data);
  const { onDelete } = useContext(NodeActionsContext);

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <div
      className={`group/node relative px-4 py-3 rounded-2xl border-2 min-w-[210px] transition-all duration-200 ${style.border} ${style.bg} ${
        selected ? 'shadow-lifted ring-2 ring-primary-300 scale-[1.02]' : 'shadow-soft hover:shadow-md'
      }`}
    >
      <button
        onClick={handleDelete}
        title="Remove node"
        aria-label="Remove node"
        className="nodrag absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-400 shadow-sm flex items-center justify-center opacity-0 group-hover/node:opacity-100 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-150 z-10"
      >
        <X size={13} strokeWidth={2.5} />
      </button>

      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-gray-400 !border-2 !border-white"
      />

      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg}`}
        >
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900 truncate">
            {data.label}
          </div>
          <div className={`text-xs capitalize truncate ${style.tag}`}>
            {data.type?.toLowerCase()}
            {data.subtype ? ` · ${subtypeLabel(data)}` : ''}
          </div>
        </div>
      </div>

      {data.type === 'TRIGGER' && data.subtype === 'GITHUB_PUSH' && (
        <div className="mt-2 pt-2 border-t border-success-100 text-[11px] text-gray-500 truncate">
          {data.config?.repo ? (
            <>
              <span className="font-medium text-gray-600">
                {data.config.repo}
              </span>
              {' · '}
              <span className="font-mono">{data.config.branch || 'any branch'}</span>
            </>
          ) : (
            'Click to configure repo & branch'
          )}
        </div>
      )}

      {data.type === 'TRIGGER' && data.subtype === 'WEBHOOK' && (
        <div className="mt-2 pt-2 border-t border-success-100 text-[11px] text-gray-500 truncate">
          {data.config?.secret ? (
            'HMAC-SHA256 signed'
          ) : (
            'No signature verification'
          )}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-gray-400 !border-2 !border-white"
      />
    </div>
  );
};

export default memo(CustomNode);
