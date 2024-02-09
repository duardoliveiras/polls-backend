import { z } from 'zod';
import { FastifyInstance } from 'fastify'; 
import { prisma } from '../../lib/prisma';
import { randomUUID } from "node:crypto";
import { redis } from '../../lib/redis';
import { pubSub } from '../../utils/votes-pub-sub';

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

            // if the user already voted in this poll and in this option
            if(userVoteBefore && userVoteBefore.pollOptionId === pollOptionId){
                return reply.status(400).send( { 
                    message: "You already voted in this option."
                });

            // if the user already voted in this poll but in another option
            }else if(userVoteBefore){
                let currVotes = await redis.zincrby( id, -1, userVoteBefore.pollOptionId ); // decrement the score of the poll option in the poll sorted set
                
                pubSub.publish(id, {
                    pollOptionId: userVoteBefore.pollOptionId,
                    votes: parseInt(currVotes),
                })
                

                await prisma.vote.update({
                    where: {
                        id: userVoteBefore.id
                    },
                    data: {
                        pollOptionId: pollOptionId,
                        createdAt: new Date(),
                    }
                
                });

                currVotes = await redis.zincrby( id, 1, pollOptionId ); // increment the score of the poll option in the poll sorted set

                pubSub.publish(id, {
                    pollOptionId,
                    votes: parseInt(currVotes),
                });

                return reply.status(201).send( { message: "Updated vote."} );
            }
        }
        
        // if the user never voted in this poll before
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

        const currVotes = await redis.zincrby( id, 1, pollOptionId );
        // increment the score of the poll option in the poll sorted set

        // poll:1 = {
        //     pollOption1: 1,
        //     pollOption2: 3,
        // }

        pubSub.publish(id, {
            pollOptionId,
            votes: parseInt(currVotes),
        });

        return reply.status(201).send({ sessionId });

    }) 
}