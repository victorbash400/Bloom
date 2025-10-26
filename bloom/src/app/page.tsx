'use client';

import React, { useState, useRef } from 'react';
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
  citations?: string[];
}

interface Widget {
  type: string;
  data: any;
  id: string;
  timestamp: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Home() {

  const [messages, setMessages] = useState<Message[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [sessionId, setSessionId] = useState<string | null>(null);

  const [currentCitations, setCurrentCitations] = useState<string[]>([]);

  const [widgets, setWidgets] = useState<Widget[]>([]);

  const [selectedWidgetIndex, setSelectedWidgetIndex] = useState<number>(0);

  const [currentAgent, setCurrentAgent] = useState<string | null>(null);



  const handleSendMessage = async (content: string, pdfContextIds?: string[], attachments?: Attachment[]) => {

    const userMessage: Message = { role: 'user', content, attachments };

    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);



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

              } else if (data.type === 'tool_call') {

                setMessages(prev => [...prev, {

                  role: 'tool-indicator',

                  content: '',

                  toolName: data.tool_name,

                  toolStatus: 'in-progress'

                }]);

              } else if (data.type === 'content') {

                // Track current agent
                if (data.agent_name) {
                  setCurrentAgent(data.agent_name);
                }

                setMessages(prev => {

                  const newMessages = [...prev];

                  const lastMessage = newMessages[newMessages.length - 1];



                  console.log('[Content Handler] Received data:', data);

                  console.log('[Content Handler] Last message:', JSON.parse(JSON.stringify(lastMessage)));



                  const isSameAgent = lastMessage?.role === 'assistant' && lastMessage?.agentName === data.agent_name;



                  if (lastMessage && lastMessage.role === 'assistant' && isSameAgent) {

                    lastMessage.content += data.content;

                  } else {

                    newMessages.push({

                      role: 'assistant',

                      content: data.content,

                      agentName: data.agent_name,

                      agentDisplay: data.agent_display,

                    });

                  }

                  return newMessages;

                });

              } else if (data.type === 'citations') {
                console.log('[Citations] Received citations:', data.citations);
                // Add citations to the last assistant message
                setMessages(prev => {
                  const newMessages = [...prev];
                  for (let i = newMessages.length - 1; i >= 0; i--) {
                    if (newMessages[i].role === 'assistant') {
                      newMessages[i].citations = data.citations;
                      break;
                    }
                  }
                  return newMessages;
                });
              } else if (data.type === 'widget') {
                console.log('[Widget] Received widget:', data.widget_type, data.widget_data);
                // Add widget to history
                setWidgets(prev => {
                  const newWidget: Widget = {
                    type: data.widget_type,
                    data: data.widget_data,
                    id: `widget-${Date.now()}-${Math.random()}`,
                    timestamp: Date.now()
                  };
                  const updated = [...prev, newWidget];
                  setSelectedWidgetIndex(updated.length - 1);
                  return updated;
                });
              } else if (data.type === 'done') {

                setIsLoading(false);

              } else if (data.type === 'error') {

                console.error('Streaming error:', data.error);

                setMessages(prev => [...prev, {

                  role: 'assistant',

                  content: 'Sorry, I encountered an error. Please try again.'

                }]);

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

  const handleNewChat = async () => {
    setMessages([]);
    setIsLoading(false);
    setSessionId(null);
    setCurrentCitations([]);
    setWidgets([]);
    setSelectedWidgetIndex(0);
    setCurrentAgent(null);

    // Clear reports folder on the backend
    try {
      await fetch(`${API_BASE_URL}/api/reports/clear`, {
        method: 'POST',
      });
      console.log('Reports folder cleared');
    } catch (error) {
      console.error('Error clearing reports:', error);
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen">
      <Sidebar onNewChat={handleNewChat} />
      <ChatSection
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        widgets={widgets}
        selectedWidgetIndex={selectedWidgetIndex}
        onSelectWidget={setSelectedWidgetIndex}
        currentAgent={currentAgent}
      />
    </main>
  );
}