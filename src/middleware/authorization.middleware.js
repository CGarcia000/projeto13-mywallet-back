import mongo from '../db/db.js';

let db = await mongo();

export async function authenticateToken(req, res, next) {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');

    if (!token) return res.sendStatus(401);

    try {
        const session = await db.collection('sessions').findOne({ token });
        if (!session) return res.sendStatus(401);

        res.locals.session = session;

        next();
    } catch (error) {
        return res.send(500);
    }
}
