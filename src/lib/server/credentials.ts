import { createHash, randomBytes, randomInt } from "node:crypto"

// 去除易混淆字符（0/O、1/I/L），32 字符字母表，8 位邀请码约 1.1 万亿种组合
const INVITE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

export function generateInviteCode() {
  let code = ""
  for (let i = 0; i < 8; i += 1) {
    code += INVITE_ALPHABET[randomInt(INVITE_ALPHABET.length)]
  }
  return code
}

export function generateAccessToken() {
  return randomBytes(32).toString("base64url")
}

export function hashAccessToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}
