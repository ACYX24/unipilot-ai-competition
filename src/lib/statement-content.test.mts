import assert from "node:assert/strict"
import test from "node:test"
import {
  STATEMENT_MAX_LENGTH,
  buildStatementContent,
} from "./statement-content.ts"

const titles = [
  "事情经过",
  "你当时的感受",
  "你最在意的问题",
  "你希望对方理解的内容",
  "你希望对方做出的改变",
]

test("最终文本包含标题与题目之间的空行", () => {
  const content = buildStatementContent(
    titles.map((title, index) => ({ title, value: `答案${index + 1}` })),
  )
  assert.match(content, /^【事情经过】\n答案1\n\n【你当时的感受】\n答案2/)
  assert.equal(content.split("\n\n").length, titles.length)
})

test("长度统计包含标题与换行", () => {
  const content = buildStatementContent([
    { title: "事情经过", value: "内容" },
  ])
  const expected = "【事情经过】".length + 1 + "内容".length
  assert.equal(content.length, expected)
})

test("上限为 2000 字", () => {
  assert.equal(STATEMENT_MAX_LENGTH, 2000)
})

test("五题各 400 字时最终文本会超过上限", () => {
  const content = buildStatementContent(
    titles.map((title) => ({ title, value: "长".repeat(400) })),
  )
  assert.ok(content.length > STATEMENT_MAX_LENGTH)
})