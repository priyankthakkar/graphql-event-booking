const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const {
    buildSchema
} = require('graphql');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const Event = require('./model/event');
const User = require('./model/user');

const app = express();
app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`

        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: User!
        }

        type User {
            _id: ID!
            email: String!
            password: String
            createdEvents: [Event!]
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return Event
                .find()
                .then(events => {
                    return events.map(e => {
                        return {
                            ...e._doc,
                            date: new Date(e.date).toISOString()
                        }
                    });
                })
                .catch(err => {
                    console.log(err);
                    throw err;
                })
        },
        createEvent: (args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: args.eventInput.price,
                date: new Date(args.eventInput.date)
            });

            return event
                .save()
                .then(result => {
                    console.log(result);
                    return {
                        ...result._doc
                    };
                })
                .catch(err => {
                    console.log(err)
                    throw err;
                });
        },
        createUser: (args) => {
            return User
                .findOne({
                    email: args.userInput.email
                })
                .then(user => {
                    if (user) {
                        throw new Error("User already exist.")
                    }

                    return bcryptjs.hash(args.userInput.password, 12)
                })
                .then(hashedPassword => {
                    const user = new User({
                        email: args.userInput.email,
                        password: hashedPassword
                    });
                    return user.save()
                })
                .then(result => {
                    console.log(result);
                    return {
                        ...result._doc,
                        password: null
                    };
                })
                .catch(err => {
                    console.log(err)
                    throw err;
                });
        }
    },
    graphiql: true
}));

mongoose
    .connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@localhost:27017/${process.env.MONGO_DB}?authSource=admin`, {
        useNewUrlParser: true
    })
    .then(() => {
        app.listen(3000,
            () => console.log('server is listening at http://localhost:3000'))
    })
    .catch(error => console.log(error));