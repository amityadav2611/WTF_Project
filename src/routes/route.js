const express = require('express');
const router = express.Router();

const {createUser, loginUser,getAll, getFilterUser} = require("../controllers/userController")
const {authentication} = require("../middleware/auth")

//user API
router.post("/register", createUser )
router.post("/login", loginUser)
router.get("/getAllUsers",authentication, getAll)
router.get("/allFilterUser", getFilterUser)



module.exports = router;