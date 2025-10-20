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

// Helper to render a single message based on its role
const MessageRenderer = ({ message, index }: { message: Message; index: number }) => {
  switch (message.role) {
    case 'tool-indicator':
      return <ToolIndicator key={index} toolName={message.toolName} toolStatus={message.toolStatus} />;
    case 'agent-working':
      return <AgentIndicator key={index} agentName={message.agentName} agentDisplay={message.agentDisplay} isWorking={true} />;
    default:
      return <ChatBubble key={index} role={message.role} content={message.content} attachments={message.attachments} />;
  }
};

const ChatSection: React.FC<ChatSectionProps> = ({
  messages,
  onSendMessage,
  isLoading = false,
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const hasMessages = messages.length > 0;

  // Group messages by sub-agent turn
  const groupedMessages: (Message | { isGroup: true; agentName: string; agentDisplay: string; messages: Message[] })[] = [];
  let currentGroup: { isGroup: true; agentName: string; agentDisplay: string; messages: Message[] } | null = null;

  for (const message of messages) {
    const agentName = message.agentName;
    const agentDisplay = message.agentDisplay;

    if (agentName && agentDisplay) {
      // This message belongs to a sub-agent
      if (currentGroup && currentGroup.agentName === agentName) {
        currentGroup.messages.push(message);
      } else {
        if (currentGroup) {
          groupedMessages.push(currentGroup);
        }
        currentGroup = {
          isGroup: true,
          agentName,
          agentDisplay,
          messages: [message],
        };
      }
    } else {
      // This message is not from a sub-agent
      if (currentGroup) {
        // If we are in a group, non-agent messages like tool calls belong to it
        if (message.role === 'tool-indicator') {
          currentGroup.messages.push(message);
          continue;
        }
        // Otherwise, the group ends
        groupedMessages.push(currentGroup);
        currentGroup = null;
      }
      groupedMessages.push(message);
    }
  }
  if (currentGroup) {
    groupedMessages.push(currentGroup);
  }

  if (!hasMessages) {
    // Welcome state
    return (
      <div
        className="h-screen flex flex-col items-center justify-center relative"
        style={{ backgroundImage: 'url(/Welcome.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute top-6 left-6 flex items-end gap-3">
          <Image src="/bloom_logo.svg" alt="Bloom Logo" width={32} height={32} />
          <span className="text-xl font-bold text-gray-800">Bloom</span>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Bloom</h1>
          <p className="text-gray-600">Your AI assistant is ready to help</p>
        </div>
        <ChatInput onSendMessage={onSendMessage} disabled={isLoading} />
      </div>
    );
  }

  // Chat state
  return (
    <div className="h-screen flex flex-col bg-white relative">
      <div className="absolute top-6 left-6 flex items-end gap-3 z-10">
        <Image src="/bloom_logo.svg" alt="Bloom Logo" width={28} height={28} />
        <span className="text-lg font-bold text-gray-800">Bloom</span>
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto pt-16 bg-white">
        <div className="max-w-2xl mx-auto px-8">
          <div className="space-y-8">
            {groupedMessages.map((item, index) => {
              if ('isGroup' in item) {
                return (
                  <AgentResponseWrapper
                    key={index}
                    agentName={item.agentName}
                    agentDisplay={item.agentDisplay}
                  >
                    <div className="space-y-4">
                      {item.messages.map((message, msgIndex) => (
                        <MessageRenderer key={msgIndex} message={message} index={msgIndex} />
                      ))}
                    </div>
                  </AgentResponseWrapper>
                );
              } else {
                return <MessageRenderer key={index} message={item as Message} index={index} />;
              }
            })}

            {isLoading && (
              <div className="mb-8">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <div
                      className="rounded-full"
                      style={{ width: '8px', height: '8px', backgroundColor: '#00311e', animation: 'scale 1.5s ease-in-out infinite' }}
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
          <ChatInput onSendMessage={onSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default ChatSection;