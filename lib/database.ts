import { neon } from "@neondatabase/serverless"

let sql: ReturnType<typeof neon> | null = null
let isNeonConfigured = false

// Initialize Neon connection only when DATABASE_URL is available
function initializeNeon() {
  if (sql) return sql

  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL environment variable not set - Neon features disabled")
    isNeonConfigured = false
    return null
  }

  try {
    sql = neon(process.env.DATABASE_URL)
    isNeonConfigured = true
    console.log("Neon database connection initialized")
    return sql
  } catch (error) {
    console.error("Failed to initialize Neon connection:", error)
    isNeonConfigured = false
    return null
  }
}

export function getNeonSql() {
  return initializeNeon()
}

export function isNeonAvailable() {
  return isNeonConfigured && sql !== null
}

export async function testConnection() {
  const neonSql = getNeonSql()

  if (!neonSql) {
    return {
      success: false,
      message: "DATABASE_URL not configured - Neon features disabled",
    }
  }

  try {
    const result = await neonSql`SELECT NOW() as current_time, version() as version`
    return {
      success: true,
      data: {
        timestamp: result[0].current_time,
        version: result[0].version,
      },
      message: "Database connection successful",
    }
  } catch (error) {
    console.error("Database connection failed:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Database connection failed",
    }
  }
}

export async function checkTableExists(tableName: string): Promise<boolean> {
  const neonSql = getNeonSql()

  if (!neonSql) {
    return false
  }

  try {
    const result = await neonSql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      )
    `
    return result[0].exists
  } catch (error) {
    console.error(`Error checking table ${tableName}:`, error)
    return false
  }
}

export async function getTableCount(tableName: string): Promise<number> {
  const neonSql = getNeonSql()

  if (!neonSql) {
    return 0
  }

  try {
    const result = await neonSql`SELECT COUNT(*) as count FROM ${neonSql(tableName)}`
    return Number.parseInt(result[0].count)
  } catch (error) {
    console.error(`Error getting count for table ${tableName}:`, error)
    return 0
  }
}

// Export the sql instance for backward compatibility, but it may be null
export { sql }
