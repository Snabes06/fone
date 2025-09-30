const state = require('../state');

module.exports = function msg(ctx, message) {
    const info = state.clients.get(ctx) || {};
    const room = info.room;

    if (!room || !state.rooms.has(room)) {
        return ctx.websocket.send(JSON.stringify({
            type: 'error',
            message: 'You are not in a room. Use /join to enter a room.'
        }));
    }

    const username = info.username || 'Anonymous';
    const text = message.message || '';

    // Broadcast to all clients in the room
    for (const client of state.rooms.get(room)) {
        client.websocket.send(JSON.stringify({
            type: 'msg',
            from: username,
            message: text
        }));
    }
};
