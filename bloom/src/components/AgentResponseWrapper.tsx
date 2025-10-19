import React from 'react';

interface AgentResponseWrapperProps {
  agentName?: string;
  agentDisplay?: string;
  children: React.ReactNode;
}

const AgentResponseWrapper: React.FC<AgentResponseWrapperProps> = ({ 
  agentName, 
  agentDisplay, 
  children 
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
      case 'planner': return { bg: '#f8fdf8', border: '#4caf50', text: '#2e7d32' };
      case 'farm': return { bg: '#fffbf5', border: '#ff9800', text: '#f57c00' };
      case 'market': return { bg: '#f8fcff', border: '#2196f3', text: '#1976d2' };
      default: return { bg: '#fafafa', border: '#00311e', text: '#00311e' };
    }
  };

  // If no agent info, render children without wrapper (main agent response)
  if (!agentName || !agentDisplay) {
    return <>{children}</>;
  }

  const colors = getAgentColor(agentName);

  return (
    <div 
      className="rounded-2xl border-2 p-4 mb-4"
      style={{ 
        backgroundColor: colors.bg,
        borderColor: colors.border
      }}
    >
      {/* Agent header */}
      <div className="flex items-center mb-3 pb-2 border-b border-opacity-30" style={{ borderColor: colors.border }}>
        <span className="text-lg mr-2">{getAgentIcon(agentName)}</span>
        <span className="text-sm font-medium" style={{ color: colors.text }}>
          {agentDisplay}
        </span>
      </div>
      
      {/* Agent response content */}
      <div>
        {children}
      </div>
    </div>
  );
};

export default AgentResponseWrapper;