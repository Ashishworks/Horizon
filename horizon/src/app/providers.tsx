// app/providers.tsx
"use client"

import { ThemeProvider } from 'next-themes'
import { useState, useEffect } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // This ensures the theme logic only runs on the client
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <ThemeProvider attribute="class" defaultTheme="dark">{children}</ThemeProvider>
}