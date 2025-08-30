console.log("DATABASE_URL:", process.env.DATABASE_URL);
import 'dotenv/config';
import { testNeonConnection } from "../lib/neon-actions";

(async () => {
  const result = await testNeonConnection();
  console.log(result);
})();
