export type AnalysisErrorCode =
  | "llm_not_configured"
  | "llm_timeout"
  | "llm_auth_failed"
  | "llm_rate_limited"
  | "llm_upstream_error"
  | "llm_invalid_output"
  | "llm_privacy_violation"
  | "report_persist_failed"
  | "analysis_migration_missing"
  | "analysis_failed"

export class AnalysisError extends Error {
  constructor(
    readonly code: AnalysisErrorCode,
    message: string,
    readonly status: number,
    readonly retryable: boolean,
  ) {
    super(message)
    this.name = "AnalysisError"
  }
}

export function toAnalysisError(error: unknown): AnalysisError {
  if (error instanceof AnalysisError) return error

  if (error instanceof Error && error.name === "LlmConfigError") {
    return new AnalysisError(
      "llm_not_configured",
      "服务端尚未配置 AI 模型，请联系管理员",
      503,
      false,
    )
  }

  return new AnalysisError(
    "analysis_failed",
    "分析暂时失败，请稍后重试",
    500,
    true,
  )
}
