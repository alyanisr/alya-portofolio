import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  buckets: {
    "portfolio-public": { access: "public_read" },
    "portfolio-private": { access: "private" },
  },
});
