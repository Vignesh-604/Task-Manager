import dotenv from "dotenv"
import connectDB from "./db.js"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

dotenv.config({ path: "./env" })

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser())


connectDB()
    .then(() => {
        app.on("error", (error) => console.log("ERROR: ", error))

        app.listen(process.env.PORT || 8000, () => {
            console.log("Listening on port no.", process.env.PORT);
        })
    })
    .catch((e) => console.log("Connection error: ", e))


