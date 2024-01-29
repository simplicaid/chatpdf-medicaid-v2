import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not found");
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);

// if (!process.env.SUPABASE_URL) {
//   throw new Error("SUPABASE_URL is not set in the environment variables");
// }

// if (!process.env.SUPABASE_KEY) {
//   throw new Error("SUPABASE_KEY is not set in the environment variables");
// }

// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_KEY
// );

// const connectionString = process.env.SUPABASE_URL;
// const client = postgres(connectionString);

// const db = drizzle(client);

// async function fetchUserDocuments(userId: string) {
//   return await db.select().from(userDocumentsTable).where({ userId: userId });
// }

// // Usage
// const userId = "authenticated-user-id"; // Replace with actual authenticated user ID
// const userDocuments = fetchUserDocuments(userId);

// export { supabase, userDocuments };
