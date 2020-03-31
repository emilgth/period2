import express, {Response, Request} from 'express';
import userFacade from '../facades/userFacadesWithDB';
import basicAuth from '../middleware/basic-auth';
import {ApiError} from "../errors/apiError";
// import * as mongo from 'mongodb';
import setup from "../config/setupDB";
import IGameUser from "../interfaces/GameUser";

// const MongoClient = mongo.MongoClient;
const router = express.Router();
const USE_AUTHENTICATION = false;

(async function setupDB() {
    const client = await setup();
    await userFacade.setDatabase(client);
})();

router.post('/', async (req: Request, res: Response, next: Function) => {
    try {
        let newUser: IGameUser = req.body;
        newUser.role = 'user';
        const status = await userFacade.addUser(newUser);
        res.json({status});
    } catch (e) {
        next(e)
    }
});

if (USE_AUTHENTICATION) router.use(basicAuth);

router.get('/:userName', async (req: any, res: Response, next: Function) => {
    try {
        if (USE_AUTHENTICATION) {
            const role = req.role;
            if (role != 'admin') new ApiError('Not authorized', 403)
        }
        const user_Name = req.params.userName;
        const user = await userFacade.getUser(user_Name);
        const {name, userName} = user;
        const userDTO = {name, userName};
        res.json(userDTO);
    } catch (e) {
        next(e)
    }
});

if (USE_AUTHENTICATION) {
    router.get('/user/me', async (req: Request, res: Response, next: Function) => {
        try {
            // @ts-ignore
            const user_Name = req.userName;
            const user = await userFacade.getUser(user_Name);
            const {name, userName} = user;
            const userDTO = {name, userName};
            res.json(userDTO);
        } catch (e) {
            next(e);
        }
    });
}

router.get('/', async (req: Request, res: Response, next: Function) => {
    try {
        if (USE_AUTHENTICATION) {
            // @ts-ignore
            const role = req.role;
            if (role != 'admin') new ApiError('Not Authorized', 403);
        }
        const users = await userFacade.getAllUsers();
        const usersDTO = users.map((user) => {
            const {name, userName} = user;
            return {name, userName};
        });
        res.json(usersDTO);
    } catch (e) {
        next(e);
    }
});

router.delete('/:userName', async (req: Request, res: Response, next: Function) => {
    try {
        if (USE_AUTHENTICATION) {
            // @ts-ignore
            const role = req.role;
            if (role != 'admin') new ApiError('Not Authorized', 403);
        }
        const user_name = req.params.userName;
        const status = await userFacade.deleteUser(user_name);
        res.json({status});
    } catch (e) {
        next(e);
    }
});

module.exports = router;
