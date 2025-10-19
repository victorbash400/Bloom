import React from 'react';

interface AgentIndicatorProps {
  agentName?: string;
  agentDisplay?: string;
  isWorking?: boolean;
}

const AgentIndicator: React.FC<AgentIndicatorProps> = ({ 
  agentName, 
  agentDisplay, 
  isWorking = false 
}) => {
  const getAgentIcon = (agentName?: string) => {
    switch (agentName) {
      case 'planner': return '📋';
      case 'farm': return '🌾';
      case 'market': return '📈';
      default: return '🤖';
    }
  };

  const getAgentColor = (agentName?: string) => {
    switch (agentName) {
      case 'planner': return { bg: '#e8f5e8', border: '#4caf50', text: '#2e7d32' };
      case 'farm': return { bg: '#fff3e0', border: '#ff9800', text: '#f57c00' };
      case 'market': return { bg: '#e3f2fd', border: '#2196f3', text: '#1976d2' };
      default: return { bg: '#f5f5f5', border: '#00311e', text: '#00311e' };
    }
  };

  if (!agentName || !agentDisplay) return null;

  const colors = getAgentColor(agentName);

  if (isWorking) {
    // Show working indicator
    return (
      <div className="flex justify-start mb-4">
        <div className="max-w-md">
          <div 
            className="inline-flex items-center px-4 py-2 rounded-xl border-2 border-dashed animate-pulse"
            style={{ 
              backgroundColor: colors.bg,
              borderColor: colors.border,
              color: colors.text
            }}
          >
            <span className="text-lg mr-2">{getAgentIcon(agentName)}</span>
            <span className="text-sm font-medium">{agentDisplay} is working...</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AgentIndicator;