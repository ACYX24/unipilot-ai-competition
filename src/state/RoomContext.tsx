import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { demoRoomInfo } from '../data/mock'

export type Side = 'A' | 'B'

export interface SideState {
  name: string
  avatar: string
  joined: boolean
  submitted: boolean
  feedbackRead: boolean
  draft: Record<string, string>
}

export interface RoomState {
  roomId: string
  inviteCode: string
  topic: string
  relation: string
  perspective: Side
  A: SideState
  B: SideState
  pebble: Partial<Record<Side, string>>
  action: Partial<Record<Side, string>>
  court: Partial<Record<string, boolean>>
  agreed: boolean
}

export type FlowStage =
  | 'statement'
  | 'waiting'
  | 'feedback'
  | 'analysis'
  | 'agreement'

function makeSide(name: string, avatar: string, joined: boolean): SideState {
  return { name, avatar, joined, submitted: false, feedbackRead: false, draft: {} }
}

function newRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `cat-${code}`
}

function initialRoom(roomId = newRoomId(), inviteCode = roomId.replace('cat-', 'CAT-')): RoomState {
  return {
    roomId,
    inviteCode,
    topic: demoRoomInfo.topic,
    relation: demoRoomInfo.relation,
    perspective: 'A',
    A: makeSide(demoRoomInfo.members.A.name, demoRoomInfo.members.A.avatar, true),
    B: makeSide(demoRoomInfo.members.B.name, demoRoomInfo.members.B.avatar, false),
    pebble: {},
    action: {},
    court: {},
    agreed: false,
  }
}

const STORAGE_PREFIX = 'catjudge-room-'

function loadRoom(roomId: string): RoomState | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + roomId)
    return raw ? (JSON.parse(raw) as RoomState) : null
  } catch {
    return null
  }
}

interface RoomContextValue {
  room: RoomState
  /** 当前演示视角（真实产品里由登录身份决定，而不是前端切换） */
  side: Side
  peer: Side
  me: SideState
  other: SideState
  bothSubmitted: boolean
  bothReadFeedback: boolean
  agreed: boolean
  stage: FlowStage
  setPerspective: (s: Side) => void
  createRoom: (topic: string, relation: string) => string
  /** 演示：按邀请码进入/加入房间，返回房间 id */
  joinRoom: (code: string) => string
  updateDraft: (questionId: string, text: string) => void
  submitStatement: (s: Side) => void
  markFeedbackRead: (s: Side) => void
  /** 演示辅助：模拟对方也完成陈述提交 */
  simulatePeerSubmit: () => void
  setPebble: (s: Side, optionId: string) => void
  setAction: (s: Side, cardId: string) => void
  toggleCourt: (roundIndex: number) => void
  acceptAgreement: () => void
  resetRoom: () => void
}

const RoomContext = createContext<RoomContextValue | null>(null)

