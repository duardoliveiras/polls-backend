import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

// app is the FastifyInstance
export async function createPoll(app: FastifyInstance){

    app.post('/polls', async (request, reply) => {
    
        const pollBody = z.object({ // define the object schema
            title : z.string(),
            options: z.array(z.string(z.string())), // array of strings
        }); 
    
        const {title, options} = pollBody.parse(request.body); // throws if invalid
        console.log(title);
    
        const result = await prisma.poll.create({
            data:{
                title: title,
                PollOption: { // create the poll options
                    createMany: { // create many records at once like a transaction
                        data: options.map(option => { // 
                            return {
                                name: option,
                            }
                        }),
                    }
                }
            }
        });
        
    
        return reply.status(201).send(result);
        // 201 is the status code for "created"
        
    })

}

