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
  const getAgentColor = (agentName?: string) => {
    return { border: '#000000' };
  };

  if (!agentName || !agentDisplay) return null;

  const colors = getAgentColor(agentName);

  if (isWorking) {
    // Show working indicator
    return (
      <div className="flex justify-start mb-4">
        <div className="max-w-md">
          <div
            className="inline-flex items-center px-4 py-2 rounded-xl border border-dashed animate-pulse bg-gray-50"
            style={{
              borderColor: colors.border
            }}
          >
            <span className="text-sm font-medium text-black">{agentDisplay} is working...</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AgentIndicator;