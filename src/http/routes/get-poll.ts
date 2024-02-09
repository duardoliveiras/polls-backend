import { z } from 'zod';
import { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma';
import { appendFile } from 'fs';
import { redis } from '../../lib/redis';

export async function getPoll(app: FastifyInstance) {
    app.get('/poll/:id', async (request, reply) => {
        const getPollParams = z.object({
            id: z.string(),
        });

        const { id } = getPollParams.parse(request.params);

        const poll = await prisma.poll.findUnique({
            where:{
                id: id,
            },
            include: {
                // PollOption: true, // include all poll options in the response
                PollOption: { 
                    select: { // only include the id and name of each poll option
                        id: true,
                        name: true,
                    }
                }
            }
        });

        if(poll === null){
            return reply.status(404).send({ message: "Poll not found." });
        }

        const result = await redis.zrange(id, 0, -1, 'WITHSCORES');

        // {id: 1. {
            // score: 1
        // }
        
        // reduce is for transforming an array into an object
        // the object will have the poll option id as the key and the score as the value
        // the even indexes are the poll option ids and the odd indexes are the scores
        const votes = result.reduce( (ans, line, index) => {
                if(index % 2 === 0){
                    const score = result[index + 1];
                    Object.assign(ans, { [line]: parseInt(score) });
                }
                return ans;
            }, {} as Record<string, number>
        );
        
        console.log(votes);

        return reply.send({
            poll: {
                id: poll.id,
                title: poll.title,
                options: poll.PollOption.map(option => {  // map is for transforming an array into another array with the same length but with different elements
                    return {
                        id: option.id,
                        name: option.name,
                        score:  (option.id) in votes ? votes[option.id] : 0,
                    }
                })
            }
        });
    });
}