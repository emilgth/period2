import path from 'path';
import mongo from 'mongodb';

require('dotenv').config({path: path.join(process.cwd(), '.env')});

const MongoClient = mongo.MongoClient;

export default async () => {
    const connection = process.env.CONNECTION || '';
    const client = new MongoClient(connection, {useNewUrlParser: true, useUnifiedTopology: true})
    await client.connect();
    return client;
};
