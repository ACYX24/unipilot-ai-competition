import type { MediationReport, ReportSide } from "@/lib/mediation-report-schema"

export const MIN_LEAK_FRAGMENT_LENGTH = 12

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]/g, "")
}

/** 收集所有会展示给双方的叙事文本；昵称、主题等公开字段不参与检测。 */
function collectReportTexts(report: MediationReport) {
  const texts: string[] = [report.overallComment]

  for (const summary of report.summaries) texts.push(summary.text)
  for (const emotion of report.emotions) {
    texts.push(...emotion.tags, ...emotion.needs)
  }
  for (const item of report.misunderstandings) {
    texts.push(item.title, item.detail)
  }
  texts.push(...report.commonNeeds)
  for (const item of report.suggestions) texts.push(item.title, item.detail)
  for (const item of report.funTasks) texts.push(item.title, item.detail)

  return texts.map(normalizeText).filter(Boolean)
}

export interface StatementLeak {
  side: ReportSide
  fragmentLength: number
}

/**
 * 检测报告中是否照抄了任一方陈述中的连续片段。
 * 返回命中的一方与片段长度，不返回原文，避免在日志/响应中二次泄露。
 */
export function findStatementLeak(
  report: MediationReport,
  statements: Partial<Record<ReportSide, string>>,
): StatementLeak | null {
  const reportTexts = collectReportTexts(report)
  if (reportTexts.length === 0) return null

  for (const side of ["A", "B"] as const) {
    const raw = statements[side]
    if (!raw) continue
    const statement = normalizeText(raw)
    if (statement.length < MIN_LEAK_FRAGMENT_LENGTH) continue

    const seen = new Set<string>()
    for (let index = 0; index <= statement.length - MIN_LEAK_FRAGMENT_LENGTH; index += 1) {
      const fragment = statement.slice(index, index + MIN_LEAK_FRAGMENT_LENGTH)
      if (seen.has(fragment)) continue
      seen.add(fragment)
      if (reportTexts.some((text) => text.includes(fragment))) {
        return { side, fragmentLength: MIN_LEAK_FRAGMENT_LENGTH }
      }
    }
  }

  return null
}