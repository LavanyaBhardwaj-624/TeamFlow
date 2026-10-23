import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import Auth_router from './src/routes/authroutes.ts'
import redis from './src/config/redis.ts'
import workspaceInvitationRouter from './src/routes/workspace.routes/workspaceInvitation.routes.ts'
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  exposedHeaders: ['x-access-token'] // <-- Allows JS to read req.getResponseHeader('x-access-token')
}));

app.use( '/api/auth' , Auth_router);
app.use('/api', workspaceInvitationRouter);


const PORT = process.env.Server_Port || 3000;


async function connection(){
    try{

      await redis.connect();
      console.log( 'connect to redis database ');

        app.listen(PORT, () => {
          console.log(`Server running on http://localhost:${PORT}`);
        });
    }catch(err: any){

      console.log(' error in connecting to database => ' + err);
    }

}

connection();
