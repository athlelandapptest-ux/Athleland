import 'dotenv/config';
import { testConnection } from '../lib/database';

(async () => {
  const result = await testConnection();
  console.log(result);
})();
