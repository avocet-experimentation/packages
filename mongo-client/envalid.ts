import 'dotenv/config';
import { cleanEnv, num, str } from 'envalid';

const cfg = cleanEnv(process.env, {
  MONGO_TESTING_URI: str(),
  SALT_ROUNDS: num(),
});

export default cfg;
