import express from "express"
import { connectDB } from "./config/connectToDB.js"
import { errorHandler, notFound } from "./middlewares/error.js"
import rateLimiting from "express-rate-limit"
import dotenv from 'dotenv'
import authRoute from './routes/authRoute.js'
import userRoute from './routes/userRoute.js'
import messageRoute from './routes/messageRoute.js'
import passwordRoute from './routes/passwordRoute.js'
import passport from "passport"
import { app, server } from "./middlewares/socket.js"
import TextFlow from "textflow.js"
import xss from 'xss-clean'
import hpp from "hpp"
import helmet from "helmet"
dotenv.config()



app.use(express.json())

app.use(helmet())

app.use(hpp())

app.use(xss())

app.use(rateLimiting({
    windowMs: 10 * 60 * 1000,
    max: 200
}))


TextFlow.useKey(process.env.TEXTFLOW_API_KEY)

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoute)
app.use("/api/users", userRoute)
app.use("/api/message", messageRoute)
app.use("/api/password", passwordRoute)


app.use(notFound)
app.use(errorHandler)

server.listen(process.env.PORT, () => {
    connectDB()

    console.log(`start at http://localhost:${process.env.PORT}`)
})
