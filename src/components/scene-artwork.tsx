import Image from "next/image"
import type { RoomMode } from "@/lib/room-types"

export const modeDescriptions = {
  court: {
    name: "猫法官",
    detail: "各自陈述，听判判猫梳理两边的话。",
    frame: "court-claim",
  },
  teacher: {
    name: "猫老师",
    detail: "分别写张小纸条，再一起回顾和商量。",
    frame: "office-listening",
  },
} as const satisfies Record<RoomMode, { name: string; detail: string; frame: string }>

type SceneFrame = (typeof modeDescriptions)[RoomMode]["frame"]
  | "court-arrival" | "court-response" | "court-reading" | "court-verdict"
  | "office-arrival" | "office-organizing" | "office-sharing"

export function ScenePicture({ frame, eager }: { frame: SceneFrame; eager?: boolean }) {
  return (
    <Image
      src={`/scenes/${frame}.webp`}
      alt=""
      width={1536}
      height={768}
      unoptimized
      loading={eager ? "eager" : "lazy"}
      className="scene-picture"
    />
  )
}
