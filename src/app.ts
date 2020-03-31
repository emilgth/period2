import express from 'express';
import path from 'path';
import {ApiError} from './errors/apiError';

require('dotenv').config();
const app = express();

app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.json());
let userAPIRouter = require('./routes/userApiDB');

app.use('/api/users', userAPIRouter);

app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
        res.status(404).json({code: 404, msg: 'this API does not contanin this endpoint'})
    }
    next();
});

app.use((err: any, req: any, res: any, next: Function) => {
    if (err instanceof (ApiError)) {
        const e = <ApiError>err;
        res.status(<number>e.errorCode).send({code:e.errorCode, message:e.message})
    }
    next(err);
});

const PORT = process.env.PORT || 3333;
let server = app.listen(PORT);
console.log(`Server started, listening on port: ${PORT}`);
module.exports.server = server;
