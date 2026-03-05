// server/db.ts
import * as schema from "../shared/schema.ts";

// We are exporting an empty object or null because the app 
// will now use MemStorage instead of Drizzle.
export const db = {} as any;
export const pool = {} as any;
export { schema };
