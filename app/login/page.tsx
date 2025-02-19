"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button, Input,  Switch } from "@/app/components/ui"
import { Moon, Sun } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('https://api.anywherehealing.com/api/doctor/login', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": process.env.NEXT_PUBLIC_XSRF_TOKEN || '',
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password })
      })
  
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }
  
     
      if (!data?.access_token || !data?.doctor) {
        console.error('API response:', data)
        throw new Error("Invalid authentication response format - missing access_token or doctor data")
      }
  

      localStorage.setItem('token', data.access_token)
      localStorage.setItem('doctor', JSON.stringify(data.doctor))
      
      router.push("/patient-list")
    } catch (err) {
      setError((err as Error).message || "An error occurred during login")
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
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-[2rem] border border-[#D1D9CB] dark:border-gray-700 p-8 shadow-sm transition-colors duration-300">
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
            <h1 className="text-2xl font-medium text-center mb-8 dark:text-white">Login</h1>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-100 dark:bg-gray-700 border-0 h-12 rounded-lg dark:text-white dark:placeholder-gray-400"
                required
              />

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-100 dark:bg-gray-700 border-0 h-12 rounded-lg dark:text-white dark:placeholder-gray-400 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 dark:text-gray-400"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 bg-[#8BA872] hover:bg-[#7A946A] text-white rounded-lg">
              Login
            </Button>

            <div className="text-center">
              <Link href="/forget-page" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">
                Forget Password?
              </Link>
            </div>
            <div className="text-center text-sm text-gray-600 dark:text-gray-300">
              Don&apos;t have an account? {' '}
              <Link href="/" className="text-[#8BA872] hover:underline">
                Register
              </Link>
            </div>
          </div>
        </form>

        <div className="flex justify-center items-center mt-8 space-x-2">
          <Sun className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Switch checked={darkMode} onCheckedChange={setDarkMode} className="bg-gray-300 dark:bg-gray-600" />
          <Moon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
      </div>
    </div>
  )
}