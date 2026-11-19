/* ─────────────── CatJudge 演示用模拟数据 ───────────────
 * 真实版本中这些数据将由 AI 在后端生成并按权限下发；
 * 这里仅为前端高保真原型提供固定内容。
 * ─────────────────────────────────────────────── */

export interface RelationType {
  id: string
  emoji: string
  label: string
}

export const relationTypes: RelationType[] = [
  { id: 'couple', emoji: '💕', label: '情侣' },
  { id: 'friend', emoji: '🤝', label: '朋友' },
  { id: 'roommate', emoji: '🏠', label: '室友' },
  { id: 'family', emoji: '👨‍👩‍👧', label: '家人' },
  { id: 'colleague', emoji: '💼', label: '同事' },
  { id: 'other', emoji: '🐱', label: '其他关系' },
]

/* 阶段 2：独立陈述的 5 个问题 */
export interface StatementQuestion {
  id: 'events' | 'feelings' | 'concern' | 'understand' | 'change'
  emoji: string
  title: string
  hint: string
  placeholder: string
}

export const statementQuestions: StatementQuestion[] = [
  {
    id: 'events',
    emoji: '📖',
    title: '事情经过',
    hint: '尽量只描述你看到的“事实”，先不评价对方。',
    placeholder: '那天发生了什么？按时间顺序说说你的版本……',
  },
  {
    id: 'feelings',
    emoji: '💭',
    title: '你当时的感受',
    hint: '用“我感到……”开头，会比“你总是……”更容易被听进去。',
    placeholder: '那一刻你的心情是什么样的？',
  },
  {
    id: 'concern',
    emoji: '🎯',
    title: '你最在意的问题',
    hint: '如果只能挑一件事说清楚，你想挑哪件？',
    placeholder: '这件事里，真正戳到你的是什么？',
  },
  {
    id: 'understand',
    emoji: '👂',
    title: '你希望对方理解的内容',
    hint: '换成一句话，你最想让 TA 明白什么？',
    placeholder: '我希望 TA 知道……',
  },
  {
    id: 'change',
    emoji: '🌱',
    title: '你希望对方式做出的改变',
    hint: '具体、小步、可执行的改变，比“你必须变一个人”更有效。',
    placeholder: '下次遇到类似情况，你希望 TA 怎么做？',
  },
]

/* 演示房间的基础信息 */
export const demoRoomInfo = {
  topic: '纪念日他迟到了 40 分钟，还怪我没提前订好餐厅',
  relation: '情侣',
  members: {
    A: { name: '橘座', avatar: '🐱' },
    B: { name: '羊咩', avatar: '🐑' },
  },
}

/* 演示用：一键填入的示例陈述内容（仅前端原型便捷操作） */
export const demoStatements: Record<'A' | 'B', Record<string, string>> = {
  A: {
    events:
      '纪念日我提前 40 分钟到餐厅，一个人坐着等。他中途打过两次电话说堵车，但最后一刻才告诉我没订到位子，我只好临时换了靠窗的小桌。他到店时甜点拼盘都上完了，我一句话都说不出来。',
    feelings: '从期待、兴奋，到坐立难安，最后变成委屈和生气。最难堪的是邻桌都端着情侣蛋糕过来时，我以为自己要一个人过完整个晚上。',
    concern: '我在意的不是 40 分钟，而是“重要日子被他排在必做清单的最后一位”。',
    understand: '我希望 TA 知道：我提的不是迟到本身，是我等的时候一直在想“他到底有多在乎我”。',
    change: '希望 TA 以后重要的日子提前订位、提前出发；实在要迟到，先说一句“对不起我在路上了”，而不是先解释责任在谁。',
  },
  B: {
    events:
      '那天我临时被拉去开会，出来已经很晚。我一路狂奔还打了两个电话说明情况，到店时还是晚了很多。我以为提前沟通过就好，结果一见面她的脸色让我瞬间慌了，情急之下说了“谁让你不提前订位”。',
    feelings: '一路都是焦急和自责，到店后又变成委屈：我已经尽全力往回赶了，为什么迎接我的是一场审判。',
    concern: '我在意的是“我做了努力但完全不被看见”，这比被骂还难受。',
    understand: '我希望 TA 知道：我怪自己比谁都狠，那句“谁让你没订位”是慌不择言，不是我的真心话。',
    change: '希望以后吵架时先讨论“这件事我们各自哪里做得不好”，而不是先定罪；也希望重要的日子提前一起确认计划，别让我独自记挂。',
  },
}

/* 阶段 3：AI 私人反馈（A、B 各一份，互不可见） */
export interface FeedbackSection {
  key: string
  emoji: string
  title: string
  paragraphs: string[]
}

export interface PrivateFeedbackReport {
  nickname: string
  avatar: string
  headline: string
  sections: FeedbackSection[]
}

