import * as Redis from 'redis'

const client = Redis.createClient({
  host: "127.0.0.1",
  port: 6380,
});

export default client
