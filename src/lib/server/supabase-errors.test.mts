import assert from "node:assert/strict"
import test from "node:test"
import {
  isMissingAnalysisColumnsError,
  isMissingFunctionError,
} from "./supabase-errors.ts"

test("识别缺失的 Supabase 函数", () => {
  assert.equal(
    isMissingFunctionError({ code: "PGRST202", message: "not found" }, [
      "claim_room_analysis",
    ]),
    true,
  )
  assert.equal(
    isMissingFunctionError(
      { message: "Could not find the function public.claim_room_analysis" },
      ["claim_room_analysis"],
    ),
    true,
  )
  assert.equal(
    isMissingFunctionError({ code: "42501", message: "permission denied" }, [
      "claim_room_analysis",
    ]),
    false,
  )
})

test("仅把分析租约字段缺失识别为迁移缺失", () => {
  assert.equal(
    isMissingAnalysisColumnsError({
      code: "42703",
      message: 'column rooms.analysis_lease_until does not exist',
    }),
    true,
  )
  assert.equal(
    isMissingAnalysisColumnsError({
      code: "42703",
      message: 'column rooms.other_column does not exist',
    }),
    false,
  )
  assert.equal(
    isMissingAnalysisColumnsError({
      code: "08006",
      message: "connection failure",
    }),
    false,
  )
})