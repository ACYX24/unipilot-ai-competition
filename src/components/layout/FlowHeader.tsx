import { Badge } from '../ui/Badge'
import { useRoom } from '../../state/RoomContext'

const stages = [
  { key: 'statement', label: '独立陈述' },
  { key: 'waiting', label: '等待提交' },
  { key: 'feedback', label: '私人反馈' },
  { key: 'analysis', label: '观点转述' },
  { key: 'interaction', label: '互动环节' },
  { key: 'agreement', label: '改善约定' },
] as const

/** 房间页共用的头部：争议主题 + 六阶段进度 */
export function FlowHeader({ current }: { current: (typeof stages)[number]['key'] }) {
  const { room, bothSubmitted } = useRoom()
  const currentIndex = stages.findIndex((s) => s.key === current)
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="orange">房间 {room.inviteCode}</Badge>
        {room.relation && <Badge tone="blush">{room.relation}</Badge>}
        <Badge tone={bothSubmitted ? 'matcha' : 'neutral'}>
          {bothSubmitted ? '双方陈述已完成 ✓' : '陈述互不可见 🔒'}
        </Badge>
      </div>
      {room.topic && (
        <h1 className="mt-3 text-lg md:text-2xl font-extrabold text-cocoa-800 leading-snug">
          ⚖️ {room.topic}
        </h1>
      )}
      {/* 阶段进度 */}
      <ol className="mt-4 flex items-center gap-1 overflow-x-auto pb-1">
        {stages.map((s, i) => {
          const done = i < currentIndex
          const active = i === currentIndex
          return (
            <li key={s.key} className="flex items-center gap-1 shrink-0">
              {i > 0 && <span className={`w-4 md:w-8 h-0.5 rounded ${done || active ? 'bg-tang-300' : 'bg-cream-300'}`} />}
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${
                  active
                    ? 'bg-tang-400 text-white shadow-soft'
                    : done
                      ? 'bg-tang-100 text-tang-600'
                      : 'bg-cream-200 text-cocoa-400'
                }`}
              >
                {done ? '✓ ' : ''}
                {s.label}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
