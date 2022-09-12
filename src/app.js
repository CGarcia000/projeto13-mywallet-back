import express from "express";
import cors from "cors";

//Routes
import router from './routes/index.js'

//DB
import mongo from "./db/db.js";
let db = await mongo();


const app = express();

app.use(cors());
app.use(express.json());

app.use(router);

app.get('/', (req, res) => {
    res.send('tá funcionando')
})

app.listen(5000, () => {
    console.log('Acessar http://localhost:5000');
    console.log('Servidor executando na porta 5000');
})