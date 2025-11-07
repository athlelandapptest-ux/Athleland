// app/layout.tsx
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { AdminAuthProvider } from "@/components/admin-auth"
import { LoadingScreen } from "@/components/loading-screen"
import { ThemeProvider } from "@/components/theme-provider" // ← use your wrapper
import { Toaster } from "react-hot-toast"
import "./globals.css"

export const metadata: Metadata = {
  title: "ATHLELAND Conditioning Club",
  description: "Elite fitness programming designed for athletes who demand excellence",
  generator: "v0.app",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Do not put dynamic class/style on <html>. No <head /> needed in App Router. */}
      <body
        suppressHydrationWarning
        className={`${GeistSans.className} ${GeistMono.variable} min-h-screen bg-black antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AdminAuthProvider>
            <LoadingScreen />
            {children}
            <Toaster />
          </AdminAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
