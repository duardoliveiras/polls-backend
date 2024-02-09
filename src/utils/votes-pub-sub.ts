type Message = { pollOptionId: string, votes: number } // a message is an object with a poll option id and the number of votes it has
type Subscriber = ( message : Message  ) => void; // a subscriber is a function that receives a message

class VotingPubSub { // pub/sub is a pattern where a client can subscribe to a topic and receive messages from a server when the server publishes a message to that topic.
    private channels : Record<string, Subscriber[]> = {};

    subscribe(pollId: string, subscriber: Subscriber){ // a client can subscribe to a topic and receive messages from a server when the server publishes a message to that topic.
        if(!this.channels[pollId]){
            this.channels[pollId] = [];

        }

        this.channels[pollId].push(subscriber);
    }

    publish(pollId: string, message: Message){ // the server publishes a message to that topic.
        if(!this.channels[pollId]){ // if there are no subscribers to the topic
            return;
        }

        for(const subscriber of this.channels[pollId]){ // for each subscriber to the topic send the message
            subscriber(message);
        }
    }
}


export const pubSub = new VotingPubSub();