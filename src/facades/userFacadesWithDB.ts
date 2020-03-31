import path from 'path';
import IGameUser from '../interfaces/GameUser';
import {bcryptAsync, bcryptCheckAsync} from "../utils/bcrypt-async-helper";
import * as mongo from 'mongodb';
import {ApiError} from "../errors/apiError";

require('dotenv').config({path: path.join(process.cwd(), '.env')});

let userCollection: mongo.Collection;

export default class UserFacade {
    static async setDatabase(client: mongo.MongoClient) {
        const dbName = process.env.DB_NAME;
        if (!dbName) throw new Error('Database name not provided');
        try {
            if (!client.isConnected()) await client.connect();
            userCollection = client.db(dbName).collection('users');
            return client.db(dbName);
        } catch (e) {
            console.error('Could not create connect', e);
        }
    }

    static async addUser(user: IGameUser): Promise<string> {
        const hash = await bcryptAsync(user.password);
        let newUser = {...user, password: hash};
        const result = await userCollection.insertOne(newUser);
        return 'User was added';
    }

    static async getAllUsers(): Promise<Array<any>> {
        return await userCollection.find({}).toArray();
    }

    static async getUser(userName: string): Promise<IGameUser> {
        const user: IGameUser | null = await userCollection.findOne({userName: userName});
        if (!user) {
            throw new ApiError('User not found');
        } else {
            return user;
        }
    }

    static async checkUser(userName: string, password: string): Promise<boolean> {
        let userPassword = '';
        try {
            const user = await UserFacade.getUser(userName);
            userPassword = user.password;
        } catch (e) {console.error(e)}
        return await bcryptCheckAsync(password, userPassword);
    }

    static async deleteUser(userName: string): Promise<string> {
        await userCollection.deleteOne({userName: userName});
        return `User ${userName} has been deleted`;
    }
}
