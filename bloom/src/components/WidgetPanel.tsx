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
    <div className="fixed right-8 top-20 w-80 z-40 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <div className="rounded-lg p-1" style={{ backgroundColor: '#D3E1C4' }}>
        <WidgetRenderer widget={widget} />
      </div>
    </div>
  );
};

export default WidgetPanel;