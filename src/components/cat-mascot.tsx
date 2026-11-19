import { cn } from "cn"

type CatMascotProps = {
  variant?: "hero" | "judge"
  className?: string
}

export function CatMascot({ variant = "hero", className }: CatMascotProps) {
  const fur = variant === "judge" ? "#C9BFE6" : "#FBC58D"
  const furDark = variant === "judge" ? "#A795D1" : "#EFA35C"
  const belly = variant === "judge" ? "#EFEAFB" : "#FFF3E4"

  return (
    <svg
      viewBox="0 0 240 240"
      role="img"
      aria-label={variant === "judge" ? "猫咪法官" : "猫咪调解员"}
      className={cn("h-auto w-full", className)}
    >
      {/* 尾巴 */}
      <path
        d="M178 196c26 4 38-10 30-24"
        fill="none"
        stroke={fur}
        strokeWidth="16"
        strokeLinecap="round"
      />
      {/* 身体 */}
      <ellipse cx="120" cy="182" rx="62" ry="46" fill={fur} />
      <ellipse cx="120" cy="190" rx="36" ry="30" fill={belly} />
      {/* 耳朵 */}
      <path d="M66 76 56 26c-1-6 5-9 10-5l38 30Z" fill={fur} />
      <path d="M174 76 184 26c1-6-5-9-10-5l-38 30Z" fill={fur} />
      <path d="M70 66 63 38l24 22Z" fill="#F6A8B8" />
      <path d="M170 66 177 38l-24 22Z" fill="#F6A8B8" />
      {/* 脸 */}
      <circle cx="120" cy="104" r="62" fill={fur} />
      {/* 头顶花纹 */}
      <path
        d="M108 44v14M120 42v16M132 44v14"
        stroke={furDark}
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* 眼睛 */}
      {variant === "judge" ? (
        <>
          <circle cx="94" cy="102" r="17" fill="#fff" stroke="#6B5B7A" strokeWidth="4" />
          <circle cx="146" cy="102" r="17" fill="#fff" stroke="#6B5B7A" strokeWidth="4" />
          <path d="M111 102h18" stroke="#6B5B7A" strokeWidth="4" />
          <circle cx="94" cy="104" r="4.5" fill="#463640" />
          <circle cx="146" cy="104" r="4.5" fill="#463640" />
        </>
      ) : (
        <>
          <path
            d="M82 104q10-12 22 0M136 104q10-12 22 0"
            fill="none"
            stroke="#463640"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </>
      )}
      {/* 腮红 */}
      <ellipse cx="76" cy="122" rx="10" ry="6" fill="#F6A8B8" opacity="0.8" />
      <ellipse cx="164" cy="122" rx="10" ry="6" fill="#F6A8B8" opacity="0.8" />
      {/* 鼻子和嘴 */}
      <path d="M114 118h12l-6 8Z" fill="#E87B9C" />
      <path
        d="M120 126v6m0 0q-8 10-16 2m16-2q8 10 16 2"
        fill="none"
        stroke="#463640"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* 胡须 */}
      <path
        d="M40 108h22M42 124l20-4M200 108h-22M198 124l-20-4"
        stroke={furDark}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* 爪子 */}
      <ellipse cx="96" cy="222" rx="16" ry="9" fill={belly} />
      <ellipse cx="144" cy="222" rx="16" ry="9" fill={belly} />
      {variant === "judge" ? (
        /* 小木槌 */
        <g transform="rotate(-24 196 168)">
          <rect x="188" y="150" width="10" height="44" rx="5" fill="#B08968" />
          <rect x="172" y="132" width="42" height="24" rx="9" fill="#8C6239" />
        </g>
      ) : (
        /* 爱心 */
        <path
          d="M186 60c-6-10-22-8-24 4-2-12-18-14-24-4-7 12 8 26 24 34 16-8 31-22 24-34Z"
          fill="#F6A8B8"
        />
      )}
    </svg>
  )
}

type CatAvatarProps = {
  tone?: "orange" | "blue"
  className?: string
}

export function CatAvatar({ tone = "orange", className }: CatAvatarProps) {
  const fur = tone === "blue" ? "#AFCBE8" : "#FBC58D"
  const furDark = tone === "blue" ? "#7FA6CF" : "#EFA35C"

  return (
    <svg
      viewBox="0 0 80 80"
      role="img"
      aria-label={tone === "blue" ? "蓝猫头像" : "橘猫头像"}
      className={cn("h-auto w-full", className)}
    >
      <path d="M16 34 12 10c0-4 4-6 7-3l17 13Z" fill={fur} />
      <path d="M64 34 68 10c0-4-4-6-7-3L44 20Z" fill={fur} />
      <path d="M19 28 17 15l11 10Z" fill="#F6A8B8" />
      <path d="M61 28 63 15 52 25Z" fill="#F6A8B8" />
      <circle cx="40" cy="44" r="28" fill={fur} />
      <path
        d="M33 17v7M40 16v8M47 17v7"
        stroke={furDark}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="30" cy="43" r="3" fill="#463640" />
      <circle cx="50" cy="43" r="3" fill="#463640" />
      <ellipse cx="22" cy="52" rx="5" ry="3" fill="#F6A8B8" opacity="0.8" />
      <ellipse cx="58" cy="52" rx="5" ry="3" fill="#F6A8B8" opacity="0.8" />
      <path d="M36 51h8l-4 5Z" fill="#E87B9C" />
      <path
        d="M40 56v3m0 0q-5 5-9 1m9-1q5 5 9 1"
        fill="none"
        stroke="#463640"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
