export class LlmConfigError extends Error {
  constructor(message = "LLM 服务未配置") {
    super(message)
    this.name = "LlmConfigError"
  }
}

export interface LlmConfig {
  apiKey: string
  model: string
  baseURL?: string
}

export function getLlmConfig(): LlmConfig {
  const apiKey = process.env.LLM_API_KEY?.trim()
  const model = process.env.LLM_MODEL?.trim()
  const baseURL = process.env.LLM_BASE_URL?.trim()

  if (!apiKey || !model) {
    throw new LlmConfigError("LLM_API_KEY 或 LLM_MODEL 未配置")
  }

  return { apiKey, model, baseURL: baseURL || undefined }
}
