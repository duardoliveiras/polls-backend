import { FastifyInstance } from "fastify";
import { pubSub } from "../../utils/votes-pub-sub";
import { z } from 'zod';


// Web sockets to poll results are used to send the results of a poll to the client in real time.

// pub/sub is a pattern where a client can subscribe to a topic and receive messages from a server when the server publishes a message to that topic.

export async function pollResults( app: FastifyInstance ){
    app.get('/poll/:id/results', { websocket: true }, (connection, request) => { 
        const getPollParams = z.object({
            id: z.string().uuid(),
        });

        const { id } = getPollParams.parse(request.params); 

        pubSub.subscribe(id, (message) => {
            connection.socket.send(JSON.stringify(message));
        })
    });
}