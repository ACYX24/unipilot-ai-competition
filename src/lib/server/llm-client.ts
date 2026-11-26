import OpenAI, {
  APIConnectionTimeoutError,
  APIError,
  AuthenticationError,
  PermissionDeniedError,
  RateLimitError,
} from "openai"
import { AnalysisError } from "./analysis-errors"
import { consumeContestModelQuota } from "./contest-quota"
import { getLlmConfig } from "./env"

const LLM_TIMEOUT_MS = 30_000
const DEFAULT_MAX_TOKENS = 1800

function classifyLlmError(error: unknown): AnalysisError {
  if (error instanceof APIConnectionTimeoutError) {
    console.warn("[llm] request timeout")
    return new AnalysisError("llm_timeout", "AI 响应超时，请重试", 503, true)
  }

  if (error instanceof AuthenticationError || error instanceof PermissionDeniedError) {
    console.error("[llm] authentication failed")
    return new AnalysisError("llm_auth_failed", "AI 服务鉴权失败，请联系管理员", 503, false)
  }

  if (error instanceof RateLimitError) {
    console.warn("[llm] upstream rate limited")
    return new AnalysisError("llm_rate_limited", "AI 服务繁忙，请稍后重试", 503, true)
  }

  if (error instanceof APIError) {
    const status = typeof error.status === "number" ? error.status : undefined
    console.error("[llm] upstream error", { status })
    const misconfigured = status === 400 || status === 404
    return new AnalysisError(
      "llm_upstream_error",
      "AI 服务暂时不可用，请稍后重试",
      502,
      !misconfigured,
    )
  }

  console.error("[llm] unexpected error", {
    name: error instanceof Error ? error.name : "unknown",
  })
  return new AnalysisError("llm_upstream_error", "AI 服务暂时不可用，请稍后重试", 502, true)
}

export async function requestJsonCompletion(input: {
  system: string
  user: string
  temperature?: number
  maxTokens?: number
}): Promise<string> {
  const config = getLlmConfig()
  await consumeContestModelQuota()
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    timeout: LLM_TIMEOUT_MS,
    maxRetries: 0,
  })

  try {
    const completion = await client.chat.completions.create({
      model: config.model,
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.user },
      ],
      temperature: input.temperature ?? 0.4,
      max_tokens: input.maxTokens ?? DEFAULT_MAX_TOKENS,
      response_format: { type: "json_object" },
    })

    const content = completion.choices[0]?.message?.content?.trim()
    if (!content) {
      throw new AnalysisError("llm_invalid_output", "AI 返回了空结果，请重试", 502, true)
    }
    return content
  } catch (error) {
    if (error instanceof AnalysisError) throw error
    throw classifyLlmError(error)
  }
}
