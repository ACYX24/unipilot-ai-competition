export const STATEMENT_MAX_LENGTH = 2000

export interface StatementAnswer {
  title: string
  value: string
}

/** 与服务端提交的 content 完全一致：包含标题、换行，并对各题答案 trim。 */
export function buildStatementContent(answers: StatementAnswer[]) {
  return answers
    .map((answer) => `【${answer.title}】\n${answer.value.trim()}`)
    .join("\n\n")
}