import express from 'express';
import http from 'http'
import { Server } from 'socket.io';
import { configDotenv } from 'dotenv';

const app = express()
const server = http.createServer(app)
const io  = new Server(server,{
    cors: '*'
})
configDotenv()
const PORT = process.env.PORT

app.get('/',(req,res) =>{
    res.send('Welcome to Draw.with.me')
})

let connections = []
let drawingHistory = []

io.on('connect', (socket) =>{
    console.log(`${socket.id} has connected`)
    connections.push(socket)
    socket.broadcast.emit('user-event',{event: 'user-connected', userId: socket.id})
    socket.emit('load-history',drawingHistory)
    console.log(connections.map(con => con.id))

    socket.on('user-event', (data) => {
        switch(data.event){
        case 'clear-canvas':
            socket.broadcast.emit('user-event',{event: 'clear-canvas',userId: socket.id})
            drawingHistory = []
            break
        case 'draw':
            drawingHistory.push(data.drawData)
            socket.broadcast.emit('user-event',{event: 'draw',drawData: data.drawData})
            break
        default:
        }
    })
    
    socket.on('disconnect',() => {
        connections = connections.filter(con => con.id !== socket.id)
        console.log(`${socket.id} has disconnected`)
        socket.broadcast.emit('user-event',{event: 'user-disconnected', userId: socket.id})
    })
})

server.listen(PORT, () => {
    console.log(`listening on : ${PORT}`)
})