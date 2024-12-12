import Redis from "ioredis"
import dotenv from "dotenv"
dotenv.config()

const client = new Redis(process.env.RADIS_URI);

client.on('error', (err) => {
    console.error('Redis error:', err);
});


export default client