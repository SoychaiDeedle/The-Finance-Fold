import {
  AthenaClient,
  StartQueryExecutionCommand,
  GetQueryExecutionCommand,
  GetQueryResultsCommand,
  QueryExecutionState,
} from "@aws-sdk/client-athena"

export const athena = new AthenaClient({
  region: process.env.AWS_ATHENA_REGION!,
  credentials: {
    accessKeyId:     process.env.AWS_ATHENA_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_ATHENA_SECRET_KEY!,
  },
})

export async function waitForQuery(id: string, maxAttempts = 80): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await athena.send(new GetQueryExecutionCommand({ QueryExecutionId: id }))
    const state = res.QueryExecution?.Status?.State
    if (state === QueryExecutionState.SUCCEEDED) return
    if (state === QueryExecutionState.FAILED || state === QueryExecutionState.CANCELLED) {
      throw new Error(res.QueryExecution?.Status?.StateChangeReason ?? `Query ${state}`)
    }
    await new Promise(r => setTimeout(r, 1500))
  }
  throw new Error("Athena query timed out")
}

export async function getAllRows(id: string): Promise<Record<string, string>[]> {
  const rows: Record<string, string>[] = []
  let nextToken: string | undefined
  let headers: string[] = []

  do {
    const res = await athena.send(
      new GetQueryResultsCommand({ QueryExecutionId: id, NextToken: nextToken })
    )
    const resultRows = res.ResultSet?.Rows ?? []

    if (!headers.length && resultRows.length) {
      headers = resultRows[0].Data?.map(d => d.VarCharValue ?? "") ?? []
      for (let i = 1; i < resultRows.length; i++) {
        const obj: Record<string, string> = {}
        resultRows[i].Data?.forEach((d, j) => { obj[headers[j]] = d.VarCharValue ?? "" })
        rows.push(obj)
      }
    } else {
      for (const row of resultRows) {
        const obj: Record<string, string> = {}
        row.Data?.forEach((d, j) => { obj[headers[j]] = d.VarCharValue ?? "" })
        rows.push(obj)
      }
    }
    nextToken = res.NextToken
  } while (nextToken)

  return rows
}

export async function queryAthena(sql: string): Promise<Record<string, string>[]> {
  const start = await athena.send(new StartQueryExecutionCommand({
    QueryString: sql,
    WorkGroup: "primary",
    QueryExecutionContext: { Database: "ss-dl", Catalog: "AwsDataCatalog" },
  }))
  const qid = start.QueryExecutionId!
  await waitForQuery(qid)
  return getAllRows(qid)
}

export function earliestPartition(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export function monthRange(from: string, to: string): string[] {
  const months: string[] = []
  let [y, m] = from.split("-").map(Number)
  const [ey, em] = to.split("-").map(Number)
  while (y < ey || (y === ey && m <= em)) {
    months.push(`${y}-${String(m).padStart(2, "0")}`)
    m++
    if (m > 12) { m = 1; y++ }
  }
  return months
}

export function buildMonthChunks(from: string, to: string): { from: string; to: string }[] {
  const chunks: { from: string; to: string }[] = []
  let cursor = new Date(from + "T00:00:00Z")
  const end = new Date(to + "T00:00:00Z")
  while (cursor <= end) {
    const year = cursor.getUTCFullYear()
    const month = cursor.getUTCMonth()
    const chunkFrom = cursor.toISOString().slice(0, 10)
    const lastDay = new Date(Date.UTC(year, month + 1, 0))
    const chunkTo = lastDay <= end ? lastDay.toISOString().slice(0, 10) : end.toISOString().slice(0, 10)
    chunks.push({ from: chunkFrom, to: chunkTo })
    cursor = new Date(Date.UTC(year, month + 1, 1))
  }
  return chunks
}
