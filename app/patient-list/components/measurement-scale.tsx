"use client"
import React from 'react';

interface MeasurementScaleProps {
    title: string
    value: number
    minLabel: string
    maxLabel: string
    valueColor?: string;
  }
  
  export default function MeasurementScale({ 
    title, 
    value,
    minLabel,
    maxLabel
  }: MeasurementScaleProps) {
    const percentage = Math.min(Math.max(value, 0), 100)
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-700">{title}</h4>
          <span className="text-sm font-semibold text-blue-600">
            {percentage.toFixed(0)}%
          </span>
        </div>
        
        <div className="relative pt-1">
          <div className="flex mb-1 items-center justify-between">
            <div className="w-full relative">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-50">
                <div 
                  style={{ width: `${percentage}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
                ></div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
          </div>
        </div>
      </div>
    )
  }