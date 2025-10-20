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
      className="rounded-lg border p-4 mb-4 bg-gray-50"
      style={{
        borderColor: colors.border
      }}
    >
      {/* Agent header */}
      <div className="flex items-center mb-3">
        <div
          className="inline-flex items-center px-3 py-1 rounded-xl bg-gray-100 border"
          style={{ borderColor: colors.border }}
        >
          <span className="text-sm font-medium text-black">
            {agentDisplay}
          </span>
        </div>
      </div>

      {/* Agent response content */}
      <div>
        {children}
      </div>
    </div>
  );
};

export default AgentResponseWrapper;