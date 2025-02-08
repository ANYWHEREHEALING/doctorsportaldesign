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
    img.src =
      "/summary.png"

    img.onload = () => {

      // Draw body outline
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Draw points
     
    }
  }, [points])

  return <canvas ref={canvasRef} className="w-full max-w-md mx-auto" />
}

