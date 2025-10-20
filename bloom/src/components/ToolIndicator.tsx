import React from 'react';
import { Search, Sprout, Calendar, Wrench } from 'lucide-react';

interface ToolIndicatorProps {
  toolName?: string;
  toolStatus?: 'in-progress' | 'done';
}

const ToolIndicator: React.FC<ToolIndicatorProps> = ({ toolName, toolStatus }) => {
  const getToolIcon = (toolName?: string) => {
    if (!toolName) return <Wrench size={14} />;
    if (toolName.includes('search_farming_info')) return <Search size={14} />;
    if (toolName.includes('google_search')) return <Search size={14} />;
    if (toolName.includes('farming_info')) return <Sprout size={14} />;
    if (toolName.includes('seasonal_advice')) return <Calendar size={14} />;
    return <Wrench size={14} />;
  };

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-md">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-md text-white" 
              style={{ backgroundColor: '#01391a' }}>
          {getToolIcon(toolName)} {toolName || 'tool'}
        </span>
      </div>
    </div>
  );
};

export default ToolIndicator;