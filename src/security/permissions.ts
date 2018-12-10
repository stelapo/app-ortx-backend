import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
// import { request } from 'https';
// import UserCtrl from '../controllers/UserCtrl';
import UserModel from '../models/User';

const fromHeadersOrQueryString = (req: Request) => {
    if (req.headers.authorization) {
        let hs = req.headers.authorization.split(' ');
        if (hs[0] === 'Bearer') {
            return hs[1];
        } else if (req.query && req.query.token) {
            return req.query.token;
        }
        return null;
    }
}

export default function permit(psw: string, ...allowed: any[]) {
    const isAllowed = (role: string) => { return allowed.indexOf(role) > -1; }
    return (req: Request, resp: Response, next: Function) => {
        const token = fromHeadersOrQueryString(req);
        let decoded: object | string | any = '';
        let user: any = null;
        try {
            decoded = jwt.verify(token, psw);
            user = new UserModel(decoded['user']);
        } catch (err) {
            console.log(err);
        }
        if (user && isAllowed(user.role)) {
            next();
        } else {
            resp.status(403).json({ message: 'Forbidden' });
        }

    }
}