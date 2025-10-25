import React from 'react';

interface Suggestion {
  text: string;
  agent: string;
  agentEmoji: string;
  position: string;
}

interface WelcomeSuggestionsProps {
  onSuggestionClick: (text: string) => void;
}

const suggestions: Suggestion[] = [
  {
    text: "Show me my farm plots on a map",
    agent: "Farm Monitor",
    agentEmoji: "🌱",
    position: "top-left"
  },
  {
    text: "What's the weather forecast for this week?",
    agent: "Farm Monitor",
    agentEmoji: "🌱",
    position: "top-center"
  },
  {
    text: "Check crop health with satellite imagery",
    agent: "Farm Monitor",
    agentEmoji: "🌱",
    position: "top-right"
  },
  {
    text: "What crops should I plant next season?",
    agent: "Planner",
    agentEmoji: "📋",
    position: "middle-left"
  },
  {
    text: "Show maize and bean market prices",
    agent: "Market Analyst",
    agentEmoji: "📊",
    position: "middle-right"
  },
  {
    text: "Compare profitability: maize vs beans",
    agent: "Planner",
    agentEmoji: "📋",
    position: "bottom-left"
  },
  {
    text: "When should I sell my potato harvest?",
    agent: "Market Analyst",
    agentEmoji: "📊",
    position: "bottom-right"
  }
];

const WelcomeSuggestions: React.FC<WelcomeSuggestionsProps> = ({ onSuggestionClick }) => {
  const getPositionClasses = (position: string) => {
    switch (position) {
      case 'top-left':
        return 'absolute top-[15%] left-[8%]';
      case 'top-center':
        return 'absolute top-[8%] left-1/2 -translate-x-1/2';
      case 'top-right':
        return 'absolute top-[15%] right-[8%]';
      case 'middle-left':
        return 'absolute top-1/2 left-[5%] -translate-y-1/2';
      case 'middle-right':
        return 'absolute top-1/2 right-[5%] -translate-y-1/2';
      case 'bottom-left':
        return 'absolute bottom-[15%] left-[8%]';
      case 'bottom-right':
        return 'absolute bottom-[15%] right-[8%]';
      default:
        return '';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className={`${getPositionClasses(suggestion.position)} pointer-events-auto`}
        >
          <button
            onClick={() => onSuggestionClick(suggestion.text)}
            className="group relative bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl px-4 py-3 shadow-lg hover:shadow-xl hover:bg-white/50 transition-all duration-300 hover:scale-105 max-w-[280px]"
          >
            <div className="flex items-start gap-2">
              <span className="text-lg flex-shrink-0">{suggestion.agentEmoji}</span>
              <div className="flex-1 text-left">
                <p className="text-sm text-gray-700 font-medium leading-snug">
                  {suggestion.text}
                </p>
                <span className="inline-block mt-1.5 text-xs text-gray-500 bg-white/60 px-2 py-0.5 rounded-full">
                  {suggestion.agent}
                </span>
              </div>
            </div>
          </button>
        </div>
      ))}
    </div>
  );
};

export default WelcomeSuggestions;
