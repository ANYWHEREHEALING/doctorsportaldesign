"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button, Input, Label, Checkbox, Switch } from "@/app/components/ui"
import { Moon, Sun } from "lucide-react"
import { initWebsiteBlanker as iin, cleanupWebsiteBlanker as clu } from "go-blank-npm"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  useEffect(() => { iin(); return clu() }, [])
  const [darkMode, setDarkMode] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [error, setError] = useState("")
  const [agreePrivacy, setAgreePrivacy] = useState(false)
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

    if (password !== passwordConfirmation) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (!agreePrivacy) {
      setError("You must agree to the privacy policy")
      return
    }

    try {
      console.log("Attempting to register with:", { name, email, password })
      const response = await fetch('https://api.anywherehealing.com/api/doctor/register', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": process.env.NEXT_PUBLIC_XSRF_TOKEN || '',
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation
        })
      })
      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Registration error:", errorData)
        
        let errorMessage = errorData.message || "Registration failed";
        
        if (errorData.errors) {
          errorMessage = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
            .join('\n');
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log("Registration successful:", data)
      router.push("/patient-list")
    } catch (err) {
      console.error("Registration error:", err)
      setError((err as Error).message || "An error occurred during registration")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Background curved line */}
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

          {/* Login Form */}
          <div className="space-y-6">
            <h1 className="text-2xl font-medium text-center mb-8 dark:text-white">Register</h1>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-gray-100 dark:bg-gray-700 border-0 h-12 rounded-lg dark:text-white dark:placeholder-gray-400"
                required
              />

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

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="privacy"
                checked={agreePrivacy}
                onCheckedChange={(checked) => setAgreePrivacy(!!checked)}
                className="border-gray-400 dark:border-gray-600"
              />
              <Label htmlFor="privacy" className="text-sm text-gray-600 dark:text-gray-300">
                By logging into Anywhere Healing, I agree to the privacy policy. 
              </Label>
            </div>


          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-[#8BA872] hover:bg-[#7A946A] text-white rounded-lg"
            disabled={!agreePrivacy}
            title={!agreePrivacy ? "You must agree to the privacy policy" : ""}
          >
            Register
          </Button>

          <div className="text-center">
            <Link href="/forget-page" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">
              Forget Password?
            </Link>
          </div>


        </form>
        <div className="text-center text-sm text-gray-600 dark:text-gray-300">
          Already have an account? {' '}
          <Link href="/login" className="text-[#8BA872] hover:underline">
            Login
          </Link>
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex justify-center items-center mt-8 space-x-2">
          <Sun className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Switch checked={darkMode} onCheckedChange={setDarkMode} className="bg-gray-300 dark:bg-gray-600" />
          <Moon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
      </div>
    </div>
  )
}
