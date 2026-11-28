import { useId } from "react"
import type { RoomSeat } from "@/lib/room-types"

export type OfficeAction = "preview" | "listening" | "organizing" | "sharing"

const previewSeats: RoomSeat[] = [
  { side: "A", name: "", submitted: false, isMe: false },
  { side: "B", name: "", submitted: false, isMe: false },
]

function TeacherHead({ fur }: { fur: string }) {
  return (
    <g stroke="#614331" strokeWidth="2.15" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 69C16 53 15 31 20 14c16 3 29 13 41 25 17-5 35-3 50 3 8-10 20-18 32-20 4 13 3 29-1 44 8 8 11 16 12 27 11 6 17 13 16 22-1 18-25 30-54 31-35 3-65-5-82-22-12-12-16-36-11-55Z" fill={fur} />
      <path d="M27 26c10 4 19 10 26 18l-19 12c-4-9-7-19-7-30Zm92 22 18-14c1 9 0 18-2 25Z" fill="#dea795" stroke="none" />
      <path d="M34 103c13-14 32-14 53-8 13 4 22 10 33 7 15-6 36-4 48 10-1 15-17 27-46 31-32 4-65-3-80-17-6-6-8-14-8-23Z" fill="#edd4a9" stroke="none" />
      <path d="M69 40q9 8 12 20m8-19q8 8 10 16m8-10q6 4 8 11M25 75l15 9m-12 2 11 7m106-18-8 5" stroke="#a25734" strokeWidth="3.8" opacity=".72" fill="none" />
      <path d="M64 82q10-7 23-1m40 4q8-3 14 1" stroke="#734831" fill="none" />
      <path d="M28 87l29 5m44 9q6-5 15-1m34-4 7-4" stroke="#624632" strokeWidth="3" fill="none" />
      <ellipse cx="80" cy="100" rx="22" ry="18.5" transform="rotate(8 80 100)" fill="#fff4d9" fillOpacity=".14" strokeWidth="3" />
      <ellipse cx="135" cy="103" rx="17" ry="16" transform="rotate(8 135 103)" fill="#fff4d9" fillOpacity=".1" strokeWidth="2.8" />
      <path d="M66 94q2-5 7-6m51 8q2-3 5-4" fill="none" stroke="#fff3d6" strokeWidth="1.5" opacity=".62" />
      <ellipse cx="88" cy="100" rx="3.35" ry="4.35" fill="#493329" stroke="none" />
      <ellipse cx="142" cy="103" rx="2.9" ry="4" fill="#493329" stroke="none" />
      <path d="M133 118q8-4 14 0l-7 5Z" fill="#9e604e" stroke="none" />
      <path d="M140 124q-2 7-10 7m10-7q3 5 9 3M48 109l20 6m-21 0 18 7m87-9 14 2" fill="none" strokeWidth="1.35" />
    </g>
  )
}

export function TeacherPortrait() {
  return (
    <svg className="teacher-portrait" viewBox="0 0 180 180" aria-hidden="true">
      <circle cx="90" cy="90" r="90" fill="#e9e3cf" />
      <path d="M5 180q4-39 37-54h91q31 16 42 54Z" fill="#617763" />
      <g transform="translate(2 2)"><TeacherHead fur="#c9824a" /></g>
    </svg>
  )
}

function Teacher({ fur }: { fur: string }) {
  return (
    <g data-office-role="teacher">
      <path d="M174 326q-22-14-17-58l7-53q3-22 26-24l67-3q23 2 29 25l19 86-55 23Z" fill="#557164" stroke="#433d33" strokeWidth="2" />
      <path d="M175 239l-4 53q0 21 16 26m9-118 49-3q22-1 30 17" stroke="#b6bda1" opacity=".53" strokeWidth="2" fill="none" />
      <path d="M205 254q14-18 47-20 48 3 71 35l12 61-132 17-13-43q-7-26 15-50Z" fill="#4a6250" stroke="#53483a" strokeWidth="2.3" />
      <path d="M206 262q-12 22-3 56l29 6 8-66Z" fill="#6a8062" />
      <path d="M234 241l34 39 14-45 13 12-14 65-41-11-19-52Z" fill="#e9d7af" />
      <path d="M233 242l35 38-24-11-8 6-14-24m60-16-14 45 16-16 10 4 3-19" fill="#829477" stroke="#4c644e" strokeWidth="1.45" />
      <path d="M210 301l21-18m55 33 8-21" stroke="#314d40" strokeWidth="2" strokeLinecap="round" opacity=".65" />
      <g transform="translate(181 106)">
        <g className="office-teacher-head"><TeacherHead fur={fur} /></g>
      </g>
    </g>
  )
}

