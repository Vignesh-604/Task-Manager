import { signupUser, loginUser, logoutUser, getUser } from "../controllers/user.controller.js"
import { Router } from "express"
import verifyJWT from "../middlewares/auth.middleware.js"

const router = Router()

router.post("/signup", signupUser)

router.post("/login", loginUser)

router.get("/logout", verifyJWT, logoutUser)

router.get("/", verifyJWT, getUser)

export default router