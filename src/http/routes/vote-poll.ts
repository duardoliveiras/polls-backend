import { z } from 'zod';
import { FastifyInstance } from 'fastify'; 
import { prisma } from '../lib/prisma';
import { randomUUID } from "node:crypto";

export async function votePoll(app: FastifyInstance){
    app.post('/poll/:id/vote', async(request, reply) => {
        const pollOption = z.object({
            pollOptionId: z.string().uuid(),
        });

        const pollParam = z.object({
            id: z.string().uuid(),
        });

        const { id } = pollParam.parse(request.params); // request.params is the parameters of the request
        const { pollOptionId } = pollOption.parse(request.body); // request.body is the body of the request
        

        let sessionId = request.cookies.sessionId; 

        if(sessionId){
        
            const userVoteBefore = await prisma.vote.findUnique({
                where: {
                    sessionId_pollId: {
                        sessionId: sessionId,
                        pollId: id,
                    }
                }
            });

            if(userVoteBefore && userVoteBefore.pollOptionId === pollOptionId){
                return reply.status(400).send( { 
                    message: "You already voted in this option."
                });
            }else if(userVoteBefore){
                await prisma.vote.update({
                    where: {
                        id: userVoteBefore.id
                    },
                    data: {
                        pollOptionId: pollOptionId
                    }
                
                });

                return reply.status(201).send( { message: "Updated vote."} );
            }
        }
        
        if(!sessionId){
        sessionId = randomUUID(); // generate a random session id for the user

            reply.setCookie('sessionId', sessionId, {
                path: '/', // set the cookie to be available on all routes
                maxAge: 60 * 60 * 24 * 7, // set the cookie to expire in 7 days
                signed: true, // sign the cookie to avoid the user to modify it 
                httpOnly: true, // set the cookie to be only accessible by the server
            });
        }

        await prisma.vote.create({
            data: {
                pollOptionId: pollOptionId,
                sessionId: sessionId,
                pollId: id,
            }
        })

        return reply.status(201).send({ sessionId });

    }) 
}