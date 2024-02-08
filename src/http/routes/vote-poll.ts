import { z } from 'zod';
import { FastifyInstance } from 'fastify'; 
import { prisma } from '../lib/prisma';


export async function votePoll(app: FastifyInstance){
    app.post('poll/:id/vote', async(request, reply) => {
        const pollOption = z.object({
            pollOptionId: z.string().uuid(),
        });

        const pollParam = z.object({
            pollId: z.string().uuid(),
        });

        const { pollOptionId } = pollOption.parse(request.params);
        const { pollId } = pollParam.parse(request.params);

        return reply.status(201).send();

    }) 
}