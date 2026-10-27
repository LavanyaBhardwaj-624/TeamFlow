import express from 'express';
import { createServer } from 'node:http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import Auth_router from './src/routes/authroutes.ts'
import redis from './src/config/redis.ts'
import workspaceInvitationRouter from './src/routes/workspace.routes/workspaceInvitation.routes.ts'
import workspaceOperationRouter from './src/routes/workspace.routes/workspaceOperation.routes.ts'
import TaskOperation from './src/routes/Task.routes/taskOperation.ts'
import getActivity from "./src/routes/activity.routes/getActivities.ts"
import { initRealtime } from './src/realtime/socket.ts';
import ChatChannelRoutes from './src/routes/ChatChannel.routes/createchannels.ts';
import MessageRoutes from "./src/routes/Message.routes/message.routes.ts";

const app = express();
const server = createServer(app);
initRealtime(server);

app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  exposedHeaders: ['x-access-token'] // <-- Allows JS to read req.getResponseHeader('x-access-token')
}));

app.use( '/api/auth' , Auth_router);
app.use('/api', workspaceInvitationRouter);
app.use('/api', workspaceOperationRouter);
app.use('/api/Task' , TaskOperation);
app.use("/api/activity" , getActivity);
app.use("/api/channel" , ChatChannelRoutes);
app.use("/api/message" , MessageRoutes);

const PORT = process.env.Server_Port || 3000;


async function connection(){
    try{

      await redis.connect();
      console.log( 'connect to redis database ');

        server.listen(PORT, () => {
          console.log(`Server running on http://localhost:${PORT}`);
        });
    }catch(err: any){

      console.log(' error in connecting to database => ' + err);
    }

}

connection();
