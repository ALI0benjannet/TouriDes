import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packages = (name: string) => path.resolve(__dirname, `../../packages/${name}/src`);

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@touribook/ui": packages("ui"),
      "@touribook/api": packages("api"),
      "@touribook/auth": packages("auth"),
      "@touribook/i18n": packages("i18n"),
    },
  },
  test: {
    environment: "node",
    env: {
      NEXT_PUBLIC_API_URL: "/api",
      NEXT_PUBLIC_ADMIN_URL: "/admin",
    },
  },
});
