module.exports = {
  clients: new Map(), // ctx -> { username, room } (user info)
  rooms: new Map()    // roomName -> List of ctx connections (users)
};