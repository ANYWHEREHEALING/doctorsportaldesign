"use client"

import { useEffect, useRef } from "react"

interface BodyPoint {
  x: number
  y: number
}

interface BodyDiagramProps {
  points: BodyPoint[]
}

export function BodyDiagram({ points }: BodyDiagramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 400
    canvas.height = 600

    // Load and draw body outline
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = "/summary.png"

    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw body outline
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Draw points
      points.forEach(point => {
        // Draw outer circle
        ctx.beginPath()
        ctx.arc(point.x, point.y, 15, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.fill()
        
        // Draw inner circle
        ctx.beginPath()
        ctx.arc(point.x, point.y, 8, 0, Math.PI * 2)
        ctx.fillStyle = point.y === 150 ? '#ef4444' : '#ffffff'
        ctx.fill()
      })
    }
  }, [points])

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <canvas 
        ref={canvasRef} 
        className="w-full max-w-md mx-auto"
      />
    </div>
  )
}
