const express = require("express")
const router = express.Router();
const zod = require("zod");
const {User} = require("../db");
const JWT_Secret = require("../config");
const jwt = require("jsonwebtoken")

const signupSchema = zod.object({
    username : zod.string().email(),
    password : zod.string(),
    firstName : zod.string(),
    lastName : zod.string()     
    })
    const signinSchema = zod.object({
        username : zod.string.email(),
        password : zod.string()
    })


router.post("/signup",async(req,res)=>{
    const body = req.body;
    const {success} = signupSchema.safeParse(body);
    if (!success) {
        return res.status(411).json({
            message : "Email already taken / Incorrect Inputs"
        })
    }
    const existingUser = await User.findOne({
    username : body.username
})
if (existingUser._id) {
    return res.status(411).json({
    message : "Email already taken / Incorrect Inputs"
    })
}
const dbUser =  await User.create(body);
const token = jwt.sign({
    userId : dbUser._id
},JWT_Secret)
res.status(200).json({
message : "User created successfully",
token : token 
})

})

router.post("/signin",async(req,res)=>{
    const body = req.body;
    const {success} = signinSchema.safeParse(body);
    if (!success) {
        res.status(411).json({
            message : "Incorrect Inputs"
        })
}
const user = await User.findOne({
    username : req.body.username,
    password : req.body.password
});
if (user) {
    const token = jwt.sign({
        userId : user._id
    },JWT_Secret);
    res.status(200).json({
        message : "Signed-In successful",
        token : token
    })
    return
}
res.status(411).json({
    message : "Error while logging in"
})
})

module.exports = router;