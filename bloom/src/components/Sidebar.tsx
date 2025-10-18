import React, { useState } from 'react';

interface SidebarProps {
  onNewChat?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewChat }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className="fixed left-4 bottom-8 z-40 transition-all duration-300 ease-in-out"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div 
        className="rounded-2xl shadow-lg transition-all duration-300 ease-in-out"
        style={{backgroundColor: '#04331c'}}
      >
        <div className={`flex flex-col items-center py-4 transition-all duration-300 ease-in-out ${isExpanded ? 'px-6' : 'px-3'}`}>
          {/* New Chat */}
          <button 
            className={`flex items-center gap-3 text-white hover:bg-black hover:bg-opacity-20 rounded-xl transition-all duration-200 p-3 w-full ${isExpanded ? 'justify-start' : 'justify-center'}`}
            title="New Chat"
            onClick={onNewChat}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {isExpanded && (
              <span className="text-sm font-medium whitespace-nowrap">New Chat</span>
            )}
          </button>

          {/* Projects */}
          <button 
            className={`flex items-center gap-3 text-white hover:bg-black hover:bg-opacity-20 rounded-xl transition-all duration-200 p-3 w-full mt-2 ${isExpanded ? 'justify-start' : 'justify-center'}`}
            title="Projects"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 1v6" />
            </svg>
            {isExpanded && (
              <span className="text-sm font-medium whitespace-nowrap">Projects</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;