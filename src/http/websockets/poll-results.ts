import { FastifyInstance } from "fastify";


export async function pollResults( app: FastifyInstance ){
    app.get('/poll/:id/results', { websocket: true }, (connection, request) => { 
        connection.socket.on('message', (message : string) => {
            connection.socket.send('Hello from server!' + message);
        });
        
    });
}