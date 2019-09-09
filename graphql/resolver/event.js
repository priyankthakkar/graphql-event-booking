const Event = require('../../model/event');
const User = require('../../model/user');
const {
    transformEvent
} = require('../resolver/merge');

module.exports = {
    events: async () => {
        try {
            const events = await Event
                .find();

            return events.map(e => {
                return transformEvent(e);
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
    }
};