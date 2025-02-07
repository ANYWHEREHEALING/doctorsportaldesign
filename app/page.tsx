"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button, Input, Label, Checkbox, Switch } from "@/app/components/ui"
import { Moon, Sun } from "lucide-react"

export default function LoginPage() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

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
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-[#D1D9CB] dark:border-gray-700 p-8 shadow-sm transition-colors duration-300">
          {/* Logo */}
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
            <h1 className="text-2xl font-medium text-center mb-8 dark:text-white">Login</h1>

            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email..."
                className="bg-gray-100 dark:bg-gray-700 border-0 h-12 rounded-lg dark:text-white dark:placeholder-gray-400"
              />

              <Input
                type="password"
                placeholder="Enter your password..."
                className="bg-gray-100 dark:bg-gray-700 border-0 h-12 rounded-lg dark:text-white dark:placeholder-gray-400"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="privacy" className="border-gray-400 dark:border-gray-600" />
              <Label htmlFor="privacy" className="text-sm text-gray-600 dark:text-gray-300">
                By Login in Anywhere Healing, I agree the privacy policy.
              </Label>
            </div>

            <Button className="w-full h-12 bg-[#8BA872] hover:bg-[#7A946A] text-white rounded-lg">continue</Button>

            <div className="text-center">
              <a href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">
                Forget Password?
              </a>
            </div>
          </div>
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

