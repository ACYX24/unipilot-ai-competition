import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { ReportView } from "./report-view"

export default function ReportPage({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6">
          <Skeleton className="h-52 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      }
    >
      <ReportContent params={params} />
    </Suspense>
  )
}

async function ReportContent({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const { roomId } = await params
  return <ReportView roomId={roomId} />
}
