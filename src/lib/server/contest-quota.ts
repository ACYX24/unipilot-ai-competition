import { AnalysisError } from "./analysis-errors"
import { createSupabaseAdmin } from "./supabase-admin"

function readLimit(value: string | undefined, fallback: number) {
  const limit = value ? Number(value) : fallback
  if (!Number.isInteger(limit) || limit < 1 || limit > 100_000) {
    throw new AnalysisError("contest_quota_unavailable", "比赛额度配置异常，请联系管理员", 503, false)
  }
  return limit
}

export async function consumeContestModelQuota() {
  if (process.env.CATJUDGE_CONTEST_MODE !== "1") return

  const { data, error } = await createSupabaseAdmin().rpc("consume_contest_model_quota", {
    p_daily_limit: readLimit(process.env.CATJUDGE_MODEL_DAILY_LIMIT, 100),
    p_minute_limit: readLimit(process.env.CATJUDGE_MODEL_MINUTE_LIMIT, 8),
  })

  if (!error && data === "allowed") return

  if (!error && data === "daily") {
    throw new AnalysisError("contest_quota_daily", "今天的 AI 体验额度已用完，请明天再试", 429, true)
  }
  if (!error && data === "minute") {
    throw new AnalysisError("contest_quota_minute", "当前体验人数较多，请稍后重试", 429, true)
  }

  console.error("[analysis] contest quota unavailable", { code: error?.code })
  throw new AnalysisError("contest_quota_unavailable", "AI 体验暂无法使用，请联系管理员", 503, false)
}
