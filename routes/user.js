const express = require("express");
const {authMiddleware} = require("../middleware/user");
const router = express.Router();
const zod = require("zod");
const {User, Account} = require("../db");
const JWT_Secret = require("../config");
const jwt = require("jsonwebtoken")

const signupSchema = zod.object({
    username : zod.string().email(),
    password : zod.string(),
    firstName : zod.string(),
    lastName : zod.string()     
    })
    const signinSchema = zod.object({
        username : zod.string().email(),
        password : zod.string()
    })
    const updateSchema = zod.object({
        password : zod.string().optional(),
        firstName : zod.string().optional(),
        lastName : zod.string().optional()
    })

//Signup Route
router.post("/signup",async(req,res)=>{
    const body = req.body;
    const {success} = signupSchema.safeParse(body);
    if (!success) {
        return res.status(411).json({
            message : " Incorrect Inputs"
        })
    }
    console.log(body);
    
    const existingUser = await User.findOne({
    username : body.username
    
})
console.log(existingUser);

if (existingUser) {
    return res.status(411).json({
    message : "Email already taken"
    })
}else{
const dbUser = await User.create({
    username: req.body.username,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
})
const userId = dbUser._id;
await Account.create({
    userId,
    balance : 1* Math.random() * 10000
})
const token = jwt.sign({
    userId
},JWT_Secret)
res.status(200).json({
message : "User created successfully",
token : token 
})}}

)
//SignIn Route
router.post("/signin",async(req,res)=>{
    const body = req.body;
    const {success} = signinSchema.safeParse(body);
    if (!success) {
        res.status(411).json({
            message : "Incorrect Inputs"
        })
}
const user = await User.findOne({
    username : body.username,
    password : body.password
});
const userId = user._id


if (user) {
    const token = jwt.sign({
        userId
    },JWT_Secret);
    res.status(200).json({
        message : "Signed-In successful",
        token : token
    })
    return
}else{res.status(411).json({
    message : "Error while logging in"
})}
})
//User update route
router.put("/updateUser",authMiddleware,async(req,res)=>{
    const {success} = updateSchema.safeParse(req.body)
    if (!success) {
        res.status(411).json({
            message : "Error while updating information"
        })
    }
    await User.updateOne({_id : req.userId},req.body);
    res.json({
        message : "Updated successfully"
    })
})

//find Users route
router.get("/bulk",async(req,res)=>{
    const filter = req.query.filter || "";
    const users = await User.find({
        $or : [{
            firstName : {
                "$regex" : filter
            }
        },{
            lastName : {
                "$regex" : filter
            }
        }]
    })
    res.json({
        user : users.map(user => ({
           username : user.username,
           firstName : user.firstName,
           lastName : user.lastName,
           _id : user._id
        }))
    })
})

module.exports = router;