function HesitantVisitor({ fur }: { fur: string }) {
  return (
    <g stroke="#684e3a" strokeWidth="2.05" strokeLinecap="round" strokeLinejoin="round">
      <path d="M87 157q30 16 36 37 4 17-9 22-15 6-18-4 0-5 10-8 10-5-7-19l-22-15Z" fill="#b88355" />
      <path d="M112 193l-8 4m11 3-8 5" stroke="#8c5b3b" fill="none" />
      <path d="M60 161l-28 22-9 33 12 6 24-32 32-9-11-19Zm25 8-12 26-2 27 15 3 13-38 8-18Z" fill="#637765" />
      <path d="M23 213q-14 5-14 13 6 7 29 3l5-12Zm48 6q-14 4-17 11 3 7 31 4l7-11Z" fill="#ddd0b0" />
      <path d="M56 95q-11 15-16 51-4 14 13 26 25 16 52-1 11-17 6-40-5-21-23-37Z" fill="#7c8b69" />
      <path d="M49 145q-6 11 4 25 21 15 50 3 4-6 5-14-28 12-59-14Z" fill="#536c55" stroke="none" />
      <path d="M61 132q-13 3-23 17-7 8-1 12 8 5 15-3l24-14m25-20q4 14-7 32-10 9-21 5-7-6 2-11l10-16" fill="#aeb28b" />
      <path d="M37 151q-6 8 1 13 12 1 18-9l-8-9Zm47-3q-10 1-12 8 0 7 13 5l6-8Z" fill="#d0ad7c" />
      <path d="M37 100q27 11 56-6l12 12q-9 12-23 14l-10 13-9-12q-20-5-28-14Z" fill="#405d48" />
      <g className="office-visitor-head">
        <path d="M31 99C8 92 3 77 7 60l8-14c-2-11 0-24 5-32 12 4 23 10 32 20 13-4 27-4 38 0 9-10 18-14 29-16 3 12 1 25-4 36 8 13 8 25 2 37-8 14-35 26-62 23-13-1-20-6-24-15Z" fill={fur} />
        <path d="M22 25q13 5 21 13l-17 9Zm78 14 13-9q0 10-4 19Z" fill="#e4aa8d" stroke="none" />
        <path d="M8 75q10-12 24-9c11 1 16 10 29 11 26-11 46-7 54 3-6 21-34 32-59 30C29 108 12 94 8 75Z" fill="#e6cda0" stroke="none" />
        <path d="M60 37l6 14m8-15 7 13m7-10 7 9m18 11-13 4m16 2-13 5" fill="none" stroke="#9b613c" strokeWidth="3.4" />
        <path className="office-tense" d="M20 58l8-3m25 4 10-5m-26 40q7-4 14 0" fill="none" strokeWidth="1.6" />
        <path className="office-at-ease" d="M20 56q4-3 8-2m25 2q6-4 11-3m-26 40q8 4 14-3" fill="none" strokeWidth="1.6" />
        <ellipse cx="22" cy="66" rx="2.7" ry="3.5" fill="#4f382c" stroke="none" />
        <ellipse cx="55" cy="68" rx="3.1" ry="3.8" fill="#4f382c" stroke="none" />
        <path d="M25 78q6-3 11 1l-7 5Z" fill="#a16e55" stroke="none" />
        <path d="M11 81l8 2m43-1 19-3m-16 9 17-4" fill="none" strokeWidth="1.15" />
      </g>
    </g>
  )
}

