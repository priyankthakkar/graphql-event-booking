const bcryptjs = require('bcryptjs');
const Event = require('../../model/event');
const User = require('../../model/user');
const Booking = require('../../model/booking');

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

const singleEvent = async eventId => {
    try {
        const fetchedEvent = await Event.findOne({
            _id: eventId
        });

        return {
            ...fetchedEvent._doc,
            creator: getUser.bind(this, fetchedEvent.creator)
        };
    } catch (err) {
        throw err;
    }
}

const getUser = async userId => {
    try {
        const user = await User
            .findById(userId)

        return {
            ...user._doc,
            password: null,
            createdEvents: getEvents.bind(this, user._doc.createdEvents)
        };
    } catch (err) {
        throw new Error("Unable to locate the user.")
    }
}

module.exports = {
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return {
                    ...booking._doc,
                    event: singleEvent.bind(this, booking._doc.event),
                    user: getUser.bind(this, booking._doc.user),
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updatedAt: new Date(booking._doc.updatedAt).toISOString()
                };
            });
        } catch (err) {
            throw err;
        }
    },
    bookEvent: async args => {
        try {
            const fetchedEvent = await Event.findOne({
                _id: args.eventId
            });

            if (!fetchedEvent) {
                throw new Error("An error occured while saving the booking.");
            }
            console.log(fetchedEvent)

            const booking = new Booking({
                user: "5d628922deee0af575d2e0ca",
                event: fetchedEvent
            });

            const result = await booking.save();

            return {
                ...result._doc,
                event: singleEvent.bind(this, result._doc.event),
                user: getUser.bind(this, result._doc.user),
                createdAt: new Date(result._doc.createdAt).toISOString(),
                updatedAt: new Date(result._doc.updatedAt).toISOString()
            };
        } catch (err) {
            throw err;
        }
    },
    cancelBooking: async args => {
        try {
            const booking = await Booking.findOne({
                    _id: args.bookingId
                })
                .populate('event');

                console.log(booking)

            const event = {
                ...booking.event._doc,
                creator: getUser.bind(this, booking.event.creator)
            };

            await Booking.deleteOne({
                _id: args.bookingId
            });

            return event;
        } catch (err) {
            throw err;
        }
    },
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