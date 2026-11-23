export interface SupabaseErrorLike {
  code?: string
  message?: string
}

const ANALYSIS_COLUMNS = [
  "analysis_lease_until",
  "analysis_error",
  "analysis_error_at",
  "analysis_completed_at",
  "analysis_attempts",
]

export function isMissingFunctionError(
  error: SupabaseErrorLike,
  functionNames: string[],
) {
  if (error.code === "PGRST202") return true
  return functionNames.some((name) => error.message?.includes(name))
}

export function isMissingAnalysisColumnsError(error: SupabaseErrorLike) {
  if (error.code !== "42703" && error.code !== "PGRST204") return false
  return ANALYSIS_COLUMNS.some((column) => error.message?.includes(column))
}