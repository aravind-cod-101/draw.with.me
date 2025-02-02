import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"
import { ToastContainer,toast } from "react-toastify"
import ColorPicker from "./ColorPicker"
import ResetCanvasBtn from "./ResetCanvasBtn"
import BrushSize from "./BrushSize"

console.log(import.meta.env)

const Canvas = () => {
    const canvasRef = useRef(null)
    const ctxRef = useRef(null)
    const socketRef = useRef(null)
    const isDrawing = useRef(false)
    const [color, setColor] = useState("#000000")
    const [userId, setUserId] = useState("")
    const [lineWidth, setLineWidth] = useState(4)
    // Connect to wss

    useEffect(() => {
        socketRef.current = io(import.meta.env.VITE_SOCKET_URL)

        socketRef.current.on("connect", () => {
            setUserId(socketRef.current.id)
            console.log("Connected to WebSocket:", socketRef.current.id);
        });

        socketRef.current.on('load-history', (history) => {
            history.forEach((data) => drawOnCanvas(data,false))
        })
        
        socketRef.current.on('user-event',(data) => {
            switch(data.event){
                case 'user-connected':
                    toast.success(`${data.userId} has joined`)
                    break
                case 'user-disconnected':
                    toast.error(`${data.userId} has disconnected`)
                    break
                case 'clear-canvas':
                    clearCanvas()
                    break
                case 'draw':
                    drawOnCanvas(data.drawData,false)
                    break
                default:
            }
        })


        const canvas = canvasRef.current
        if(!canvas) return;

        const ctx = canvas.getContext('2d')
        if (!ctx) return;

        ctxRef.current = ctx

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const handleResize = () => {
            const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            ctx.putImageData(imgData,0,0)
        }

        // window.addEventListener('resize',handleResize);
        // return () => {
        //     window.removeEventListener('resize',handleResize)
        // }


        return () => {
            socketRef.current.disconnect()
        }
    },[])


    const handleClearCanvas = () => {
        socketRef.current.emit('user-event',{event:'clear-canvas',userId})
        clearCanvas()
    }

    const clearCanvas = () => ctxRef.current.clearRect(0,0,canvasRef.current.width,canvasRef.current.height)

    const handleMouseDown = (e) => {
        isDrawing.current = true
    }

    const handleMouseMove = (e)  => {
        if(!isDrawing.current) return;
        const canvas = canvasRef.current
        if(!canvas || !ctxRef.current) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const prevX = x - e.movementX;
        const prevY = y - e.movementY;

        const drawData = {x,y,prevX,prevY,color,lineWidth,userId}
        socketRef.current.emit('user-event',{event:'draw',drawData})
        drawOnCanvas(drawData,true)
    }

    const handleMouseUp = () => {
        isDrawing.current = false
    }

    const drawOnCanvas = (data,emit) => {
            if(!ctxRef.current) return;
            const x = data.x
            const y = data.y
            const prevX = data.prevX
            const prevY = data.prevY
            const color = data.color
            const lineWidth = data.lineWidth
            ctxRef.current.strokeStyle = color;
            ctxRef.current.lineWidth = lineWidth;
            ctxRef.current.lineCap = 'round';
            ctxRef.current.beginPath();
            ctxRef.current.moveTo(prevX,prevY);
            ctxRef.current.lineTo(x,y);
            ctxRef.current.stroke();

            if(emit)
            {
                socketRef.current.emit('user-event', {event: 'draw' , drawData : {x,y,prevX,prevY,color,lineWidth,userId}})
            }
    }


    return(
        <div>
            <div className="flex justify-center align-center items-center">
                <ColorPicker color={color} setColor={setColor}/>
                <ResetCanvasBtn  handleClearCanvas={handleClearCanvas}/>
                <BrushSize lineWidth={lineWidth} setLineWidth={setLineWidth}/>
            </div>
            <canvas
            ref={canvasRef}
            className="whiteboard"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            />
            <ToastContainer
            theme="dark"
            position="top-center"
            />
        </div>
    )






}


export default  Canvas