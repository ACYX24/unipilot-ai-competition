export type PartySide = "A" | "B"

export interface MockParticipant {
  side: PartySide
  name: string
  tone: "orange" | "blue"
  roleLabel: string
}

export interface MockRoom {
  inviteCode: string
  topic: string
  disputeType: string
  participants: MockParticipant[]
}

export function getMockRoom(inviteCode: string): MockRoom {
  return {
    inviteCode: inviteCode.toUpperCase(),
    topic: "周末到底该去爬山还是宅家看剧？",
    disputeType: "其他小事",
    participants: [
      { side: "A", name: "橘座", tone: "orange", roleLabel: "用户 A" },
      { side: "B", name: "奶盖", tone: "blue", roleLabel: "用户 B" },
    ],
  }
}

export interface MockReport {
  topic: string
  generatedAt: string
  overallComment: string
  summaries: { side: PartySide; name: string; tone: "orange" | "blue"; text: string }[]
  emotions: {
    side: PartySide
    name: string
    tone: "orange" | "blue"
    tags: string[]
    needs: string[]
  }[]
  misunderstandings: { title: string; detail: string }[]
  commonNeeds: string[]
  suggestions: { title: string; detail: string }[]
  funTasks: { title: string; detail: string }[]
}

export const mockReport: MockReport = {
  topic: "周末到底该去爬山还是宅家看剧？",
  generatedAt: "2026-11-19 20:30",
  overallComment:
    "这不是一场「爬山 vs 看剧」的对决，而是两种充电方式的碰撞。你们都在为「怎样过一个好周末」努力，只是忽略了对方也需要被照顾。",
  summaries: [
    {
      side: "A",
      name: "橘座",
      tone: "orange",
      text: "平时工作久坐、压力大，希望周末能出门透气、活动身体，觉得爬山是两个人一起制造回忆的好机会，被拒绝时会感到失落。",
    },
    {
      side: "B",
      name: "奶盖",
      tone: "blue",
      text: "连续加班一周后身心俱疲，周末只想在家彻底放松，看剧是成本最低的恢复方式，担心爬山会让自己更累，希望被理解而不是被说成「扫兴」。",
    },
  ],
  emotions: [
    {
      side: "A",
      name: "橘座",
      tone: "orange",
      tags: ["期待", "失落", "一点点委屈"],
      needs: ["一起户外活动的陪伴感", "自己的提议被认真对待", "对生活热情的回应"],
    },
    {
      side: "B",
      name: "奶盖",
      tone: "blue",
      tags: ["疲惫", "内疚", "想被理解"],
      needs: ["充分的休息与恢复", "拒绝时不被指责的安全感", "安静相处的亲密感"],
    },
  ],
  misunderstandings: [
    {
      title: "把「拒绝活动」听成「拒绝我」",
      detail:
        "橘座把奶盖不想爬山理解成「不想和我在一起」，但奶盖拒绝的是「体力消耗」，不是橘座本人。活动和人，要分开看。",
    },
    {
      title: "用「你总是……」开启对话",
      detail:
        "「你每次都宅在家」「你就知道折腾」这类全称判断会让对方立刻进入防御状态，讨论从「周末安排」滑向「互相翻旧账」。",
    },
    {
      title: "只提方案，不说原因",
      detail:
        "双方都在坚持各自的方案，却没有先说清楚「我为什么需要它」。当疲惫和期待没有被说出口，方案之争就很难有解。",
    },
  ],
  commonNeeds: [
    "周末能真正放松、恢复能量",
    "有高质量的两人相处时间",
    "自己的感受被对方重视",
  ],
  suggestions: [
    {
      title: "先说感受，再谈方案",
      detail:
        "用「我这周……所以我想……」开头，例如「我这周加班很累，所以想在家休息」，而不是直接否定对方的提议。",
    },
    {
      title: "把二选一改成「都要」",
      detail:
        "试试「上午宅家看剧 + 傍晚附近公园散步」或「这周宅家、下周爬山」的组合方案，让两种需求都被排进日程。",
    },
    {
      title: "建立一个周末小惯例",
      detail:
        "每周五花 5 分钟聊聊彼此的疲惫程度和期待，再一起决定周末安排，避免临时提议、临时拒绝带来的失落。",
    },
  ],
  funTasks: [
    {
      title: "互相夸夸三分钟",
      detail: "轮流说出对方这周做得好的 3 件小事，不许反驳、不许谦虚，只能接受。",
    },
    {
      title: "一起云吸猫 10 分钟",
      detail: "各自找 3 张最可爱的猫咪图片分享给对方，比比谁找的更治愈。",
    },
    {
      title: "无手机散步 30 分钟",
      detail: "这周挑一个傍晚，不带手机出门走走，只聊「和周末安排无关」的话题。",
    },
  ],
}
