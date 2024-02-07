import fastify from "fastify";
import { z } from 'zod';
import { PrismaClient } from "@prisma/client";


const app = fastify();

const prisma = new PrismaClient(); // instantiate PrismaClient

app.get('/hello', () => {
    return 'Salve!';
});

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

app.listen({port: 3000}).then(() => {
    console.log("Server is running on port 3000");
});