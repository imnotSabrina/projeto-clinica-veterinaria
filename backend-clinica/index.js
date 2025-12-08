import 'dotenv/config';
import express from "express";
import cors from "cors";
import conectDB from "./database/db.js";
import publicRoutes from "./routes/public.js";
import privateRoutes from "./routes/private.js"
import { authenticate, authorizaAdmin } from './middleware/authenticate.js';

const PORT = process.env.PORT;
const app = express();
app.use(express.json());
app.use(cors());

app.use('/', publicRoutes);
app.use('/', authenticate, privateRoutes);

conectDB()
    .then(()=>{
        app.listen(PORT,(erro)=>{
            if(!erro){
                console.log(`Servidor online. http://localhost:${PORT}/`)
            }else{
                console.log(`Não foi possível executar: ${erro}`)
            }
        }) 
    })
    .catch((erro)=>{
        console.log(`Erro de conexão com o database: ${erro}`);
    })

