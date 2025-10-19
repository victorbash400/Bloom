import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

interface Agent {
  id: string;
  name: string;
  active: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
}) => {
  const [input, setInput] = useState('');
  const [showAgentsModal, setShowAgentsModal] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([
    { id: 'planner', name: 'Planner', active: false },
    { id: 'farm', name: 'Farm Agent', active: false },
    { id: 'market', name: 'Market Agent', active: false },
  ]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleAgent = (agentId: string) => {
    setAgents(prev => prev.map(agent =>
      agent.id === agentId ? { ...agent, active: !agent.active } : agent
    ));
  };

  const activeAgentsCount = agents.filter(agent => agent.active).length;
  const activeAgentNames = agents.filter(agent => agent.active).map(agent => agent.name);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowAgentsModal(false);
      }
    };

    if (showAgentsModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAgentsModal]);

  return (
    <div className="w-full max-w-lg mx-auto font-sans relative">
      <form onSubmit={handleSubmit} className="relative rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] pt-[20px] px-[2px] pb-[2px]" style={{ backgroundColor: '#00311e' }}>
        <div className="absolute top-2 left-0 right-0 flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-white font-medium">
            <span>Bloom Chat</span>
            {activeAgentsCount > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs">{activeAgentNames.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[22px] bg-white p-2 mt-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder="What do you wanna do today?"
                className="w-full bg-transparent text-gray-800 placeholder-gray-400 outline-none resize-none text-base pl-2 overflow-hidden"
                rows={1}
                disabled={disabled}
                style={{ minHeight: '20px', maxHeight: '120px' }}
              />
            </div>
            <button
              type="submit"
              disabled={disabled || !input.trim()}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
              style={{ backgroundColor: (disabled || !input.trim()) ? '#d1d5db' : '#00311e' }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>

          {/* Bottom buttons row */}
          <div className="flex items-center justify-between mt-2 px-2">
            <div className="flex items-center gap-2">
              {/* Upload button */}
              <button
                type="button"
                className="flex items-center justify-center p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
                title="Upload files"
              >
                <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>

              {/* Agents button */}
              <button
                type="button"
                onClick={() => setShowAgentsModal(!showAgentsModal)}
                className="relative flex items-center justify-center p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
                title="Agents"
              >
                <Image
                  src="/agents.svg"
                  alt="Agents"
                  width={18}
                  height={18}
                  className="opacity-60 group-hover:opacity-80"
                />
                {activeAgentsCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium" style={{ fontSize: '8px' }}>{activeAgentsCount}</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Agents Popup */}
      {showAgentsModal && (
        <div ref={modalRef} className="absolute bottom-full left-4 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-64 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Select Agents</h3>
            <button
              onClick={() => setShowAgentsModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-2">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm text-gray-700 font-medium">{agent.name}</span>
                <button
                  onClick={() => toggleAgent(agent.id)}
                  className={`w-10 h-5 rounded-full transition-colors duration-200 relative ${agent.active ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 absolute top-0.5 ${agent.active ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Small arrow pointing down */}
          <div className="absolute top-full left-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
        </div>
      )}
    </div>
  );
};

export default ChatInput;