"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { testDatabaseConnection } from "@/app/actions"
import { Database, CheckCircle, XCircle, AlertCircle, Loader2, Settings, Zap } from "lucide-react"

interface ConnectionResult {
  success: boolean
  message?: string
  data?: {
    version?: string
    timestamp?: string
    featureFlags?: {
      events: boolean
      registrations: boolean
      sponsorship: boolean
      programs: boolean
    }
  }
}

export function NeonTestPanel() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<ConnectionResult | null>(null)

  const handleTest = async () => {
    setTesting(true)
    try {
      const response = await testDatabaseConnection()
      setResult(response)
    } catch (error) {
      setResult({
        success: false,
        message: "Connection test failed",
      })
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = () => {
    if (testing) return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
    if (!result) return <Database className="h-5 w-5 text-gray-400" />
    if (result.success) return <CheckCircle className="h-5 w-5 text-green-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusColor = () => {
    if (testing) return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    if (!result) return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    if (result.success) return "bg-green-500/20 text-green-400 border-green-500/30"
    return "bg-red-500/20 text-red-400 border-red-500/30"
  }

  const getStatusText = () => {
    if (testing) return "Testing..."
    if (!result) return "Not Tested"
    if (result.success) return "Connected"
    return "Failed"
  }

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Database className="h-5 w-5" />
            Neon Database Connection
          </CardTitle>
          <Badge className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-2">{getStatusText()}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Test */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Connection Status</h3>
            <p className="text-sm text-gray-600">Test your Neon database connectivity</p>
          </div>
          <Button onClick={handleTest} disabled={testing} className="bg-blue-600 hover:bg-blue-700 text-white">
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-lg border ${
                result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className={`font-medium ${result.success ? "text-green-800" : "text-red-800"}`}>
                  {result.success ? "Connection Successful" : "Connection Failed"}
                </span>
              </div>
              {result.message && (
                <p className={`text-sm ${result.success ? "text-green-700" : "text-red-700"}`}>{result.message}</p>
              )}
            </div>

            {/* Database Info */}
            {result.success && result.data && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Database Info</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    {result.data.version && <div>Version: {result.data.version}</div>}
                    {result.data.timestamp && (
                      <div>Connected at: {new Date(result.data.timestamp).toLocaleString()}</div>
                    )}
                  </div>
                </div>

                {/* Feature Flags */}
                {result.data.featureFlags && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Feature Flags
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(result.data.featureFlags).map(([feature, enabled]) => (
                        <div key={feature} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{feature}</span>
                          <Badge
                            className={
                              enabled
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-gray-100 text-gray-600 border-gray-200"
                            }
                          >
                            {enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Setup Instructions */}
        {!result?.success && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Setup Instructions</h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>To enable Neon database integration:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>
                      Create a Neon database at{" "}
                      <a href="https://neon.tech" className="underline" target="_blank" rel="noopener noreferrer">
                        neon.tech
                      </a>
                    </li>
                    <li>
                      Add your <code className="bg-blue-100 px-1 rounded">DATABASE_URL</code> to environment variables
                    </li>
                    <li>
                      Run the SQL scripts in the <code className="bg-blue-100 px-1 rounded">/scripts</code> folder
                    </li>
                    <li>Enable feature flags in your environment</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Environment Variables Status */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Environment Status</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">DATABASE_URL</span>
              <Badge
                className={
                  process.env.DATABASE_URL
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-red-100 text-red-800 border-red-200"
                }
              >
                {process.env.DATABASE_URL ? "Set" : "Missing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">NEXT_PUBLIC_DATABASE_CONFIGURED</span>
              <Badge
                className={
                  process.env.NEXT_PUBLIC_DATABASE_CONFIGURED
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-gray-100 text-gray-600 border-gray-200"
                }
              >
                {process.env.NEXT_PUBLIC_DATABASE_CONFIGURED || "Not Set"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