function ExplainingVisitor({ wool }: { wool: string }) {
  return (
    <g stroke="#6d5747" strokeWidth="2.1" strokeLinejoin="round" strokeLinecap="round">
      <path d="M41 155q-24 13-28 38l-10 18 15 8 18-27 29-14Zm44 10-13 25-6 29 15 1 16-26 11-19Z" fill="#b39d80" />
      <path d="M6 207q-17 4-16 13 4 8 27 7 5-2 7-12Zm62 9q-14 3-15 10 4 6 26 6 6-2 6-11Z" fill="#6c5344" />
      <path d="M51 101q22-13 47 1 25 16 28 40 6 25-10 36-25 14-57-1-30-13-28-39 0-21 20-37Z" fill={wool} />
      <path d="M33 150q10-5 17 6 8 11 28 14 20 7 44-1-15 27-56 13-24-8-33-32Z" fill="#cdba94" stroke="none" />
      <path className="office-explaining-paw" d="M51 119q-5 20-33 15l-20-9q-10-1-11 6 7 13 33 20 18 4 37-9" fill="#e1cba6" />
      <path d="M101 123q12 28-17 51-10 3-13-3-4-7 5-13 12-10 10-22" fill="#ece0bf" />
      <path d="M37 98q34 18 65 2l9 13q-11 10-23 12l11 26-13 6-12-29q-26-3-42-14Z" fill="#617d8e" />
      <path d="M82 130l10 22m-3-25 9 19" stroke="#92a7ae" strokeWidth="1.9" fill="none" />
      <g className="office-visitor-head">
        <path d="M32 62Q11 59 1 87q8 9 32-1m67-22q33 0 41 21-6 12-34 3" fill="#cda57e" />
        <path d="M26 54q12-22 47-21 38 0 45 33 6 34-25 48-29 12-57-5C17 98 11 76 26 54Z" fill="#dbb58c" />
        <path d="M16 64q-8-4-8-14 1-12 12-16-4-16 14-21Q48-2 65 7q16-10 31 1 17-2 24 14 19 5 20 22 9 8 4 20-5 10-16 9-10-1-15-12-14 5-24-6-13 8-26-2-15 11-28-1-5 14-19 12Z" fill={wool} />
        <path d="M22 50q-1-7 8-11m10-13q5-7 16-4m21-6q10-3 17 5m18 7q12 2 15 12m-80 6q7-4 15 0m44 5q7-3 11 2" fill="none" stroke="#bca882" strokeWidth="1.45" />
        <path d="M30 68q3-4 9-4m24 5q6-5 14-2" fill="none" strokeWidth="1.5" />
        <ellipse cx="34" cy="75" rx="2.9" ry="3.9" fill="#503b2f" stroke="none" />
        <ellipse cx="65" cy="76" rx="3.1" ry="4.1" fill="#503b2f" stroke="none" />
        <path d="M39 87q7-3 13 1l-7 5Z" fill="#9c6653" stroke="none" />
        <path className="office-tense" d="M43 97q9-4 15 3-5 7-13 2Z" fill="#765244" strokeWidth="1.4" />
        <path className="office-at-ease" d="M43 97q7 6 15 1" fill="none" strokeWidth="1.7" />
        <path d="M27 89l5 2m46 2 8-1" stroke="#b77d66" strokeWidth="2.8" />
      </g>
    </g>
  )
}

