import React from 'react';
import ReactMarkdown from 'react-markdown';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ role, content }) => {
  if (role === 'user') {
    return (
      <div className="flex justify-end mb-8">
        <div className="max-w-md">
          <div className="text-white rounded-3xl px-5 py-3 shadow-sm" style={{ backgroundColor: '#04331c' }}>
            <p className="text-sm leading-relaxed">{content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="w-full text-gray-900">
        <div className="text-base font-normal text-left prose prose-gray max-w-none" style={{ lineHeight: '1.7' }}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;