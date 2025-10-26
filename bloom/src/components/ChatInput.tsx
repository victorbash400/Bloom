import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { CirclePlus } from 'lucide-react';

interface Attachment {
  id: string;
  name: string;
  type: string;
}

interface ChatInputProps {
  onSendMessage: (message: string, pdfContextIds?: string[], attachments?: Attachment[]) => void;
  disabled?: boolean;
  currentAgent?: string | null;
}

interface Agent {
  id: string;
  name: string;
  active: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  backendId?: string; // ID returned from backend after successful upload
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  currentAgent = null,
}) => {
  
  const getAgentDisplay = (agentName: string | null) => {
    if (!agentName) return 'Bloom Chat';
    
    const agentMap: Record<string, string> = {
      'farm_agent': '🌱 Farm Agent',
      'planner_agent': '📋 Planner Agent',
      'market_agent': '💰 Market Agent',
      'bloom_main_agent': 'Bloom Chat'
    };
    
    return agentMap[agentName] || 'Bloom Chat';
  };
  const [input, setInput] = useState('');
  const [showAgentsModal, setShowAgentsModal] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([
    { id: 'planner', name: 'Planner', active: false },
    { id: 'farm', name: 'Farm Agent', active: false },
    { id: 'market', name: 'Market Agent', active: false },
  ]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      // Get ready PDF context IDs and attachment info
      const readyFiles = uploadedFiles.filter(f => f.status === 'ready' && f.backendId);
      const pdfContextIds = readyFiles.map(f => f.backendId!);
      const attachments: Attachment[] = readyFiles.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type
      }));

      onSendMessage(
        input.trim(),
        pdfContextIds.length > 0 ? pdfContextIds : undefined,
        attachments.length > 0 ? attachments : undefined
      );
      setInput('');
      setUploadedFiles([]); // Clear uploaded files after sending
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Only allow PDF files for now
      if (file.type !== 'application/pdf') {
        alert('Only PDF files are supported at the moment.');
        continue;
      }

      const fileId = Date.now().toString() + i;
      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        type: file.type,
        size: file.size,
        status: 'uploading'
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);

      try {
        const formData = new FormData();
        formData.append('file', file);

        // Update status to processing
        setUploadedFiles(prev => prev.map(f =>
          f.id === fileId ? { ...f, status: 'processing' } : f
        ));

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/upload-pdf`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setUploadedFiles(prev => prev.map(f =>
            f.id === fileId ? { ...f, status: 'ready', backendId: result.file_id } : f
          ));
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        setUploadedFiles(prev => prev.map(f =>
          f.id === fileId ? { ...f, status: 'error' } : f
        ));
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

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
      {/* File indicators */}
      {uploadedFiles.length > 0 && (
        <div className="mb-3 space-y-2">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                    <div className="flex items-center gap-1">
                      {file.status === 'uploading' && (
                        <>
                          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs text-blue-600">Uploading...</span>
                        </>
                      )}
                      {file.status === 'processing' && (
                        <>
                          <div className="w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs text-yellow-600">Processing...</span>
                        </>
                      )}
                      {file.status === 'ready' && (
                        <>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600">Ready</span>
                        </>
                      )}
                      {file.status === 'error' && (
                        <>
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-xs text-red-600">Error</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeFile(file.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] pt-[20px] px-[2px] pb-[2px]" style={{ backgroundColor: '#00311e' }}>
        <div className="absolute top-2 left-0 right-0 flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-white font-medium">
            <span>{getAgentDisplay(currentAgent)}</span>
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
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center p-0.5 hover:bg-gray-100 rounded-md transition-colors duration-200 group"
                title="Upload PDF files"
              >
                <CirclePlus className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Agents button */}
              <button
                type="button"
                onClick={() => setShowAgentsModal(!showAgentsModal)}
                className="relative flex items-center justify-center p-0.5 hover:bg-gray-100 rounded-md transition-colors duration-200 group"
                title="Agents"
              >
                <Image
                  src="/agents.svg"
                  alt="Agents"
                  width={20}
                  height={20}
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