import { createClient } from 'redis';

let client

const initRedisClient = async () => {
    if(!client){
        client = createClient()
        client.on('error', (err) => {
            console.log('Redis Client Error', err)
        })
    }
    try{
        await client.connect()
        console.log('Redis Client Connected')
    }catch(err){
        console.log('Redis Client Error', err)
    }
}
const getValue = async (key) => {
    const data= await client.json.get(`$user:${key}`)
    return data
}
const setValue = async (key, value) => {
    const data= await client.json.set(`$user:${key}`, "$", value)
    return data
}
export {initRedisClient, getValue, setValue}