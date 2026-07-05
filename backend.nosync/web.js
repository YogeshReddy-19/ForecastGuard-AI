import { Server } from "socket.io"
import yahooFinance from "yahoo-finance2"

const yf = new yahooFinance()   

export const initWebSockets = (server, redisClient) => {
    const io = new Server(server, {
        cors: {
            origin: "https://forecastguardai.vercel.app",
            credentials: true
        }
    })
    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id)
        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id)
        })
    })
    setInterval(async () => {
        try {
            const cachedPrediction = await redisClient.get("aapl_prediction")
            if (!cachedPrediction) {
                console.log("No prediction cached yet")
                return
            }
            const prediction = JSON.parse(cachedPrediction)
            const baselineRaw = await redisClient.get("aapl:baseline_price")
            if (!baselineRaw) {
                console.log("No baseline price in Redis yet")
                return
            }
            const baselinePrice = parseFloat(baselineRaw)
            const quote = await yf.quote("AAPL")
            const livePrice = quote.regularMarketPrice
            if (!livePrice) return
            const actualChange = livePrice - baselinePrice
            const actualChangePct = (actualChange / baselinePrice) * 100
            const predictedUp = prediction.direction === "UP"
            const movingUp = livePrice > baselinePrice
            const onTrack = predictedUp === movingUp
            const now = new Date()
            const hour = now.getUTCHours()
            const minute = now.getUTCMinutes()
            const dayOfWeek = now.getUTCDay()
            const marketOpen = (
                dayOfWeek >= 1 && dayOfWeek <= 5 &&
                (hour > 13 || (hour === 13 && minute >= 30)) &&
                hour < 20
            )
            const payload = {
                type: "PRICE_UPDATE",
                baseline_price: baselinePrice,
                live_price: parseFloat(livePrice.toFixed(2)),
                predicted_price: prediction.predicted_price,
                predicted_direction: prediction.direction,
                actual_change: parseFloat(actualChange.toFixed(2)),
                actual_change_pct: parseFloat(actualChangePct.toFixed(3)),
                status: !marketOpen ? "MARKET_CLOSED"
                    : onTrack ? "ON_TRACK" : "OFF_TRACK",
                market_open: marketOpen,
                timestamp: new Date().toISOString()
            }
            console.log("Broadcasting:", payload)
            io.emit("PRICE_UPDATE", payload)
        } catch (error) {
            console.error("WebSocket tracker error:", error.message)
        }
    }, 5000)
}