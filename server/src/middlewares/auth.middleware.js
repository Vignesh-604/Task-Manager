import User from "../models/user.model.js"
import ApiResponse from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const verifyJWT = async (req, res, next) => {

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            return res.status(401).json(new ApiResponse(401, null, "Unauthorized"))
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id).select(" _id email name projects ")

        if (!user) {
            return res.status(400).json(new ApiResponse(400, null, "Invalid tokens"))
        }

        req.user = user
        next()

    } catch (error) {
        return res.status(500).json(new ApiResponse(500, null, "Something went wrong Tokens"))
    }
}
export default verifyJWT