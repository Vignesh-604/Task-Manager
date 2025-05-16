import User from "../models/user.model.js"
import ApiResponse from "../utils/ApiResponse.js"
import CryptoJS from "crypto-js"

const signupUser = async (req, res) => {
    const { name, email, password, role } = req.body
    if ([name, email, password, role].some((field) => field?.trim() === "")) {
        return res.status(400).json(new ApiResponse(400, null, "All input fields must be filled"))
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
        return res.status(400).json(new ApiResponse(400, null, "User already exists"))
    }

    const user = await User.create({ name, email, password, role })

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const createdUser = await User.findById(user._id).select(" _id email name role ")
    const userData = CryptoJS.AES.encrypt(JSON.stringify(createdUser), process.env.VITE_KEY).toString()

    if (!createdUser) return res.status(500).json(new ApiResponse(500, null, "Something went wrong while registering the user"))

    return res.status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .cookie("user", userData)
        .json(new ApiResponse(200, createdUser, "User Registered successfully!!"))
}

const options = { httpOnly: true, secure: true }

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new Error("Token generation failed: " + error.message)
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body
    if (!email || email.trim() === "") {
        return res.status(400).json(new ApiResponse(400, null, "Email is required!!"))
    }

    const user = await User.findOne({ email })
    if (!user) {
        return res.status(404).json(new ApiResponse(404, null, "Incorrect email"))
    }

    const validPassword = await user.isPasswordCorrect(password)
    if (!validPassword) {
        return res.status(404).json(new ApiResponse(404, null, "Password incorrect"))
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select(" _id name email role ")

    const userData = CryptoJS.AES.encrypt(JSON.stringify(loggedInUser), process.env.KEY).toString()

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .cookie("user", userData)
        .json(new ApiResponse(200, null, "User logged in successfully!!"))
}

const logoutUser = async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    )

    return res.status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .clearCookie("user")
        .json(new ApiResponse(200, null, "User logged out successfully!!"))
}

const getUser = async (req, res) => {
    const user = await User.findById(req.user._id).select(" -password -refreshToken ")
    return res.status(200).json(new ApiResponse(200, user, "Data fetched"))
}

export { signupUser, loginUser, logoutUser, getUser }