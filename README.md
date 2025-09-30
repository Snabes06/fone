# IRC Web Client & Server - Development Checklist

This project implements a basic IRC (Internet Relay Chat) system with a WebSocket-based web client and Koa.js server. This checklist tracks development goals for each role in the project.

---

## Frontend Developer ✅

**Goals:**
- [ ] Build client interface (HTML/CSS/JavaScript or a framework).  
- [ ] Parse user IRC commands (e.g., `/join #channel`) and convert to JSON (e.g., `{"type": "JOIN", "data": "#channel"}`).  
- [ ] Manage WebSocket connections from the client side.  
- [ ] Display incoming messages, channel member lists, and server notifications.

---

## Backend Developer I ✅

**Goals:**
- [ ] Set up Koa server with WebSocket integration (`koa-websocket`).  
- [ ] Implement message router for incoming JSON (`"NICK"`, `"JOIN"`, `"MSG"`).  
- [ ] Implement server-side handling for `/quit` and `/list` commands.  
- [ ] Ensure proper error handling and logging.

---

## Backend Developer II ✅

**Goals:**
- [ ] Maintain data structures for active channels (e.g., Map of channel → connected user sockets).  
- [ ] Implement `/nick` logic: enforce unique usernames and update session/channel lists.  
- [ ] Implement `/join` logic: add user to channel and notify members.  
- [ ] Implement `/msg` logic: broadcast messages to all sockets in a user's current channel.

---

## Features Checklist

- [ ] Real-time messaging via WebSockets.  
- [ ] Multiple channels with user lists.  
- [ ] Nickname management with uniqueness checks.  
- [ ] Server-side commands (`/quit`, `/list`).  
- [ ] Dynamic message display in client interface.

---

## Development Notes
- Frontend, Backend I, and Backend II are being developed in parallel.  
- Use this checklist to mark completed features during development.  
- Merge requests should update the checklist if a new goal is achieved.

---

## Getting Started

1. Clone the repository:  
```bash
git clone <repo-url>
cd <repo-folder>