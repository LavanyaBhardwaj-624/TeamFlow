
import {type NextFunction, type Request , type Response} from 'express'
import { db } from '../prisma/db.ts';


const getAllMember = async (req: Request , res:Response , next: NextFunction ) : Promise<void> => {

        const userId = req.userId;  // userId already authenticat in middleware.
        try{


               const query = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
               const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 100);
               const Users = await db.orm.public.User.where({}).all();

               const Members = Users.map((u) => {
                return {
                     id: u.id,
                     email: u.email,
                     description: u.description,
                     name: u.name,
                     title: u.title,
                     image: u.imageUrl,                    
                }
               }).filter((u) => !query || `${u.name ?? ''} ${u.email} ${u.title ?? ''}`.toLowerCase().includes(query)).slice(0, limit)
                res.status(200).json({
                  success: true,
                  message: "All users are retrieve succesfully.",
                  data: Members,
                });

          return;
        }catch(err){
          console.log(` get All Users error -> ` + err);
        }
}

export default getAllMember;
