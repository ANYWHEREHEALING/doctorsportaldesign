"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button, Input, Switch } from "@/app/components/ui"
import { Moon, Sun } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ForgetPassword() {
  const [darkMode, setDarkMode] = useState(false)
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('https://api.anywherehealing.com/api/doctor/reset/password', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": process.env.NEXT_PUBLIC_XSRF_TOKEN || '',
          "Accept": "application/json"
        },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to send verification code")
      }

      setCurrentStep(2)
      setError("")
    } catch (err) {
      setError((err as Error).message || "Failed to send verification code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('https://api.anywherehealing.com/api/doctor/reset/password/verify', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": process.env.NEXT_PUBLIC_XSRF_TOKEN || '',
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, code })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Invalid verification code")
      }

      setCurrentStep(3)
      setError("")
    } catch (err) {
      setError((err as Error).message || "Verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== passwordConfirmation) {
      setError("Passwords do not match")
      return
    }
    
    setIsLoading(true)
    try {
      const response = await fetch('https://api.anywherehealing.com/api/doctor/reset/password/reset', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": process.env.NEXT_PUBLIC_XSRF_TOKEN || '',
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, code, password })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Password reset failed")
      }

      router.push("/login")
    } catch (err) {
      setError((err as Error).message || "Password reset failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="absolute w-full top-1/3 -z-10">
        <svg className="w-full" viewBox="0 0 1440 200" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="1"
            d="M0,100 C320,150 720,50 1440,100"
            className="dark:stroke-gray-700"
          />
        </svg>
      </div>

      <div className="w-full max-w-md p-8">
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-[#D1D9CB] dark:border-gray-700 p-8 shadow-sm transition-colors duration-300">
          <div className="flex justify-center mb-8">
            <div className="relative w-40 h-8">
              <Image
                src="/Group.png"
                alt="Anywhere Healing Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-2xl font-medium text-center mb-8 dark:text-white">
              {currentStep === 1 ? 'Forgot Password' : currentStep === 2 ? 'Verify Code' : 'Reset Password'}
            </h1>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            {currentStep === 1 && (
              <form onSubmit={handleSendCode} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-100 dark:bg-gray-700 border-0 h-12 rounded-lg dark:text-white dark:placeholder-gray-400"
                  required
                />
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-[#8BA872] hover:bg-[#7A946A] text-white rounded-lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Code'}
                </Button>
              </form>
            )}

            {currentStep === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Enter verification code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="bg-gray-100 dark:bg-gray-700 border-0 h-12 rounded-lg dark:text-white dark:placeholder-gray-400"
                  required
                />
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-[#8BA872] hover:bg-[#7A946A] text-white rounded-lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>
              </form>
            )}

            {currentStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <Input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-100 dark:bg-gray-700 border-0 h-12 rounded-lg dark:text-white dark:placeholder-gray-400"
                  required
                />
                <Input
                  type="password"
                  placeholder="Confirm New Password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="bg-gray-100 dark:bg-gray-700 border-0 h-12 rounded-lg dark:text-white dark:placeholder-gray-400"
                  required
                />
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-[#8BA872] hover:bg-[#7A946A] text-white rounded-lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            )}

            <div className="text-center">
              <Link href="/login" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">
                Login
              </Link>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center mt-8 space-x-2">
          <Sun className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Switch checked={darkMode} onCheckedChange={setDarkMode} className="bg-gray-300 dark:bg-gray-600" />
          <Moon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
      </div>
    </div>
  )
}