export function RoomProvider({ children }: { children: ReactNode }) {
  const [room, setRoom] = useState<RoomState>(
    () => loadRoom('demo') ?? initialRoom('demo', 'CAT-DEMO'),
  )

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + room.roomId, JSON.stringify(room))
    } catch {
      /* 演示环境忽略存储失败 */
    }
  }, [room])

  const patch = useCallback((fn: (prev: RoomState) => RoomState) => {
    setRoom(fn)
  }, [])

  const setPerspective = useCallback(
    (s: Side) => patch((prev) => ({ ...prev, perspective: s })),
    [patch],
  )

  const createRoom = useCallback(
    (topic: string, relation: string) => {
      const roomId = newRoomId()
      patch((prev) => ({ ...prev, ...initialRoom(roomId), topic, relation }))
      return roomId
    },
    [patch],
  )

  const joinRoom = useCallback(
    (code: string) => {
      const norm = code.trim().toLowerCase()
      const idPart = norm.replace(/^cat-/, '')
      const roomId = !idPart || idPart === 'demo' ? 'demo' : `cat-${idPart}`
      patch(() => {
        const base = loadRoom(roomId) ?? initialRoom(roomId)
        return { ...base, B: { ...base.B, joined: true } }
      })
      return roomId
    },
    [patch],
  )

  const updateDraft = useCallback(
    (questionId: string, text: string) =>
      patch((prev) => ({
        ...prev,
        [prev.perspective]: {
          ...prev[prev.perspective],
          draft: { ...prev[prev.perspective].draft, [questionId]: text },
        },
      })),
    [patch],
  )

  const submitStatement = useCallback(
    (s: Side) =>
      patch((prev) => ({
        ...prev,
        [s]: { ...prev[s], submitted: true },
      })),
    [patch],
  )

  const markFeedbackRead = useCallback(
    (s: Side) =>
      patch((prev) => ({
        ...prev,
        [s]: { ...prev[s], feedbackRead: true },
      })),
    [patch],
  )

  const simulatePeerSubmit = useCallback(
    () =>
      patch((prev) => {
        const peerSide: Side = prev.perspective === 'A' ? 'B' : 'A'
        return {
          ...prev,
          [peerSide]: {
            ...prev[peerSide],
            joined: true,
            submitted: true,
            draft: Object.fromEntries(
              Object.entries(prev[peerSide].draft).map(([k, v]) => [k, v || '（模拟对方已完成填写）']),
            ),
          },
        }
      }),
    [patch],
  )

  const setPebble = useCallback(
    (s: Side, optionId: string) =>
      patch((prev) => ({ ...prev, pebble: { ...prev.pebble, [s]: optionId } })),
    [patch],
  )

  const setAction = useCallback(
    (s: Side, cardId: string) =>
      patch((prev) => ({ ...prev, action: { ...prev.action, [s]: cardId } })),
    [patch],
  )

  const toggleCourt = useCallback(
    (roundIndex: number) =>
      patch((prev) => ({
        ...prev,
        court: { ...(prev.court ?? {}), [roundIndex]: !prev.court?.[roundIndex] },
      })),
    [patch],
  )

  const acceptAgreement = useCallback(
    () => patch((prev) => ({ ...prev, agreed: true })),
    [patch],
  )

  const resetRoom = useCallback(
    () => patch(() => initialRoom('demo', 'CAT-DEMO')),
    [patch],
  )

  const value = useMemo<RoomContextValue>(() => {
    const side = room.perspective
    const peer: Side = side === 'A' ? 'B' : 'A'
    const me = room[side]
    const other = room[peer]
    const bothSubmitted = room.A.submitted && room.B.submitted
    const bothReadFeedback = room.A.feedbackRead && room.B.feedbackRead
    let stage: FlowStage
    if (room.agreed) stage = 'agreement'
    else if (!bothSubmitted) stage = me.submitted ? 'waiting' : 'statement'
    else if (!bothReadFeedback) stage = 'feedback'
    else stage = 'analysis'
    return {
      room,
      side,
      peer,
      me,
      other,
      bothSubmitted,
      bothReadFeedback,
      agreed: room.agreed,
      stage,
      setPerspective,
      createRoom,
      joinRoom,
      updateDraft,
      submitStatement,
      markFeedbackRead,
      simulatePeerSubmit,
      setPebble,
      setAction,
      toggleCourt,
      acceptAgreement,
      resetRoom,
    }
  }, [
    room,
    setPerspective,
    createRoom,
    joinRoom,
    updateDraft,
    submitStatement,
    markFeedbackRead,
    simulatePeerSubmit,
    setPebble,
    setAction,
    toggleCourt,
    acceptAgreement,
    resetRoom,
  ])

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>
}

export function useRoom(): RoomContextValue {
  const ctx = useContext(RoomContext)
  if (!ctx) throw new Error('useRoom 必须在 RoomProvider 内使用')
  return ctx
}

/** 流程阶段顺序，用于页面守卫：阶段未到则应重定向 */
const stageOrder: FlowStage[] = ['statement', 'waiting', 'feedback', 'analysis', 'agreement']

export function stageAtLeast(stage: FlowStage, require: FlowStage): boolean {
  return stageOrder.indexOf(stage) >= stageOrder.indexOf(require)
}
