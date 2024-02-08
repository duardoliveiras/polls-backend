import fastify from "fastify";
import { z } from 'zod';
import { PrismaClient } from "@prisma/client";
import { createPoll } from "./routes/create-poll";
import { getPoll } from "./routes/get-poll";	
import { votePoll } from "./routes/vote-poll";


const app = fastify(); // instantiate Fastify


app.get('/hello', () => {
    return 'Salve!';
});



app.register(createPoll); // register the route handler for /polls
app.register(getPoll); // register the route handler for /poll/:id
app.register(votePoll);


app.listen({port: 3000}).then(() => {
    console.log("Server is running on port 3000");
});