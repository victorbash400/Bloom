import React, { useState, useRef } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <div className="w-full max-w-lg mx-auto font-sans">
      <form onSubmit={handleSubmit} className="relative rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] pt-[20px] px-[2px] pb-[2px]" style={{backgroundColor: '#00311e'}}>
        <div className="absolute top-2 left-0 right-0 flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-white font-medium">
            <span>Bloom Chat</span>
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
                style={{minHeight: '20px', maxHeight: '120px'}}
              />
            </div>
            <button
              type="submit"
              disabled={disabled || !input.trim()}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
              style={{backgroundColor: (disabled || !input.trim()) ? '#d1d5db' : '#00311e'}}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;