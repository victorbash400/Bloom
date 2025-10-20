import React from "react";
import { ExternalLink } from "lucide-react";

interface CitationsProps {
  citations: string[];
}

const Citations: React.FC<CitationsProps> = ({ citations }) => {
  if (!citations || citations.length === 0) return null;

  const getDomain = (url: string) => {
    try {
      const { hostname } = new URL(url);
      return hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
      <span className="text-gray-500 font-medium">Sources:</span>
      {citations.map((citation, index) => {
        const domain = getDomain(citation);
        const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

        return (
          <a
            key={index}
            href={citation}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 transition-all duration-150 rounded-full px-2.5 py-1 text-gray-700 group"
            title={citation}
          >
            <img
              src={favicon}
              alt=""
              className="w-4 h-4 rounded-sm flex-shrink-0"
              onError={(e) =>
                ((e.target as HTMLImageElement).style.display = "none")
              }
            />
            <span className="text-xs font-medium truncate max-w-[100px] sm:max-w-[140px]">
              {domain}
            </span>
            <ExternalLink
              size={12}
              className="text-gray-400 group-hover:text-gray-600 flex-shrink-0"
            />
          </a>
        );
      })}
    </div>
  );
};

export default Citations;
