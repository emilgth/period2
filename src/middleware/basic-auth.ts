import auth, {BasicAuthResult} from "basic-auth";
import compare from 'tsscmp';
import http from "http";
import {Response} from "express";
import UserFacade from "../facades/userFacadesWithDB";

const authMiddleware = async (req: any, res: Response, next: Function) => {
    const credentials: BasicAuthResult | undefined = auth(req);
    try {
        // @ts-ignore
        if (credentials || await UserFacade.checkUser(credentials.name, credentials.pass)) {
            // @ts-ignore
            const user = await UserFacade.getUser(credentials.name);
            req.userName = user.userName;
            req.role = user.role;
            return next();
        }
    } catch (e) {}
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="example"');
    res.end('Access denied');
};

export default authMiddleware;
