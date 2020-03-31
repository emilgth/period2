import path from "path";
import {expect} from 'chai';
import {Server} from 'http';
import fetch from "node-fetch";
import mongo, {MongoClient} from "mongodb";
import {bcryptAsync} from "../src/utils/bcrypt-async-helper";
import setup from "../src/config/setupDB";
import IGameUser from "../src/interfaces/GameUser";

const debug = require('debug')('game-project');

require('dotenv').config({path: path.join(process.cwd(), '.env')});

const TEST_PORT = '7777';
let server: Server;
let client: MongoClient;

describe('Hello', () => {
    let URL: string;
    before(async () => {
        process.env["PORT"] = TEST_PORT;
        process.env["DB_NAME"] = 'semester_case_test';
        server = await require('../src/app').server;
        URL = `http://localhost:${process.env.PORT}`;
        client = await setup();
    });

    beforeEach(async () => {
        const db = client.db(process.env.DB_NAME);
        const usersCollection = db.collection('users');
        await usersCollection.deleteMany({});
        const secretHashed = await bcryptAsync('secret');
        await usersCollection.insertMany([
            {name: "Peter Pan", userName: "pp@b.dk", password: secretHashed, role: "user"},
            {name: "Donald Duck", userName: "dd@b.dk", password: secretHashed, role: "user"},
            {name: "admin", userName: "admin@a.dk", password: secretHashed, role: "admin"}
        ]);
    });

    after(async () => {
        server.close();
        await client.close();
    });

    it('should get three users', async () => {
        const result: Array<IGameUser> = await fetch(`${URL}/api/users`).then(value => value.json());
        expect(result.length).to.be.equal(3);
        expect(result[0].name).to.be.equal('Peter Pan');
    });
});
