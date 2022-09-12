import mongo from '../db/db.js';
import joi from 'joi';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';


let db = await mongo();

const accountSchema = joi.object({
    email: joi.string().email().required().trim(),
    name: joi.string().required().trim(),
    password: joi.string().required().trim(),
});

const signInSchema = joi.object({
    email: joi.string().email().required().trim(),
    password: joi.string().required().trim(),
});

export async function createAccount(req, res) {
    console.log(req.body);
    const validation = accountSchema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        console.log(errors);
        res.status(421).send(errors);
        return;
    }

    try {
        const accountCreated = await db
            .collection('accounts')
            .find({
                email: validation.value.email,
            }).toArray();

        if (accountCreated.length > 0) {
            res.status(421).send('Este email já está sendo utilizado');
            return;
        }

        await db
            .collection('accounts')
            .insertOne({
                name: validation.value.name,
                email: validation.value.email,
                hash: bcrypt.hashSync(validation.value.password, 10),
            });

        // Authentication
        const user = await db
            .collection('accounts')
            .findOne({ email: validation.value.email });

        const userToken = uuidv4();
        await db.collection('sessions').insertOne({
            userId: user._id,
            token: userToken,
        })

        res.status(201).send({ name: validation.value.name, token: userToken });
        return;
    } catch (err) {
        res.status(500).send(err.message);
        return;
    }
}

export async function signInAccount(req, res) {
    console.log(req.body);
    const validation = signInSchema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        console.log(errors);
        res.status(421).send(errors);
        return;
    }

    try {
        const account = await db
            .collection('accounts')
            .find({
                email: validation.value.email,
            }).toArray();

        if (account.length === 1 && bcrypt.compareSync(validation.value.password, account[0].hash)) {
            // Authentication
            const userToken = uuidv4();
            const session = await db.collection('sessions').findOne({ userId: account[0]._id })
            if (session) {
                await db
                    .collection('sessions')
                    .updateOne(
                        { userId: account[0]._id }, { $set: { token: userToken } }
                    );
            } else {
                await db.collection('sessions').insertOne({
                    userId: account[0]._id,
                    token: userToken,
                })
            }

            res.status(200).send({ name: account[0].name, token: userToken });
            return;
        } else {
            res.send('Email ou senha incorretos');
            return;
        }

    } catch (err) {
        res.status(500).send(err.message);
    }
}