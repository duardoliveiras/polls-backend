import fastify from "fastify";
import { z } from 'zod';
import { PrismaClient } from "@prisma/client";
import { createPoll } from "./routes/create-poll";
import { getPoll } from "./routes/get-poll";	
import { votePoll } from "./routes/vote-poll";
import cookie from "@fastify/cookie";

const app = fastify(); // instantiate Fastify

app.register(cookie, {
    secret: 'my-secret', // set the secret for the cookies to be signed for avoiding the user to modify them
    hook: 'onRequest', // set the cookie parser to run on every request
}); // register the cookie plugin


app.get('/hello', () => {
    return 'Salve!';
});



app.register(createPoll); // register the route handler for /polls
app.register(getPoll); // register the route handler for /poll/:id
app.register(votePoll);


app.listen({port: 3000}).then(() => {
    console.log("Server is running on port 3000");
});