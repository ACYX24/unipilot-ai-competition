import { AnalysisError } from "./analysis-errors"
import { createSupabaseAdmin } from "./supabase-admin"
import {
  isMissingAnalysisColumnsError,
  isMissingFunctionError,
  type SupabaseErrorLike,
} from "./supabase-errors"

const LEASE_SECONDS = 90

export function mapClaimError(error: SupabaseErrorLike): AnalysisError {
  if (
    isMissingFunctionError(error, [
      "claim_room_analysis",
      "release_room_analysis",
    ]) ||
    isMissingAnalysisColumnsError(error)
  ) {
    return new AnalysisError(
      "analysis_migration_missing",
      "数据库尚未执行分析迁移，请管理员执行迁移",
      503,
      false,
    )
  }

  console.error("[analysis] claim failed", { code: error.code })
  return new AnalysisError("analysis_failed", "领取分析任务失败，请重试", 500, true)
}

export async function claimRoomAnalysis(roomId: string) {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase.rpc("claim_room_analysis", {
    p_room_id: roomId,
    p_lease_seconds: LEASE_SECONDS,
  })

  if (error) {
    throw mapClaimError(error)
  }

  return data === true
}

export async function releaseRoomAnalysis(roomId: string, errorCode: string) {
  const supabase = createSupabaseAdmin()
  const { error } = await supabase.rpc("release_room_analysis", {
    p_room_id: roomId,
    p_error: errorCode,
  })

  if (error) {
    // 释放失败只记录错误码，不阻塞响应；租约到期后会自然失效
    console.error("[analysis] release lease failed", { code: error.code })
  }
}
