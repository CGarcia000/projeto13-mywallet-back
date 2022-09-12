import { MongoClient as mongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const MongoClient = new mongoClient(process.env.MONGO_URI);

export default async function mongo() {
    let db;

    try {
        db = await MongoClient.db('mywallet_db');
        return db;
    } catch (err) {
        console.log(err.message);
    }
}