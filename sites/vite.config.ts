import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv } from "vite"

const resolve = (path: string) => fileURLToPath(new URL(path, import.meta.url))
const root = resolve("./")

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, root, "VITE_CATJUDGE_API_ORIGIN")
  const origin = new URL(env.VITE_CATJUDGE_API_ORIGIN || "http://127.0.0.1:3000")
  if (origin.href !== origin.origin + "/") {
    throw new Error("VITE_CATJUDGE_API_ORIGIN 必须只包含协议、主机和端口")
  }
  const local = origin.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname)
  if (origin.protocol !== "https:" && !(local && (command === "serve" || mode === "local-test"))) {
    throw new Error("比赛版需要通过 VITE_CATJUDGE_API_ORIGIN 配置公网 HTTPS 后端")
  }

  return {
    root,
    base: "./",
    publicDir: resolve("../public"),
    envPrefix: "VITE_CATJUDGE_API_ORIGIN",
    define: { "import.meta.env.VITE_CATJUDGE_API_ORIGIN": JSON.stringify(origin.origin) },
    esbuild: { jsx: "automatic" },
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": resolve("../src"),
        "next/navigation": resolve("./navigation.ts"),
        "next/link": resolve("./link.tsx"),
        "next/image": resolve("./image.tsx"),
      },
    },
    build: { outDir: "dist", emptyOutDir: true },
  }
})
