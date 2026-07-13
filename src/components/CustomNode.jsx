import { Handle, Position } from 'reactflow';
import { Play, GitPullRequest, AlertCircle, Clock, Webhook } from 'lucide-react';

const CustomNode = ({ data }) => {
  const getNodeIcon = () => {
    switch (data.type) {
      case 'TRIGGER':
        if (data.subtype === 'WEBHOOK') {
          return <Webhook size={20} className="text-emerald-600" />;
        }
        return <Play size={20} className="text-green-600" />;
      case 'ACTION':
        return <GitPullRequest size={20} className="text-blue-600" />;
      case 'CONDITION':
        return <AlertCircle size={20} className="text-yellow-600" />;
      case 'DELAY':
        return <Clock size={20} className="text-purple-600" />;
      default:
        return <AlertCircle size={20} className="text-gray-600" />;
    }
  };

  const getNodeColor = () => {
    switch (data.type) {
      case 'TRIGGER':
        return 'border-green-500 bg-green-50';
      case 'ACTION':
        return 'border-blue-500 bg-blue-50';
      case 'CONDITION':
        return 'border-yellow-500 bg-yellow-50';
      case 'DELAY':
        return 'border-purple-500 bg-purple-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-sm min-w-[200px] ${getNodeColor()}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-gray-400"
      />

      <div className="flex items-center gap-2">
        {getNodeIcon()}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-900 truncate">
            {data.label}
          </div>
          <div className="text-xs text-gray-600 capitalize">
            {data.type?.toLowerCase()}
            {data.subtype ? ` / ${data.subtype}` : ''}
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-gray-400"
      />
    </div>
  );
};

export default CustomNode;
