import { connect } from "mongoose";

const connectDB = async () => {
    try {
        const con = await connect(`${process.env.MONGODB_URI}`)

        console.log("MONGODB connected!! DB HOST: ", con.connection.host)

    } catch (error) {
        console.log("MONGODB connection error:", error);
        process.exit(1)
    }
}

export default connectDB