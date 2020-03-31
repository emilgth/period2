import * as mongo from 'mongodb';
import setup from "../src/config/setupDB";
import UserFacade from "../src/facades/userFacadesWithDB";
import {expect} from 'chai';
import {bcryptAsync} from "../src/utils/bcrypt-async-helper";
import {ApiError} from "../src/errors/apiError";

const debug = require('debug')('game-project');

const MongoClient = mongo.MongoClient;
let userCollection: mongo.Collection | null;
let client: mongo.MongoClient;

describe('Verify the UserFacade', () => {
    before(async () => {
        client = await setup();
        process.env.DB_NAME = 'semester_case_test';
        const db = await UserFacade.setDatabase(client);
        if (!db) throw new Error('No database connection');
        userCollection = db.collection('users');
        if (userCollection === null) throw new Error('User collection is null');
    });

    after(async () => {
        if (userCollection === null) throw new Error('UserCollection not set');
        await userCollection.deleteMany({});
        const secretHashed = await bcryptAsync('secret');
        await userCollection.insertMany([
            {name: "Peter Pan", userName: "pp@b.dk", password: secretHashed, role: "user"},
            {name: "Donald Duck", userName: "dd@b.dk", password: secretHashed, role: "user"},
            {name: "admin", userName: "admin@a.dk", password: secretHashed, role: "admin"}
        ])
    });

    it('should add the user Jan Olsen', async () => {
        const newUser = {name: "Jan Olsen", userName: "jo@b.dk", password: "secret", role: "user"};
        try {
            const status = await UserFacade.addUser(newUser);
            expect(status).to.be.equal('User was added');
        } catch (e) {

        } finally {

        }
    });

    it("Should remove the user Peter", async () => {
        try {
            const status = await UserFacade.deleteUser("pp@b.dk");
            expect(status).to.be.equal("User pp@b.dk has been deleted");
        } catch (err) {
            throw err;
        } finally {
        }
    });


    it("Should get three users", async () => {
        try {
            const users = await UserFacade.getAllUsers();
            expect(users.length).equal(3);
        } catch (e) {
            throw e;
        } finally {

        }
    });


    it("Should find Donald Duck", async () => {
        try {
            const user = await UserFacade.getUser('dd@b.dk');
            expect(user.name).equal('Donald Duck');
        } catch (e) {
            throw e;
        }
    });

    it("Should not find xxx.@.b.dk", async () => {
        try {
            const user = await UserFacade.getUser("xxx.@.b.dk");
        } catch (err) {
            expect(err instanceof ApiError).to.be.equal(true);
            expect(err.message).to.be.equal("User not found")
        } finally {
        }
    });

    xit("Should correctly validate Peter Pan's credential,s", async () => {

    });

    xit("Should NOT correctly validate Peter Pan's check", async () => {
        try {
            const passwordStatus = await UserFacade.checkUser("pp@b.dk", "xxxx");
        } catch (err) {
            expect(err).to.be.false
        }
    });

    xit("Should NOT correctly validate non-existing users check", async () => {
        try {
            const passwordStatus = await UserFacade.checkUser("pxxxx@b.dk", "secret");
        } catch (err) {
            expect(err).to.be.false
        }
    })
});
