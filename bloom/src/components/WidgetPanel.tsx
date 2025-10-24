import React from 'react';
import WidgetRenderer from './widgets/WidgetRenderer';

interface Widget {
  type: string;
  data: any;
}

interface WidgetPanelProps {
  widget: Widget | null;
}

const WidgetPanel: React.FC<WidgetPanelProps> = ({ widget }) => {
  if (!widget) return null;

  return (
    <div className="fixed right-4 top-20 w-96 z-10">
      <div className="rounded-2xl border-2 border-gray-300 bg-white/95 backdrop-blur-sm shadow-lg">
        <div className="p-4">
          <div className="flex items-center mb-3">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                Widget
              </span>
            </div>
          </div>
          <WidgetRenderer widget={widget} />
        </div>
      </div>
    </div>
  );
};

export default WidgetPanel;