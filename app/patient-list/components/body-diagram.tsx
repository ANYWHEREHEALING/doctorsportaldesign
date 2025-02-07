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
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-08%20at%2012.34.51%E2%80%AFAM-jOHch3RracE9AmcyyuMeHGpBrQzZES.png"

    img.onload = () => {
      ctx.fillStyle = "#E2E8F0"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw body outline
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Draw points
      points.forEach((point) => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI)
        ctx.fillStyle = "#EF4444"
        ctx.fill()
      })
    }
  }, [points])

  return <canvas ref={canvasRef} className="w-full max-w-md mx-auto" />
}

