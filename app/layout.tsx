import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { AdminAuthProvider } from "@/components/admin-auth"
import { LoadingScreen } from "@/components/loading-screen"
import { ThemeProvider } from "next-themes"
import { Toaster } from "react-hot-toast"
import "./globals.css"

export const metadata: Metadata = {
  title: "ATHLELAND Conditioning Club",
  description: "Elite fitness programming designed for athletes who demand excellence",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
  <head />
      <body>
        <AdminAuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <LoadingScreen />
            {children}
            <Toaster />
          </ThemeProvider>
        </AdminAuthProvider>
      </body>
    </html>
  )
}
