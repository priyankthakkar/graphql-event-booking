const eventResolver = require('../resolver/event');
const bookingResolver = require('../resolver/booking');
const authResolver = require('../resolver/auth');

const rootResolver = {
    ...eventResolver,
    ...bookingResolver,
    ...authResolver
};

module.exports = rootResolver;