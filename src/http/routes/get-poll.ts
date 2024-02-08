import { z } from 'zod';
import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { appendFile } from 'fs';

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
    

        return reply.send(poll);
    });
}