export const privateFeedback: Record<'A' | 'B', PrivateFeedbackReport> = {
  A: {
    nickname: '橘座',
    avatar: '🐱',
    headline: '你很在意这段关系，只是着急时被“指责”抢了先',
    sections: [
      {
        key: 'good',
        emoji: '🌟',
        title: '你做得比较好的地方',
        paragraphs: [
          '你把事情的经过按时间线写得非常清楚，这让 AI 和对方都很容易还原现场，是很高质量的表达习惯。',
          '你没有翻旧账，陈述里只聚焦在这一次的纪念日事件上，这本身就避免了矛盾扩大。',
        ],
      },
      {
        key: 'problem',
        emoji: '🔍',
        title: '你可能存在的问题',
        paragraphs: [
          '在“希望对方改变”一栏里，你写的是“以后绝对不许迟到”，这是一个命令而不是请求。命令会让对方本能地进入防御状态，而不是倾听状态。',
          '你把“他不够爱我”当成了推理结论，但这更像一个待验证的猜想。',
        ],
      },
      {
        key: 'gap',
        emoji: '📡',
        title: '你表达中的沟通误区',
        paragraphs: [
          '你的核心需求是“被重视”，但你的表达落点是“守时规则”。对方听到的是规则，感受不到规则背后那颗想被重视的心——这是这次冲突最可惜的错位。',
        ],
      },
      {
        key: 'behavior',
        emoji: '🛠️',
        title: '可以改善的行为',
        paragraphs: [
          '下次可以先说“我提前两小时到店，一个人坐着的时候挺难过的”，再提诉求。情绪先行，规则后置，对方更容易接住。',
          '给对方解释的机会——你陈述里提到他中途打来过电话，但你当时没有接。',
        ],
      },
      {
        key: 'script',
        emoji: '💬',
        title: '推荐的表达方式',
        paragraphs: [
          '“纪念日那天我一个人在餐厅坐了很久，其实我在意的不是那 40 分钟，而是那一刻我觉得自己没有被放在心上。下次如果可能迟到，我们可以提前一起想个办法吗？”',
        ],
      },
      {
        key: 'care',
        emoji: '🍀',
        title: '一段温柔的鼓励',
        paragraphs: [
          '愿意把委屈说出来而不是冷战，已经是很勇敢的事了。你要的从来不是赢，是被认真对待——这份期待一点都不过分。',
        ],
      },
    ],
  },
  B: {
    nickname: '羊咩',
    avatar: '🐑',
    headline: '你在慌乱中选择了讲道理，但 TA 那一刻需要的是安慰',
    sections: [
      {
        key: 'good',
        emoji: '🌟',
        title: '你做得比较好的地方',
        paragraphs: [
          '你在路上连续打了两个电话说明情况，并没有玩失踪，这一点在你的陈述里被自己轻描淡写了，其实它很重要。',
          '你诚实地写出了自己的窘迫和自责，没有把责任全部推给堵车，这份诚实很难得。',
        ],
      },
      {
        key: 'problem',
        emoji: '🔍',
        title: '你可能存在的问题',
        paragraphs: [
          '见面第一句话是“谁让你不提前订位”，用反击回应了委屈。这可能让你的迟到从“事件”升级成了“冲突”。',
          '你在陈述中多次说“这有什么好生气的”，否定对方的感受，会让对方的委屈越滚越大。',
        ],
      },
      {
        key: 'gap',
        emoji: '📡',
        title: '你表达中的沟通误区',
        paragraphs: [
          '你在解决问题（为什么会迟到、责任在谁），而对方在处理情绪（被冷落在餐厅的 40 分钟）。频道不同，说得越多偏得越远。',
        ],
      },
      {
        key: 'behavior',
        emoji: '🛠️',
        title: '可以改善的行为',
        paragraphs: [
          '先道歉情绪、后讨论事实：见面先给一个拥抱或一句“让你等久了，对不起”，订位流程这类问题留到第二天再复盘。',
          '重要的日子提前设提醒，这不是形式感，是你把 TA 放进日程里的证据。',
        ],
      },
      {
        key: 'script',
        emoji: '💬',
        title: '推荐的表达方式',
        paragraphs: [
          '“今天让你一个人等了那么久，我知道你肯定又失望又担心，对不起。我当时太慌了才会说那句怪你的话，其实我最怪的是我自己。”',
        ],
      },
      {
        key: 'care',
        emoji: '🍀',
        title: '一段温柔的鼓励',
        paragraphs: [
          '会慌张，说明在意。你不是不在乎纪念日，你只是还没学会在搞砸之后先接住对方的情绪。慢慢来，你已经愿意来这一刻了。',
        ],
      },
    ],
  },
}

/* 阶段 4：共同观点转述（双方均可见） */
export interface Perspective {
  side: 'A' | 'B'
  name: string
  avatar: string
  coreView: string
  realNeed: string
  disclaimer: string
}

