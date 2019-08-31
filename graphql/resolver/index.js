const bcryptjs = require('bcryptjs');
const Event = require('../../model/event');
const User = require('../../model/user');

const getEvents = async eventIds => {
    try {
        const events = await Event
            .find({
                _id: {
                    $in: eventIds
                }
            });

        events
            .map(e => {
                return {
                    ...e._doc,
                    creator: getUser.bind(this, e.creator)
                };
            });

        return events;
    } catch (err) {
        console.log(err)
        throw new Error("Unable to retrieve events");
    }
}
const getUser = async userId => {
    try {
        const user = await User
            .findById(userId)

        return {
            ...user._doc,
            createdEvents: getEvents.bind(this, user._doc.createdEvents)
        };
    } catch (err) {
        throw new Error("Unable to locate the user.")
    }
}

module.exports = {
    events: async () => {
        try {
            const events = await Event
                .find();

            return events.map(e => {
                return {
                    ...e._doc,
                    date: new Date(e.date).toISOString(),
                    creator: getUser.bind(this, e.creator)
                }
            });
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    createEvent: async (args) => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: "5d628c7228758cf6a47d52cf"
        });

        let createdEvent;
        try {
            const result = await event
                .save();

            createdEvent = {
                ...result._doc
            };

            const user = await User.findById("5d628c7228758cf6a47d52cf");

            if (!user) {
                throw new Error("User does not exist.")
            }
            user.createdEvents.push(event);
            await user.save();

            return createdEvent;

        } catch (err) {
            console.log(err)
            throw err;
        };
    },
    createUser: async (args) => {
        try {
            const user = await User
                .findOne({
                    email: args.userInput.email
                })

            if (user) {
                throw new Error("User already exist.");
            }

            const hashedPassword = await bcryptjs.hash(args.userInput.password, 12);

            const newUser = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            const result = await newUser.save()

            console.log(result);
            return {
                ...result._doc,
                password: null
            };
        } catch (err) {
            console.log(err)
            throw err;
        }
    }
}