import { AnalysisError } from "./analysis-errors"
import { createSupabaseAdmin } from "./supabase-admin"

const LEASE_SECONDS = 90

function isMissingFunction(error: { code?: string; message?: string }) {
  return (
    error.code === "PGRST202" ||
    Boolean(error.message?.includes("claim_room_analysis")) ||
    Boolean(error.message?.includes("release_room_analysis"))
  )
}

export async function claimRoomAnalysis(roomId: string) {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase.rpc("claim_room_analysis", {
    p_room_id: roomId,
    p_lease_seconds: LEASE_SECONDS,
  })

  if (error) {
    if (isMissingFunction(error)) {
      throw new AnalysisError(
        "analysis_migration_missing",
        "数据库尚未执行分析迁移，请联系管理员",
        503,
        false,
      )
    }
    console.error("[analysis] claim failed", { code: error.code })
    throw new AnalysisError("analysis_failed", "领取分析任务失败，请重试", 500, true)
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
