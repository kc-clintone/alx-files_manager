import { existsSync, readFileSync } from 'fs';

const loadEnv = () => {
  const env = process.env.npm_lifecycle_event || 'dev';
  const path = env.includes('test') || env.includes('cover') ? '.env.test' : '.env';

  if (existsSync(path)) {
    const data = readFileSync(path, 'utf-8').trim().split('\n');

    for (const index of data) {
      const delim = index.indexOf('=');
      const envVar = index.substring(0, delim);
      const value = index.substring(delim + 1);
      process.env[envVar] = value;
    }
  }
};

export default loadEnv;
