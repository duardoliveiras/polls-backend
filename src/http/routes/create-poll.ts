import { PrismaClient } from '@prisma/client';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const prisma = new PrismaClient(); // instantiate PrismaClient

// app is the FastifyInstance
export async function createPoll(app: FastifyInstance){

    app.post('/polls', async (request, reply) => {
    
        const pollBody = z.object({ // define the object schema
            title : z.string(),
        });
    
        const {title} = pollBody.parse(request.body); // throws if invalid
        console.log(title);
    
        const result = await prisma.poll.create({
            data:{
                title: title,
            }
        })
    
    
            return reply.status(201).send(result);
            // 201 is the status code for "created"
        
    })

}


