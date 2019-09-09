const Booking = require('../../model/booking');
const Event = require('../../model/event');
const {
    transformBooking,
    transformEvent
} = require('../resolver/merge');

module.exports = {
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            console.log(bookings)
            return bookings.map(booking => transformBooking(booking));
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

            return transformBooking(result);
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

            const event = transformEvent(booking.event)

            await Booking.deleteOne({
                _id: args.bookingId
            });

            return event;
        } catch (err) {
            throw err;
        }
    }
};