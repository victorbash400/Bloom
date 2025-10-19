import React from 'react';

interface ToolIndicatorProps {
  toolName?: string;
  toolStatus?: 'in-progress' | 'done';
}

const ToolIndicator: React.FC<ToolIndicatorProps> = ({ toolName, toolStatus }) => {
  const getToolIcon = (toolName?: string) => {
    if (!toolName) return '🔧';
    if (toolName.includes('search_farming_info')) return '🔍';
    if (toolName.includes('google_search')) return '🔍';
    if (toolName.includes('farming_info')) return '🌱';
    if (toolName.includes('seasonal_advice')) return '🗓️';
    return '🔧';
  };

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-md">
        <span className="inline-block px-3 py-1 text-xs rounded-md bg-white border" 
              style={{ color: '#00311e', borderColor: '#00311e' }}>
          {getToolIcon(toolName)} {toolName || 'tool'}
        </span>
      </div>
    </div>
  );
};

export default ToolIndicator;