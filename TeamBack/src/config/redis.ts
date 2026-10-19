import redis from 'redis'

const {createClient} = redis;

require('dotenv').config();

const client = createClient({
    username: 'default',
    password: process.env.redis_password,
    socket: {
        host: process.env.redis_url,
        port: Number(process.env.redis_port)
    }
});


export default client
 