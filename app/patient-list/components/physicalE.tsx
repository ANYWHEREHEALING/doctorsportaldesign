import React from 'react';

interface PhysicalExaminationProps {
  height: string;
  weight: string;
  sleepScore: any[];
}

export function PhysicalExamination({ height, weight, sleepScore }: PhysicalExaminationProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-6">Physical Examination</h3>
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📏</span>
              <span className="text-lg">Height</span>
            </div>
            <p className="text-2xl font-semibold">{height || 'N/A'} CM</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚖️</span>
              <span className="text-lg">Weight</span>
            </div>
            <p className="text-2xl font-semibold">{weight || 'N/A'} KG</p>
          </div>
        </div>

        {sleepScore && sleepScore.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">💤</span>
                <span>Sleep Score:</span>
                <span className="font-semibold">{sleepScore[0]}% Optimal</span>
              </div>
              <div className="flex items-center gap-2">
                <span>8h 55mins</span>
                <span>48bpm</span>
              </div>
            </div>
            
            <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal-500" 
                style={{ width: `${sleepScore[0]}%` }}
              />
            </div>
            
            <div className="flex justify-between text-sm mt-1">
              <span>12:20am</span>
              <span>09:15am</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}