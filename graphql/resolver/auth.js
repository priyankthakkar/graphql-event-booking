const bcryptjs = require('bcryptjs');
const User = require('../../model/user');

module.exports = {
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
};