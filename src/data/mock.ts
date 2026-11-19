export interface DisputeType {
  id: string
  emoji: string
  label: string
}

export const disputeTypes: DisputeType[] = [
  { id: 'chore', emoji: '🧹', label: '家务分工' },
  { id: 'food', emoji: '🍜', label: '今天吃什么' },
  { id: 'money', emoji: '💰', label: '消费观念' },
  { id: 'time', emoji: '⏰', label: '时间观念' },
  { id: 'chat', emoji: '💬', label: '聊天态度' },
  { id: 'other', emoji: '🐱', label: '其他小事' },
]

export interface RoomMessage {
  id: number
  side: 'A' | 'B' | 'judge'
  author: string
  text: string
  time: string
}

export const mockRoom = {
  roomId: 'demo-room',
  topic: '周末到底该去爬山还是宅家看剧？',
  type: '其他小事',
  status: '陈述进行中',
  members: [
    { side: 'A' as const, name: '橘座', avatar: '🐱', joined: true, ready: true },
    { side: 'B' as const, name: '羊咩', avatar: '🐑', joined: true, ready: false },
  ],
  messages: [
    {
      id: 1,
      side: 'judge',
      author: '判判猫',
      text: '欢迎来到判判小屋～请双方轮流陈述自己的观点，我会认真听每一句话，最后给出温柔的判决。每人每轮限时 2 分钟哦。',
      time: '20:01',
    },
    {
      id: 2,
      side: 'A',
      author: '橘座',
      text: '我们好久没有一起出门了！爬山可以锻炼身体，还能看风景，总比各自抱着手机强吧？',
      time: '20:03',
    },
    {
      id: 3,
      side: 'B',
      author: '羊咩',
      text: '可是这周加班好累，我只想在家躺着追完那部剧……爬山要早起，我真的起不来。',
      time: '20:05',
    },
    {
      id: 4,
      side: 'A',
      author: '橘座',
      text: '那我们可以选个近一点的山，中午再出发？或者爬山完晚上一起看剧，这样两边都满足了。',
      time: '20:07',
    },
  ] as RoomMessage[],
  round: 2,
  maxRounds: 3,
}

export const mockVerdict = {
  roomId: 'demo-room',
  topic: '周末到底该去爬山还是宅家看剧？',
  title: '双赢判决 · 各让一步',
  summary:
    '这场小争执里没有输家。A 想要的是「共同相处的新鲜感」，B 需要的是「疲惫后的休息权」——两个需求都正当，只是表达方式撞了车。',
  scores: [
    { side: 'A', name: '橘座', avatar: '🐱', score: 78, tags: ['主动提方案', '表达清晰', '略微强势'] },
    { side: 'B', name: '羊咩', avatar: '🐑', score: 74, tags: ['诚实表达需求', '愿意倾听', '回避冲突'] },
  ],
  suggestions: [
    '本周六睡到自然醒，下午去家附近的公园散步 1 小时，替代远途爬山。',
    '散步回来的晚上一起窝在沙发追剧 2 集，A 负责准备零食，B 负责选剧。',
    '把「大运动量爬山」留到下周精神好的时候，提前 3 天一起约定时间。',
  ],
  sweetTalk: '判判猫悄悄说：你们在争吵里都在替对方着想，这已经是满分默契啦 💛',
  moodBreakdown: [
    { label: '理性沟通', value: 82 },
    { label: '情绪温度', value: 65 },
    { label: '解决意愿', value: 90 },
  ],
}
