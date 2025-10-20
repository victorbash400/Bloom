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
  const getAgentColor = (agentName?: string) => {
    return { border: '#000000' };
  };

  // If no agent info, render children without wrapper (main agent response)
  if (!agentName || !agentDisplay) {
    return <>{children}</>;
  }

  const colors = getAgentColor(agentName);

  return (
    <div
      className="rounded-2xl border-2 p-5 mb-4 bg-gray-50/50"
      style={{
        borderColor: colors.border
      }}
    >
      {/* Agent header */}
      <div className="flex items-center mb-4">
        <div
          className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-white border shadow-sm"
          style={{ borderColor: colors.border }}
        >
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            {agentDisplay}
          </span>
        </div>
      </div>

      {/* Agent response content */}
      <div className="text-gray-700">
        {children}
      </div>
    </div>
  );
};

export default AgentResponseWrapper;