import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config({ path: "./.env" });

export default {
  driver: "pg",
  schema: "./src/lib/db/schema.ts",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;

//npx drizzle-kit push:pg
// process.env.DATABASE_URL! --> asserting that preciding expression is non-null and non-undefined.
// We are telling TS that this value will exist at runtime.
