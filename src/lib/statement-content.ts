export const STATEMENT_MAX_LENGTH = 2000

const LEGACY_DRAFT_FIELDS = [
  { id: "events", title: "事情经过" },
  { id: "feelings", title: "你当时的感受" },
  { id: "concern", title: "你最在意的问题" },
  { id: "understand", title: "你希望对方理解的内容" },
  { id: "change", title: "你希望对方做出的改变" },
] as const

export function parseStatementDraft(saved: string) {
  let draft: unknown
  try {
    draft = JSON.parse(saved)
  } catch {
    return ""
  }

  if (typeof draft === "string") return draft
  if (!draft || typeof draft !== "object") return ""

  const fields = draft as Record<string, unknown>
  return buildStatementContent(
    LEGACY_DRAFT_FIELDS.flatMap(({ id, title }) => {
      const value = fields[id]
      return typeof value === "string" && value.trim() ? [{ title, value }] : []
    }),
  )
}

export interface StatementAnswer {
  title: string
  value: string
}

/** 保留旧问答草稿的段落和语境。 */
export function buildStatementContent(answers: StatementAnswer[]) {
  return answers
    .map((answer) => `【${answer.title}】\n${answer.value.trim()}`)
    .join("\n\n")
}
