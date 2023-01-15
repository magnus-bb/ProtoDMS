import type { Socket } from 'socket.io'


const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
})

io.on('connection', (socket: Socket) => {
  socket.on('disconnecting', () => console.log(`User disconnected from room ${socket.rooms}`))

  socket.on('join-document', ((documentId, userId) => {
    console.log(documentId, userId)

    socket.join(documentId)
  }))

  socket.on('editor-change', ((documentId, delta) => {
    socket.to(documentId).emit('editor-update', delta)
  }))

  console.log(`User connected with socket id: ${socket.id}`)
})

server.listen(3001, () => {
  console.log('listening on *:3001')
})