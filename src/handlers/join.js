const state = require('../state');

function join(ctx, message) {
    const info = state.clients.get(ctx) || {};
    const newRoom = message.room;

    // Validate room name
    if (!newRoom) {
        ctx.websocket.send(JSON.stringify({
            type: 'error',
            message: 'Room name is required'
        }));
        return;
    }

    // Leave old room if present
    if (info.room && state.rooms.has(info.room)) {
        state.rooms.get(info.room).delete(ctx);

        // Notify old room
        for (const client of state.rooms.get(info.room)) {
            client.websocket.send(JSON.stringify({
                type: 'system',
                message: `${info.username || "Anonymous"} has left the room`
            }));
        }

        // Clean up if empty
        if (state.rooms.get(info.room).size === 0) {
            state.rooms.delete(info.room);
        }
    }

    // Add to new room
    if (!state.rooms.has(newRoom)) {
        state.rooms.set(newRoom, new Set());
    }
    state.rooms.get(newRoom).add(ctx);

    // Update client info
    info.room = newRoom;
    state.clients.set(ctx, info);

    // Notify client
    ctx.websocket.send(JSON.stringify({
        type: 'system',
        message: `You have joined room: ${newRoom}`
    }));

    // Notify other users in new room
    for (const client of state.rooms.get(newRoom)) {
        if (client !== ctx) {
            client.websocket.send(JSON.stringify({
                type: 'system',
                message: `${info.username || "Anonymous"} has joined the room`
            }));
        }
    }
}

module.exports = join;