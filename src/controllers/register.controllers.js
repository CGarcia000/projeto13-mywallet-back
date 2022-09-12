import mongo from '../db/db.js';
import joi from 'joi';
import dayjs from 'dayjs';

let db = await mongo();

const registerSchema = joi.object({
    date: joi.string().required().trim(),
    description: joi.string().required().trim(),
    cost: joi.number().greater(0).less(10 ** 4).required(),
    type: joi.string().required().trim().valid('input', 'output'),
});

function calcTotal(registersArray) {
    let total = 0;
    let type;
    registersArray.forEach(register => {
        if (register.type === 'output') {
            total -= register.cost;
        } else {
            total += register.cost;
        }
    })
    if (total >= 0) {
        type = 'positive';
    } else {
        type = 'negative';
        total = Math.abs(total);
    }
    return ([total, type]);
}

export async function listRegisters(req, res) {
    const { session } = res.locals;

    try {
        const registers = await db.collection('registers').find({ userId: session.userId }).toArray();
        const registersNew = registers.map(register => ({
            date: register.date,
            description: register.description,
            cost: register.cost,
            type: register.type,
        }));

        const totalArr = calcTotal(registersNew);

        res.status(200).send({
            registers: registersNew,
            total: {
                total: totalArr[0],
                type: totalArr[1],
            }
        })

    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function addRegister(req, res) {
    const { session } = res.locals;
    const cost = parseInt(req.body.cost);

    const validation = registerSchema.validate({
        date: dayjs(req.body.date).format('DD/MM'),
        description: req.body.description,
        cost: parseInt(req.body.cost),
        type: req.body.type
    }, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        res.status(422).send(errors);
        return;
    }

    try {
        await db.collection('registers').insertOne({
            userId: session.userId,
            date: validation.value.date,
            description: validation.value.description,
            cost: validation.value.cost,
            type: validation.value.type
        });

        res.sendStatus(201)

    } catch (err) {
        res.status(500).send(err.message);
    }
}