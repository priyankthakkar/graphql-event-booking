const Event = require('../../model/event');
const User = require('../../model/user');
const {
    transformDateToString
} = require('../helpers/date');

const getEvents = async eventIds => {
    try {
        const events = await Event
            .find({
                _id: {
                    $in: eventIds
                }
            });

        return events
            .map(e => {
                return {
                    ...e._doc,
                    creator: getUser.bind(this, e.creator)
                };
            });
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

        return transformEvent(fetchedEvent);
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

const transformEvent = event => {
    return {
        ...event._doc,
        date: transformDateToString(event.date),
        creator: getUser.bind(this, event.creator)
    }
}

const transformBooking = booking => {
    return {
        ...booking._doc,
        event: singleEvent.bind(this, booking._doc.event),
        user: getUser.bind(this, booking._doc.user),
        createdAt: transformDateToString(booking._doc.createdAt),
        updatedAt: transformDateToString(booking._doc.updatedAt)
    };
}

exports.transformBooking = transformBooking;
exports.transformEvent = transformEvent;