export function TeacherOffice({ seats = previewSeats, action = "preview" }: {
  seats?: readonly RoomSeat[]
  action?: OfficeAction
}) {
  const id = useId()
  const paint = (name: string) => `url(#${id}-${name})`
  const organizing = action === "organizing"
  const sharing = action === "sharing"

  return (
    <svg className="teacher-office" data-office-action={action} viewBox="0 0 900 470" aria-hidden="true" strokeLinejoin="round">
      <defs>
        <linearGradient id={`${id}-wall`} x2="1" y2=".8" gradientUnits="objectBoundingBox"><stop stopColor="#faf0d9" /><stop offset="1" stopColor="#d7ddc6" /></linearGradient>
        <linearGradient id={`${id}-floor`} x2="0" y2="1"><stop stopColor="#d2b99a" /><stop offset="1" stopColor="#eedab9" /></linearGradient>
        <linearGradient id={`${id}-walnut`} x2=".9" y2="1"><stop stopColor="#a4764f" /><stop offset=".58" stopColor="#815639" /><stop offset="1" stopColor="#5f4533" /></linearGradient>
        <linearGradient id={`${id}-desk`} x2="1" y2=".66"><stop stopColor="#ddaf79" /><stop offset="1" stopColor="#a8764f" /></linearGradient>
        <linearGradient id={`${id}-rug`} x2="1" y2=".73"><stop stopColor="#b8bd99" /><stop offset="1" stopColor="#8d9b7d" /></linearGradient>
        <linearGradient id={`${id}-seat`} x2=".85" y2="1"><stop stopColor="#a2b497" /><stop offset="1" stopColor="#647e6b" /></linearGradient>
        <linearGradient id={`${id}-sky`} x2=".2" y2="1"><stop stopColor="#bed1bc" /><stop offset="1" stopColor="#f0e2b4" /></linearGradient>
        <linearGradient id={`${id}-fur`} x2=".84" y2=".9"><stop stopColor="#e3ab70" /><stop offset=".7" stopColor="#c9844a" /><stop offset="1" stopColor="#ab633e" /></linearGradient>
        <linearGradient id={`${id}-wool`} x2=".8" y2="1"><stop stopColor="#fff0d0" /><stop offset="1" stopColor="#dec8a1" /></linearGradient>
        <linearGradient id={`${id}-light`} x2="1" y2="1"><stop stopColor="#fff2cc" stopOpacity=".76" /><stop offset="1" stopColor="#fff2cc" stopOpacity="0" /></linearGradient>
        <radialGradient id={`${id}-shadow`}><stop stopColor="#4e3d2f" stopOpacity=".39" /><stop offset="1" stopColor="#4e3d2f" stopOpacity="0" /></radialGradient>
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".66" numOctaves="3" seed="8" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      {/* Side wall, window and light across the conversation area. */}
      <path d="M0 0h900v470H0Z" fill={paint("wall")} />
      <path d="M0 0h81v282L0 330Z" fill="#cfc5aa" opacity=".56" />
      <path d="M0 326l81-49h819v193H0Z" fill={paint("floor")} />
      <path d="M0 324l81-50h819v7H81L0 333Z" fill="#9d866b" opacity=".68" />
      <path d="M0 397l180-116M188 470l142-189m89 189 69-189m159 189-13-189m203 189-65-189M0 442h900M46 386h854M57 333h843" fill="none" stroke="#a58d72" strokeWidth="1.2" opacity=".44" />

      <path d="M91 31h208v198H91Z" fill="#c4b598" />
      <path d="M98 37h190v181H98Z" fill={paint("sky")} />
      <path d="M99 190q40-54 84-16 30-29 60-5 24-25 45-18v67H99Z" fill="#a5ad81" />
      <path d="M100 176q21-46 40-34 14 12 22 44m70-14q27-43 55-28" stroke="#779064" strokeWidth="6" opacity=".24" fill="none" />
      <path d="M151 37h23l-47 181h-22Zm75 0h10l-47 181h-12Z" fill="#fff4d5" opacity=".53" />
      <path d="M186 37v181m-88-89h190" fill="none" stroke="#a49778" strokeWidth="6" />
      <path d="M89 219h213v10H89Z" fill="#b49f7e" />
      <path d="M93 27h210v8H93Z" fill="#ab9272" />
      <path d="M113 31q-5 72 8 117l-13 70-23 1q10-130-1-188Z" fill="#e7dbc0" />
      <path d="M96 40q11 62 6 116l-9 61m20-75-11 8" stroke="#bfae8f" opacity=".7" strokeWidth="1.6" fill="none" />
      <path d="M125 230l64 1 287 239H116L73 311Z" fill={paint("light")} opacity=".6" />

      <path d="M375 45h300v139H375Z" fill="#c4b297" opacity=".5" transform="translate(4 5)" />
      <path d="M375 45h300v139H375Z" fill="#986d4e" />
      <path d="M381 51h288v127H381Z" fill="#c6a376" />
      <path d="M385 55h280v119H385Z" fill="none" stroke="#dfc39a" strokeWidth="1.5" />
      <path d="M412 92h229" stroke="#9e7f60" strokeWidth="1.15" opacity=".7" />
      <text x="413" y="80" fill="#543c2e" fontSize="17" fontFamily="var(--font-display)" fontWeight="700">谈话记录</text>
      <path d="M565 121l67-4 2 42-67 4Z" fill="#e8d8af" opacity={sharing ? 0 : 1} />
      <path d="M576 133l29-2m-29 9 44-2m-44 10 26-1" fill="none" stroke="#ac946f" opacity={sharing ? 0 : .8} />

      {(organizing || sharing) && (
        <>
          <g transform="translate(432 110) rotate(-4)">
            <g className="office-board-card" data-side="A">
              <path d="M2 3h53v44H2Z" fill="#82694c" opacity=".26" />
              <path d="M0 0h53v44H0Z" fill="#f2e3bb" />
              <circle cx="26" cy="4" r="2.8" fill="#ae7047" />
              <path d="M7 16h36m-36 7h29m-29 7h31" stroke="#ab8866" strokeWidth="1.2" />
            </g>
          </g>
          <g transform="translate(504 109) rotate(4)">
            <g className="office-board-card" data-side="B">
              <path d="M2 3h53v44H2Z" fill="#82694c" opacity=".26" />
              <path d="M0 0h53v44H0Z" fill="#dce4d7" />
              <circle cx="26" cy="4" r="2.8" fill="#617e88" />
              <path d="M7 16h35m-35 7h27m-27 7h32" stroke="#82968b" strokeWidth="1.2" />
            </g>
          </g>
        </>
      )}
      {sharing && (
        <g className="office-shared-card">
          <path d="M570 104h77v55h-77Z" fill="#938163" opacity=".28" transform="translate(2 3)" />
          <path d="M570 104h77v55h-77Z" fill="#e4e8ca" />
          <text x="581" y="127" fill="#405443" fontSize="13" fontFamily="var(--font-display)">下一步</text>
          <path d="M581 138h50m-50 7h34" fill="none" stroke="#899976" strokeWidth="1.4" />
        </g>
      )}

      {/* Shelves, low seating and a flat-weave rug sit behind the figures. */}
      <path d="M715 25h185v263H715Z" fill="#bbb69b" opacity=".48" />
      <path d="M725 27h175v250H725Z" fill="#826249" />
      <path d="M733 34h167v73H733Zm0 81h167v66H733Zm0 74h167v76H733Z" fill="#59493a" />
      <path d="M741 66h13v40h-13Z" fill="#a27c55" /><path d="M756 56h15v50h-15Z" fill="#aeb293" />
      <path d="M773 59h19v47h-19Z" fill="#879482" /><path d="M796 64l10-3 15 42-11 3Z" fill="#d3bb96" />
      <path d="M747 71h8m3 0h12m4 13h16" stroke="#e4cfaa" strokeWidth="1.15" opacity=".7" />
      <path d="M824 93h76v13h-76Z" fill="#958059" /><path d="M838 84h62v10h-62Z" fill="#c2ae89" />
      <path d="M740 161h62v18h-62Z" fill="#af9f7b" /><path d="M748 152h55v10h-55Z" fill="#718273" />
      <path d="M837 146h32l-5 33h-21Z" fill="#b68162" />
      <path d="M853 148q1-27-7-38m7 30q4-17 17-24m-17 11q-13-16-26-10" fill="none" stroke="#a5aa7e" strokeWidth="2.5" />
      <path d="M846 112q-16 2-20-11 17-4 20 11Zm13 19q2-17 15-18 3 12-15 18Zm-8-7q-18 4-23-9 15-5 23 9Z" fill="#8e9e70" />
      <path d="M737 196h163v65H737Z" fill="#9e7856" /><path d="M814 198v62m-36-35h11m51 0h11" fill="none" stroke="#65503e" strokeWidth="2" />
      <path d="M725 106h175v9H725Zm0 75h175v8H725Zm0 83h175v10H725Z" fill="#b68b61" />
      <path d="M725 106h175m-175 75h175m-175 82h175" stroke="#d1aa7f" opacity=".64" />

      <path d="M410 333q147-27 334-23l156 43v117H280l-18-30Z" fill={paint("rug")} />
      <path d="M400 346q157-25 337-23l163 44m-571 97-43-26 115-79q176-25 335-22l164 45" stroke="#e7dabb" strokeWidth="2.5" opacity=".55" fill="none" />
      <path d="M378 369l39-19m-53 39 32-24m-94 83 21-40m75-55 146 117m80-138 199 138" fill="none" stroke="#f4ebcf" strokeWidth="1" opacity=".29" />
      <ellipse cx="267" cy="416" rx="235" ry="44" fill={paint("shadow")} />
      <ellipse cx="734" cy="399" rx="168" ry="43" fill={paint("shadow")} />
      <ellipse cx="562" cy="424" rx="95" ry="24" fill={paint("shadow")} />

      <path d="M650 337q5-34 32-39l163 1q32 5 42 32l10 48-30 17-176-3-49-28Z" fill="#4f6858" />
      <path d="M662 265q5-35 37-38l137 4q37 2 49 36l4 89-52 15-175-40Z" fill={paint("seat")} stroke="#536557" strokeWidth="2.5" />
      <path d="M687 253q61-12 128-4 32 4 42 26" fill="none" stroke="#bfcaac" strokeWidth="2" opacity=".67" />
      <path d="M652 332q22-21 61-25l127 5 38 23-47 21-151-2Z" fill="#9dab8a" stroke="#5f725e" strokeWidth="2" />
      <path d="M665 326q-11-4-16 5-11 27 3 45l30 18 18-5-7-46Z" fill="#7a947d" stroke="#566d5e" strokeWidth="2" />
      <path d="M844 328q33-17 44-7 11 19 7 48l-34 24-25 4 10-55Z" fill="#6f896f" stroke="#536859" strokeWidth="2" />
      <path d="M702 355q74 9 139 4m-146 22 141 5" stroke="#c0c8a4" strokeWidth="1.7" opacity=".59" fill="none" />
      <path d="M682 387l4 23 9 2 7-21m158 0 7 22h9l2-29" fill="#66482f" />

      <path d="M509 374l-16 43 10 3 31-45Zm49-2 12 48 11-1-1-46Z" fill="#75543b" stroke="#684a35" strokeWidth="1.6" />
      <ellipse cx="543" cy="373" rx="56" ry="15" fill="#906548" stroke="#6d523d" strokeWidth="2" />
      <ellipse cx="543" cy="369" rx="55" ry="12" fill="#b58d63" stroke="#826046" strokeWidth="1.6" />

      <Teacher fur={paint("fur")} />
      <path d="M237 322q2-25 35-20l59 32-27 51-15 43-26 3-9-9 11-46-42-32Z" fill="#526457" stroke="#443e35" strokeWidth="2.2" />
      <path d="M259 420q20-9 33-3l15 10q3 9-12 10l-37 1q-11-8 1-18Z" fill="#6d5941" stroke="#4f4133" strokeWidth="1.8" />

      {/* A slim walnut worktable leaves open space between the participants. */}
      <path d="M136 333l35 2-16 105-15 9-16-7Zm255 4 26-4 11 96-12 7-13-7Zm50-21 19-8 4 79-8 6-11-4Z" fill={paint("walnut")} stroke="#674931" strokeWidth="2" />
      <path d="M130 326l64-43h273l28 18-78 46-287 2-25-7Z" fill={paint("desk")} stroke="#6c4d36" strokeWidth="2" />
      <path d="M105 342l25 7 287-2 78-46-1 13-79 49-285 3-26-9Z" fill={paint("walnut")} stroke="#6c4d36" strokeWidth="2" />
      <path d="M124 343q194-13 299-7l57-30m-285-17h269m-302 62 240 1m-258 9 166-1" fill="none" stroke="#f2ce98" strokeWidth="1.1" opacity=".48" />
      <path d="M172 321q52 4 102 0m-65-22q98-5 185 0m-132 40 98-5" fill="none" stroke="#956744" strokeWidth="1.05" opacity=".51" />

      <ellipse cx="168" cy="324" rx="38" ry="6" fill="#6e4c34" opacity=".3" />
      <path d="M156 315h26l12 6q-12 8-48 4l-5-4Z" fill="#5e6652" stroke="#534d3c" strokeWidth="1.5" />
      <path d="M165 317l1-39 35-41" fill="none" stroke="#40584a" strokeWidth="6" strokeLinecap="round" />
      <path d="M173 263q2-16 17-26 14-9 27-1l9 12-48 28Z" fill="#657f66" stroke="#40594a" strokeWidth="1.85" />
      <path d="M178 275q36-27 48-27 0 6-15 16-22 12-33 11Z" fill="#f0d5a4" />
      <path d="M183 280l42-24 30 54-95 17Z" fill={paint("light")} opacity=".38" />

      <path d="M252 305l64-16 37 11-58 24-54-11Z" fill="#785745" opacity=".46" />
      <path d="M260 300l55-17 41 11-60 24-49-7Z" fill="#e9ddbd" stroke="#8d7355" strokeWidth="1.4" />
      <path d="M260 300l32-9 28 2 27-7 9 8-60 21-49-6Z" fill="#f8eacb" stroke="#aa9171" strokeWidth="1.1" />
      <path d="M320 293l-24 22m-30-13 28 5m-35-2 30 5m32-11 22-8" stroke="#ac9573" strokeWidth="1" fill="none" />
      <path d="M365 311l40-11 39 7-45 18-46-6Z" fill="#e0c7a0" stroke="#927050" strokeWidth="1.2" />
      <path d="M365 309l38-12 41 7-45 18-45-6Z" fill="#899c7b" stroke="#6b7a61" strokeWidth="1.4" />
      <path d="M376 308l28-8 23 4-28 10Z" fill="#dfd5ac" opacity=".8" />
      <ellipse cx="452" cy="294" rx="23" ry="6" fill="#664831" opacity=".22" />
      <path d="M456 270q17-7 16 4-1 10-14 10" fill="none" stroke="#5e6e61" strokeWidth="3" />
      <path d="M431 266h31l-3 24q-11 8-24 0Z" fill="#829789" stroke="#576c60" strokeWidth="1.7" />
      <ellipse cx="446.5" cy="266" rx="15.5" ry="4" fill="#5d6c5c" stroke="#4c6457" strokeWidth="1.4" />

      <path d="M205 280q25 14 48 13l21-2 3 12q-28 12-57 3-14-4-25-20" fill="#64795e" stroke="#465540" strokeWidth="2" />
      <path d="M262 291q11-5 22 0 13 5 8 13-6 6-22 1l-8-3Z" fill="#cd915a" stroke="#6d4b36" strokeWidth="1.85" />
      {sharing ? (
        <g className="office-pointing">
          <path d="M299 267q27 3 44-22l36-53 16 8-32 67q-21 33-56 28" fill="#657d60" stroke="#405741" strokeWidth="2.5" />
          <path d="M376 197q5-11 10-19 5-6 9-5l18-5q7 0 6 5l-16 9 6 5q0 7-9 11l-10 5Z" fill="#d7a26b" stroke="#725036" strokeWidth="1.9" />
        </g>
      ) : (
        <g className="office-writing">
          <path d="M308 265q18 10 25 25l18-7 9 10q-12 18-30 17-14 0-28-14" fill="#62785e" stroke="#465640" strokeWidth="2" />
          <path d="M347 282q10-10 20-5 10 6 4 13-7 8-17 6l-6-3Z" fill="#d29a61" stroke="#6d4b36" strokeWidth="1.8" />
          <path d="M374 269l-12 21-5 5 1-7 12-21Z" fill="#594b3b" stroke="#514234" strokeWidth="1.1" />
          <path d="M370 271l3 2" stroke="#e1c691" strokeWidth="1.2" />
        </g>
      )}

      {seats.filter(seat => seat.submitted).map(seat => (
        <g key={seat.side} className="office-slip" data-side={seat.side} transform={seat.side === "A" ? "translate(365 320) rotate(-6)" : "translate(417 325) rotate(4)"}>
          <path d="M-16 4l13-12 32-1 4 5-15 13Z" fill={seat.side === "A" ? "#f5e8c9" : "#dce6d9"} stroke="#987355" strokeWidth="1.25" />
          <path d="M27-9l-5 5h11" fill="none" stroke="#a58c70" strokeWidth="1" />
        </g>
      ))}

      {seats.map(seat => seat.joined !== false && (
        <g key={seat.side} data-office-person={seat.side} transform={seat.side === "A" ? "translate(497 215) scale(.88)" : "translate(687 189) scale(1.02)"}>
          {seat.side === "A" ? <HesitantVisitor fur={paint("desk")} /> : <ExplainingVisitor wool={paint("wool")} />}
        </g>
      ))}

      {/* Paper grain unifies the ink, furniture and afternoon light. */}
      <path d="M0 0h900v470H0Z" className="office-grain" filter={paint("grain")} opacity=".16" />
    </svg>
  )
}
