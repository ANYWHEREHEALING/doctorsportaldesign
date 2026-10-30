import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Anywhere Healing · Practitioner portal",
  description: "Follow the sleep, heart rate, HRV and stress your clients share from their Charisma Ring.",
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
