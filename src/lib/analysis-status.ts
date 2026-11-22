const analysisErrorMessages: Record<string, string> = {
  llm_not_configured: "服务端尚未配置 AI 模型，请联系管理员",
  llm_timeout: "AI 响应超时，请重试",
  llm_rate_limited: "AI 服务繁忙，请稍后重试",
  llm_auth_failed: "AI 服务鉴权失败，请联系管理员",
  llm_upstream_error: "AI 服务暂时不可用，请稍后重试",
  llm_invalid_output: "AI 报告格式异常，请重试",
  report_persist_failed: "报告保存失败，请重试",
  analysis_migration_missing: "数据库迁移未执行，请联系管理员",
  report_missing: "报告数据异常，请联系管理员",
  rate_limited: "操作过于频繁，请稍后再试",
}

const nonRetryableCodes = new Set([
  "llm_not_configured",
  "llm_auth_failed",
  "analysis_migration_missing",
  "report_missing",
])

export function formatAnalysisError(code: string | null | undefined) {
  if (!code) return ""
  return analysisErrorMessages[code] ?? "分析失败，请稍后重试"
}

export function isAnalysisErrorRetryable(code: string | null | undefined) {
  if (!code) return true
  return !nonRetryableCodes.has(code)
}