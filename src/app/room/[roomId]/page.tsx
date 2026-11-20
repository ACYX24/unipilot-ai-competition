import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { RoomView } from "./room-view"

export default function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
          <Skeleton className="h-36 rounded-3xl" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-80 rounded-3xl" />
            <Skeleton className="h-80 rounded-3xl" />
          </div>
        </div>
      }
    >
      <RoomContent params={params} />
    </Suspense>
  )
}

async function RoomContent({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const { roomId } = await params
  return <RoomView roomId={roomId} />
}
