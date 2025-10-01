const state = require('../state');

module.exports = function nick(ctx, message) {
    // Prompt for nickname if not provided
    if (!message || !message.nick) {
        return ctx.websocket.send(JSON.stringify({
            type: 'error',
            message: 'Nickname is required'
        }));
    }

    const newNick = message.nick.trim();
    const info = state.clients.get(ctx) || {};
    const oldNick = info.username || 'Anonymous';

    info.username = newNick;
    state.clients.set(ctx, info);

    // Notify client
    ctx.websocket.send(JSON.stringify({
        type: 'system',
        message: `Your nickname is now ${newNick}`
    }));

    // Notify room if already in a room
    if (info.room && state.rooms.has(info.room)) {
        for (const client of state.rooms.get(info.room)) {
            if (client !== ctx) {
                client.websocket.send(JSON.stringify({
                    type: 'system',
                    message: `${oldNick} is now known as ${newNick}`
                }));
            }
        }
    }
};
