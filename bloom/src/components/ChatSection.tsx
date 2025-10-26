import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import ToolIndicator from './ToolIndicator';
import WidgetPanel from './WidgetPanel';
import AgentResponseWrapper from './AgentResponseWrapper';
import WelcomeSuggestions from './WelcomeSuggestions';
import { getGreeting } from '../utils/greetings';

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
  citations?: string[];
}

interface Widget {
  type: string;
  data: any;
  id: string;
  timestamp: number;
}

interface ChatSectionProps {
  messages: Message[];
  onSendMessage: (message: string, pdfContextIds?: string[], attachments?: Attachment[]) => void;
  isLoading?: boolean;
  widgets?: Widget[];
  selectedWidgetIndex?: number;
  onSelectWidget?: (index: number) => void;
  currentAgent?: string | null;
}

// Helper to render a single message based on its role
const MessageRenderer = ({ message, index }: { message: Message; index: number }) => {
  switch (message.role) {
    case 'tool-indicator':
      return <ToolIndicator key={index} toolName={message.toolName} toolStatus={message.toolStatus} />;
    case 'agent-working':
      return null; // Skip agent working indicators
    default:
      return <ChatBubble key={index} role={message.role} content={message.content} attachments={message.attachments} citations={message.citations} />;
  }
};

const ChatSection: React.FC<ChatSectionProps> = ({
  messages,
  onSendMessage,
  isLoading = false,
  widgets = [],
  selectedWidgetIndex = 0,
  onSelectWidget,
  currentAgent = null,
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [greeting, setGreeting] = useState("Hello!");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

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
      <>
        <div
          className="h-screen flex flex-col items-center justify-center relative"
          style={{ backgroundImage: 'url(/darker.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute top-6 left-6 flex items-end gap-3">
            <Image src="/bloom_logo.svg" alt="Bloom Logo" width={32} height={32} />
            <span className="text-xl font-bold text-gray-800">Bloom</span>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">{greeting}</h1>
          </div>

          {/* Suggestion cards around the chat input */}
          <WelcomeSuggestions onSuggestionClick={(text) => onSendMessage(text)} />

          <ChatInput onSendMessage={onSendMessage} disabled={isLoading} currentAgent={currentAgent} />
        </div>
        {widgets.length > 0 && (
          <WidgetPanel
            widgets={widgets}
            selectedIndex={selectedWidgetIndex}
            onSelectWidget={onSelectWidget}
          />
        )}
      </>
    );
  }

  // Chat state
  return (
    <>
      <div className="h-screen relative" style={{ backgroundColor: '#D3E1C4' }}>
        <div className="absolute top-6 left-6 flex items-end gap-3 z-10">
          <Image src="/bloom_logo.svg" alt="Bloom Logo" width={28} height={28} />
          <span className="text-lg font-bold text-gray-800">Bloom</span>
        </div>

        <div ref={chatContainerRef} className="h-full overflow-y-auto pt-16 fade-out-bottom">
          <div className="max-w-2xl mx-auto px-8 pb-40">
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
                        className="rounded-full animate-pulse-scale"
                        style={{ width: '8px', height: '8px', backgroundColor: '#00311e' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating ChatInput */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl mb-4">
          <ChatInput onSendMessage={onSendMessage} disabled={isLoading} currentAgent={currentAgent} />
        </div>
      </div>
      {widgets.length > 0 && (
        <WidgetPanel
          widgets={widgets}
          selectedIndex={selectedWidgetIndex}
          onSelectWidget={onSelectWidget}
        />
      )}
    </>
  );
};

export default ChatSection;