export const sharedAnalysis = {
  perspectives: [
    {
      side: 'A',
      name: '橘座',
      avatar: '🐱',
      coreView:
        '提前到店独自等待的 40 分钟让 TA 感到被忽视；纪念日对 TA 而言是“你有多重视这段关系”的具体证明。',
      realNeed:
        '被重视、被放在心上。（AI 推测：TA 真正在意的可能不是那 40 分钟本身，而是等待时“我是不是不重要”的恐惧。）',
      disclaimer: '以下内容由 AI 基于 A 的独立陈述转述，未经 A 逐字授权公开；推测部分不代表事实。',
    },
    {
      side: 'B',
      name: '羊咩',
      avatar: '🐑',
      coreView:
        '堵车 + 找不到车位属于不可控，中途已多次电话说明；见面后持续的指责让 TA 觉得自己已经被审判，于是本能地反击回去。',
      realNeed:
        '被信任、被谅解。（AI 推测：TA 反复强调客观原因，可能是在掩饰“我把重要日子搞砸了”的强烈自责。）',
      disclaimer: '以下内容由 AI 基于 B 的独立陈述转述，未经 B 逐字授权公开；推测部分不代表事实。',
    },
  ] as Perspective[],
  misunderstandings: [
    'A 把“迟到”解读为“不够爱”，但 B 的行为记录（连续回电、一路赶路）显示 TA 其实很着急。',
    'B 把 A 的委屈解读为“兴师问罪”，但 A 真正想要的第一回应是一句“对不起让你等久了”，而不是责任划分。',
    '双方都在证明“我才是更有道理的一方”，却没有一个人先说出“我难过的其实是……”。',
  ],
  coreConflict: {
    surface: '纪念日迟到 40 分钟，以及“没提前订位该怪谁”。',
    deep: '这是一场“情绪需求”与“事实逻辑”的错位冲突：A 需要先被安慰，B 需要先被相信；双方却都在向对方索要自己没有给出的东西。',
    note: 'AI 提醒：这不是谁对谁错的问题，也不代表双方责任五五开——重点在于你们的诉求从未真正抵达对方。',
  },
  sharedHopes: [
    '都希望这段纪念日回忆是美好的，而不是一场争吵。',
    '都不希望下次因为同样的事再受伤。',
    'B 在陈述末尾写了“其实那天我偷偷带了补送的礼物”；A 写了“我其实消气了，只是等一句道歉”——你们都在等对方先开口。',
  ],
}

/* 阶段 5：互动模块 */
export const courtSession = {
  intro: '法槌轻敲，本次“猫咪开庭”不判决对错，只帮助双方把话听明白。请轮流、平静地回答主持猫的问题。',
  rounds: [
    {
      forSide: 'A' as const,
      question: '请用一句话说出：对方陈述里，最让你意外的一点是什么？',
      tip: '提示：只复述对方的观点，不评价真假。',
    },
    {
      forSide: 'B' as const,
      question: '请用一句话说出：对方在这件事里，可能最难熬的瞬间是什么？',
      tip: '提示：尝试站在 TA 的视角，而不是解释自己。',
    },
    {
      forSide: 'A' as const,
      question: '如果可以给对方一个“下次通行证”，你会放行 TA 的哪个小毛病？',
      tip: '提示：幽默一点，关系会松一口气。',
    },
    {
      forSide: 'B' as const,
      question: '听完刚才的转述，你还坚持自己最初的哪个看法？哪个看法动摇了？',
      tip: '提示：诚实比体面更重要。',
    },
  ],
}

export interface PebbleOption {
  id: string
  emoji: string
  label: string
}

/* 扔石子：双方各自选出“我最在意的问题” */
export const pebbleOptions: PebbleOption[] = [
  { id: 'wait', emoji: '⏳', label: '重要的日子被拖延' },
  { id: 'blame', emoji: '🫵', label: '出问题先互相指责' },
  { id: 'feel', emoji: '💔', label: '感受被说成“小题大做”' },
  { id: 'promise', emoji: '📜', label: '承诺没有兑现' },
  { id: 'phone', emoji: '📱', label: '沟通时各自看手机' },
  { id: 'cold', emoji: '🧊', label: '冷战与不回应' },
]

export interface ActionCard {
  id: string
  emoji: string
  title: string
  desc: string
  owner: 'A' | 'B' | 'both'
}

/* 和解行动卡：双方各选一张愿意尝试的改善行动 */
export const actionCards: ActionCard[] = [
  { id: 'alert', emoji: '⏰', title: '重要日程双人提醒', desc: '纪念日、生日提前 7 天各设一次提醒，谁也不许裸奔上阵。', owner: 'both' },
  { id: 'hug', emoji: '🫂', title: '先拥抱再讲理', desc: '任何一方情绪上头时，先完成一个 10 秒拥抱，再开始讨论事实。', owner: 'B' },
  { id: 'sentence', emoji: '🗣️', title: '每天一句“我注意到”', desc: '每天说一件注意到对方为自己做的小事，让感谢不再过期。', owner: 'both' },
  { id: 'cool', emoji: '🧊', title: '冷静 10 分钟暗号', desc: '想发火时说“我需要冷静 10 分钟”，到点后必须回来继续谈。', owner: 'A' },
  { id: 'backup', emoji: '🎐', title: 'Plan B 基金', desc: '为“搞砸的重要日子”设立补偿机制：两周内补过一次，不算翻篇算加分。', owner: 'B' },
  { id: 'call', emoji: '📞', title: '可能迟到先报备', desc: '预感到会迟到，第一时间打电话说明预计时间，而不是等到最后一刻。', owner: 'both' },
]
