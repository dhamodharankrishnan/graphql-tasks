const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require( 'apollo-server-core');

const cors = require('cors');
const dotEnv = require('dotenv');
const http =require('http');
const { start } = require('repl');

//setup env.
dotEnv.config();

const app = express();
const httpServer = http.createServer(app);

//Cross origin
app.use(cors());

//body parser middleware
app.use(express.json());

const PORT = process.env.PORT || 3000;


const typeDefs = gql`
    type User {
        id: ID!,
        name: String!,
        email: String!,
        tasks: [Task!]
    }

    type Task {
        id: ID!,
        name: String!,
        completed: Boolean!
        user: User!
    }

    type Query {
        greetings: String!
        greetingsList: [String!]
    }
`;

const resolvers = {
    Query: {
        greetings: () => "Hello",
        greetingsList: () => ["Hello", "Hi"]
    }
};

async function startApolloServer(app, httpServer, typeDefs, resolvers) {

    //Apollo server
    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        csrfPrevention: true,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    await apolloServer.start();
    return apolloServer;
}

startApolloServer(app, httpServer, typeDefs, resolvers).then(apolloServer => {
    apolloServer.applyMiddleware({app, path: '/graphql'});
})


app.use('/hello', (req, resp, next) => {
    resp.send({message: 'Hello hi Changed!'});
});

// Modified server startup
// await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve));
 
app.listen(PORT, () => {
    console.log(`Server listening on PORT: ${PORT}`);
//    console.log(`GraphQL Endpoint: ${apolloServer.graphqlPath}`);
});