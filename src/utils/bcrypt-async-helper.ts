import * as bcrypt from 'bcryptjs';
import {hash} from "bcryptjs";

const SALT_ROUNDS = 10;

const bcryptAsync = (password: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(SALT_ROUNDS, ((err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) reject(err);
                return resolve(hash);
            });
        }));
    });
};

const bcryptCheckAsync = (password: string, hashed: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hashed, (err, res) => {
            if (err || !res) reject(false);
            return resolve(true);
        });
    });
};

export {bcryptAsync, bcryptCheckAsync};
