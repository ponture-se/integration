const secret = 'lflekfmsldkjlaskfjlkfjalsjfdaslkdjfasnmnbhb';
module.exports = {
    secret : process.env.TOKEN_SECRET || secret
};