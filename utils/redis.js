import { promisify } from 'util';
import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.isClientConnected = true;
    this.client.on('error', (error) => {
      console.error('Redis client failed to connect:', error.message || error.toString());
      this.isClientConnected = false;
    });
    this.client.on('connect', () => {
      this.isClientConnected = true;
    });
  }

  isAlive() {
    return this.isClientConnected;
  }

  async get(k) {
    return promisify(this.client.GET).bind(this.client)(k);
  }

  async set(k, value, duration) {
    await promisify(this.client.SETEX)
      .bind(this.client)(k, duration, value);
  }

  async del(k) {
    await promisify(this.client.DEL).bind(this.client)(k);
  }
}

export const redisClient = new RedisClient();
export default redisClient;
