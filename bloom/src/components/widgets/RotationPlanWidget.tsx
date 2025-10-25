'use client';

import React from 'react';
import { Repeat, ArrowRight, Lightbulb } from 'lucide-react';

interface PlotRotation {
  historical_sequence: string[];
  last_crop: string;
  suggested_next_crop: string;
  rotation_pattern: string;
  total_seasons: number;
}

interface RotationPlanData {
  analysis_type: string;
  plot_name: string | null;
  plots_analyzed: number;
  rotation_plans: Record<string, PlotRotation>;
  analysis_timestamp: string;
}

interface RotationPlanWidgetProps {
  data: RotationPlanData;
}

const RotationPlanWidget: React.FC<RotationPlanWidgetProps> = ({ data }) => {
  const getCropEmoji = (crop: string) => {
    switch (crop.toLowerCase()) {
      case 'maize':
        return '🌽';
      case 'beans':
        return '🫘';
      case 'potatoes':
        return '🥔';
      default:
        return '🌱';
    }
  };

  const getCropColor = (crop: string) => {
    switch (crop.toLowerCase()) {
      case 'maize':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'beans':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'potatoes':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const plotEntries = Object.entries(data.rotation_plans);

  return (
    <div className="rounded-2xl border-2 border-black p-4 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Repeat className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-semibold text-gray-800">Crop Rotation Plan</h3>
        </div>
        <div className="text-xs text-gray-600">
          {data.plots_analyzed} {data.plots_analyzed === 1 ? 'plot' : 'plots'}
        </div>
      </div>

      {/* Rotation Plans */}
      <div className="space-y-3">
        {plotEntries.map(([plotName, rotation], index) => (
          <div key={index} className="border-2 border-gray-200 rounded-lg p-3">
            {/* Plot Name */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-gray-800">{plotName}</div>
              <div className="text-xs text-gray-600">{rotation.total_seasons} seasons</div>
            </div>

            {/* Rotation Pattern */}
            <div className="bg-gray-50 rounded-lg p-2 mb-2">
              <div className="text-xs text-gray-600 mb-1">Historical Pattern</div>
              <div className="flex items-center gap-1 flex-wrap">
                {rotation.historical_sequence.slice(-4).map((crop, idx) => (
                  <React.Fragment key={idx}>
                    <div className={`px-2 py-1 rounded text-xs font-medium border ${getCropColor(crop)}`}>
                      {getCropEmoji(crop)} {crop}
                    </div>
                    {idx < Math.min(3, rotation.historical_sequence.length - 1) && (
                      <ArrowRight className="w-3 h-3 text-gray-400" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Suggestion */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Suggested Next Crop</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded text-sm font-bold border-2 ${getCropColor(rotation.suggested_next_crop)}`}>
                  {getCropEmoji(rotation.suggested_next_crop)} {rotation.suggested_next_crop}
                </div>
                <div className="text-xs text-blue-600">
                  (Avoids repeating {rotation.last_crop})
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rotation Benefits */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs font-medium text-gray-700 mb-2">Rotation Benefits</div>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-start gap-2">
            <span>✓</span>
            <span>Improves soil health and nutrient balance</span>
          </div>
          <div className="flex items-start gap-2">
            <span>✓</span>
            <span>Reduces pest and disease buildup</span>
          </div>
          <div className="flex items-start gap-2">
            <span>✓</span>
            <span>Optimizes land productivity over time</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RotationPlanWidget;
