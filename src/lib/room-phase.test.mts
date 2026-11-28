import assert from "node:assert/strict"
import test from "node:test"

import { derivePhase, phaseAtLeast, type RoomPhase } from "./room-phase.ts"
import type { RoomStateResponse } from "./room-types.ts"

function buildState(
  overrides: Partial<Pick<RoomStateResponse, "myStatement" | "otherSubmitted">> = {},
): RoomStateResponse {
  return {
    room: {
      mode: "court",
      id: "room-1",
      inviteCode: "ABC123",
      topic: "谁该洗碗",
      disputeType: "家务分工",
      status: "collecting",
      expiresAt: "2026-11-29T00:00:00.000Z",
    },
    me: { side: "A", displayName: "小 A", joinedAt: "2026-11-22T00:00:00.000Z" },
    participants: [
      { side: "A", displayName: "小 A", joinedAt: "2026-11-22T00:00:00.000Z" },
      { side: "B", displayName: "小 B", joinedAt: "2026-11-22T00:05:00.000Z" },
    ],
    myStatement: null,
    otherSubmitted: false,
    analysis: {
      errorCode: null,
      leaseActive: false,
      canRetry: false,
      reportReady: false,
    },
    ...overrides,
  }
}

const STATEMENT = { content: "【我在意的】洗碗", submittedAt: "2026-11-22T01:00:00.000Z" }

test("derivePhase: 我方未提交时停在陈述阶段", () => {
  assert.equal(derivePhase(buildState()), "statement")
  // 对方已提交也不能跳过我方陈述
  assert.equal(derivePhase(buildState({ otherSubmitted: true })), "statement")
})

test("derivePhase: 我方已提交、对方未提交时等待", () => {
  assert.equal(derivePhase(buildState({ myStatement: STATEMENT })), "waiting")
})

test("derivePhase: 双方均已提交时进入反馈", () => {
  assert.equal(
    derivePhase(buildState({ myStatement: STATEMENT, otherSubmitted: true })),
    "feedback",
  )
})

test("phaseAtLeast: 同阶段视为已到达", () => {
  const phases: RoomPhase[] = [
    "statement",
    "waiting",
    "feedback",
    "analysis",
    "interaction",
    "agreement",
  ]
  for (const phase of phases) {
    assert.equal(phaseAtLeast(phase, phase), true, `${phase} 应等于自身`)
  }
})

test("phaseAtLeast: 后置阶段未到达时被守卫拦下", () => {
  assert.equal(phaseAtLeast("statement", "feedback"), false)
  assert.equal(phaseAtLeast("waiting", "feedback"), false)
  assert.equal(phaseAtLeast("feedback", "analysis"), false)
})

test("phaseAtLeast: 越过前置阶段时放行", () => {
  assert.equal(phaseAtLeast("feedback", "statement"), true)
  assert.equal(phaseAtLeast("agreement", "feedback"), true)
  assert.equal(phaseAtLeast("analysis", "waiting"), true)
})
