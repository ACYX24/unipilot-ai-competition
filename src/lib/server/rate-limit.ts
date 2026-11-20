type Bucket = { timestamps: number[] }

// 单实例内存滑动窗口限流，适用于 MVP 单节点部署；
// 多实例/serverless 水平扩展时需换成 Redis 等共享存储。
const buckets = new Map<string, Bucket>()

export function isRateLimited({
  key,
  limit,
  windowMs,
}: {
  key: string
  limit: number
  windowMs: number
}) {
  const now = Date.now()
  const bucket = buckets.get(key) ?? { timestamps: [] }
  bucket.timestamps = bucket.timestamps.filter((time) => now - time < windowMs)

  if (bucket.timestamps.length >= limit) {
    buckets.set(key, bucket)
    return true
  }

  bucket.timestamps.push(now)
  buckets.set(key, bucket)

  if (buckets.size > 10000) {
    for (const [bucketKey, value] of buckets) {
      if (value.timestamps.every((time) => now - time >= windowMs)) {
        buckets.delete(bucketKey)
      }
    }
  }

  return false
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return request.headers.get("x-real-ip") ?? "local"
}
