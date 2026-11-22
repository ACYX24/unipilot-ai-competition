import assert from "node:assert/strict"
import test from "node:test"

import { formatAnalysisError, isAnalysisErrorRetryable } from "./analysis-status.ts"

test("formatAnalysisError: 已知错误码给出面向用户的中文文案", () => {
  assert.equal(formatAnalysisError("llm_timeout"), "AI 响应超时，请重试")
  assert.equal(formatAnalysisError("llm_rate_limited"), "AI 服务繁忙，请稍后重试")
  assert.equal(formatAnalysisError("llm_invalid_output"), "AI 报告格式异常，请重试")
  assert.equal(formatAnalysisError("report_persist_failed"), "报告保存失败，请重试")
})

test("formatAnalysisError: 未配置与迁移缺失提示联系管理员", () => {
  assert.equal(
    formatAnalysisError("llm_not_configured"),
    "服务端尚未配置 AI 模型，请联系管理员",
  )
  assert.equal(
    formatAnalysisError("analysis_migration_missing"),
    "数据库尚未执行分析迁移，请管理员执行迁移",
  )
})

test("formatAnalysisError: 未知错误码与空值走兜底", () => {
  assert.equal(formatAnalysisError("something_new"), "分析失败，请稍后重试")
  assert.equal(formatAnalysisError(null), "")
  assert.equal(formatAnalysisError(undefined), "")
})

test("isAnalysisErrorRetryable: 临时性故障允许重试", () => {
  assert.equal(isAnalysisErrorRetryable("llm_timeout"), true)
  assert.equal(isAnalysisErrorRetryable("llm_rate_limited"), true)
  assert.equal(isAnalysisErrorRetryable("llm_upstream_error"), true)
  assert.equal(isAnalysisErrorRetryable("report_persist_failed"), true)
  assert.equal(isAnalysisErrorRetryable("analysis_failed"), true)
  // 无错误码时默认允许重试
  assert.equal(isAnalysisErrorRetryable(null), true)
  assert.equal(isAnalysisErrorRetryable(undefined), true)
  assert.equal(isAnalysisErrorRetryable(""), true)
})

test("isAnalysisErrorRetryable: 配置类问题重试无意义，应联系管理员", () => {
  assert.equal(isAnalysisErrorRetryable("llm_not_configured"), false)
  assert.equal(isAnalysisErrorRetryable("llm_auth_failed"), false)
  assert.equal(isAnalysisErrorRetryable("analysis_migration_missing"), false)
  assert.equal(isAnalysisErrorRetryable("report_missing"), false)
})

test("isAnalysisErrorRetryable: 未知错误码按可重试处理", () => {
  assert.equal(isAnalysisErrorRetryable("something_new"), true)
})
