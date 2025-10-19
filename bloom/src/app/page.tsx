'use client';

import React, { useState } from 'react';
import ChatSection from '../components/ChatSection';
import Sidebar from '../components/Sidebar';

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

const API_BASE_URL = 'http://localhost:8000';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>('');

  const handleSendMessage = async (content: string, pdfContextIds?: string[], attachments?: Attachment[]) => {
    console.log("handleSendMessage called");
    const userMessage: Message = { role: 'user', content, attachments };
    setMessages(prev => {
      console.log("Adding user message, prev messages:", prev.length);
      return [...prev, userMessage];
    });
    setIsLoading(true);
    setStreamingContent('');

    try {
      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          user_id: 'default_user',
          session_id: sessionId,
          pdf_context_ids: pdfContextIds,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      // Add empty assistant message that we'll update
      setMessages(prev => {
        console.log("Adding empty assistant message, prev messages:", prev.length);
        return [...prev, { role: 'assistant', content: '' }];
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setIsLoading(false);
          break;
        }

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'session') {
                setSessionId(data.session_id);
              } else if (data.type === 'agent_working') {
                // Agent is working - add agent working indicator and create new message for agent response
                setMessages(prev => {
                  const newMessages = [...prev];
                  
                  // Add agent working indicator
                  newMessages.push({
                    role: 'agent-working',
                    content: '',
                    agentName: data.agent_name,
                    agentDisplay: data.agent_display
                  });
                  
                  // Add NEW assistant message for agent response
                  newMessages.push({
                    role: 'assistant',
                    content: '',
                    agentName: data.agent_name,
                    agentDisplay: data.agent_display
                  });
                  
                  return newMessages;
                });
              } else if (data.type === 'tool_call') {
                                                    // Regular tool is being called - add tool indicator
                                                    setMessages(prev => {
                                                      const newMessages = [...prev];
                                                      
                                                      // Add tool indicator
                                                      newMessages.push({
                                                        role: 'tool-indicator',
                                                        content: '',
                                                        toolName: data.tool_name,
                                                        toolStatus: 'in-progress'
                                                      });
                                  
                                                      // Find the last assistant message to carry over the agent context
                                                      let lastAgentName: string | undefined = undefined;
                                                      let lastAgentDisplay: string | undefined = undefined;
                                                      for (let i = newMessages.length - 1; i >= 0; i--) {
                                                        if (newMessages[i].role === 'assistant') {
                                                          lastAgentName = newMessages[i].agentName;
                                                          lastAgentDisplay = newMessages[i].agentDisplay;
                                                          break;
                                                        }
                                                      }
                                  
                                                      // Add NEW assistant message for post-tool content, with agent context
                                                      newMessages.push({
                                                        role: 'assistant',
                                                        content: '',
                                                        agentName: lastAgentName,
                                                        agentDisplay: lastAgentDisplay
                                                      });
                                                      
                                                      return newMessages;
                                                    });              } else if (data.type === 'content') {
                console.log("Received content chunk:", data.content);
                setMessages(prev => {
                  const newMessages = [...prev];
                  
                  // Always update the LAST assistant message (most recent one)
                  const lastAssistantIndex = newMessages.length - 1;
                  if (lastAssistantIndex >= 0 && newMessages[lastAssistantIndex].role === 'assistant') {
                    console.log("Updating message content, current length:", newMessages[lastAssistantIndex].content.length);
                    newMessages[lastAssistantIndex].content += data.content;
                    
                    // Update agent info if provided
                    if (data.agent_name && data.agent_display) {
                      newMessages[lastAssistantIndex].agentName = data.agent_name;
                      newMessages[lastAssistantIndex].agentDisplay = data.agent_display;
                    }
                    
                    console.log("New content length:", newMessages[lastAssistantIndex].content.length);
                  }
                  
                  return newMessages;
                });
              } else if (data.type === 'done') {
                setIsLoading(false);
              } else if (data.type === 'error') {
                console.error('Streaming error:', data.error);
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = 'Sorry, I encountered an error. Please try again.';
                  return newMessages;
                });
                setIsLoading(false);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. Please make sure the backend server is running on port 8000.'
      }]);
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setIsLoading(false);
    setSessionId(null);
    setStreamingContent('');
  };

  return (
    <main className="bg-gray-50 min-h-screen">
      <Sidebar onNewChat={handleNewChat} />
      <ChatSection
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </main>
  );
}