import React, { useRef, useEffect } from 'react';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSectionProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

const ChatSection: React.FC<ChatSectionProps> = ({
  messages,
  onSendMessage,
  isLoading = false,
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Add CSS animation for the loading circle
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes scale {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.5); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const hasMessages = messages.length > 0;

  if (!hasMessages) {
    // Welcome state - input centered
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Bloom</h1>
          <p className="text-gray-600">Your AI assistant is ready to help</p>
        </div>
        <ChatInput 
          onSendMessage={onSendMessage} 
          disabled={isLoading} 
        />
      </div>
    );
  }

  // Chat state - normal layout
  return (
    <div className="h-screen flex flex-col">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto pt-16">
        <div className="max-w-2xl mx-auto px-8">
          <div className="space-y-8">
            {messages.map((message, index) => (
              <ChatBubble
                key={index}
                role={message.role}
                content={message.content}
              />
            ))}
            
            {isLoading && (
              <div className="mb-8">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <div 
                      className="rounded-full bg-green-600" 
                      style={{
                        width: '8px',
                        height: '8px',
                        animation: 'scale 1.5s ease-in-out infinite'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="pb-4">
        <div className="max-w-2xl mx-auto">
          <ChatInput 
            onSendMessage={onSendMessage} 
            disabled={isLoading} 
          />
        </div>
      </div>
    </div>
  );
};

export default ChatSection;