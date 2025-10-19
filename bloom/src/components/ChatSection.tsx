import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import ToolIndicator from './ToolIndicator';
import AgentIndicator from './AgentIndicator';
import AgentResponseWrapper from './AgentResponseWrapper';

interface Attachment {
  id: string;
  name: string;
  type: string;
}

interface Message {
  role: 'user' | 'assistant' | 'tool-indicator' | 'agent-working';
  content: string;
  toolName?: string;
  toolStatus?: 'in-progress' | 'done';
  agentName?: string;
  agentDisplay?: string;
  attachments?: Attachment[];
}

interface ChatSectionProps {
  messages: Message[];
  onSendMessage: (message: string, pdfContextIds?: string[], attachments?: Attachment[]) => void;
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
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // console.log("Rendering messages:", messages);

  const hasMessages = messages.length > 0;

  if (!hasMessages) {
    // Welcome state - input centered with background image
    return (
      <div
        className="h-screen flex flex-col items-center justify-center relative"
        style={{
          backgroundImage: 'url(/Welcome.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Top left logo and name */}
        <div className="absolute top-6 left-6 flex items-end gap-3">
          <Image
            src="/bloom_logo.svg"
            alt="Bloom Logo"
            width={32}
            height={32}
          />
          <span className="text-xl font-bold text-gray-800">Bloom</span>
        </div>

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

  // Chat state - normal layout with white background
  return (
    <div className="h-screen flex flex-col bg-white relative">
      {/* Top left logo and name for chat state */}
      <div className="absolute top-6 left-6 flex items-end gap-3 z-10">
        <Image
          src="/bloom_logo.svg"
          alt="Bloom Logo"
          width={28}
          height={28}
        />
        <span className="text-lg font-bold text-gray-800">Bloom</span>
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto pt-16 bg-white">
        <div className="max-w-2xl mx-auto px-8">
          <div className="space-y-8">
            {messages.map((message, index) => {
              if (message.role === 'tool-indicator') {
                return (
                  <ToolIndicator
                    key={index}
                    toolName={message.toolName}
                    toolStatus={message.toolStatus}
                  />
                );
              } else if (message.role === 'agent-working') {
                return (
                  <AgentIndicator
                    key={index}
                    agentName={message.agentName}
                    agentDisplay={message.agentDisplay}
                    isWorking={true}
                  />
                );
              } else if (message.role === 'assistant') {
                return (
                  <AgentResponseWrapper
                    key={index}
                    agentName={message.agentName}
                    agentDisplay={message.agentDisplay}
                  >
                    <ChatBubble
                      role={message.role}
                      content={message.content}
                      attachments={message.attachments}
                    />
                  </AgentResponseWrapper>
                );
              } else {
                return (
                  <ChatBubble
                    key={index}
                    role={message.role}
                    content={message.content}
                    attachments={message.attachments}
                  />
                );
              }
            })}

            {isLoading && (
              <div className="mb-8">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <div
                      className="rounded-full"
                      style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#00311e',
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

      <div className="pb-4 bg-white">
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