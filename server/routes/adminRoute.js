const express = require('express')
const Admin = require('../model/Admin')
const routes = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
routes.post('/',async(req,res)=>{
    try{
        const {email, password} = req.body;
        const data = await Admin.findOne({email:email});
        if(data){
            return res.json({msg:"Email Already Exist"})
        }
        const adminCount = await Admin.countDocuments();
        if(adminCount>0){
            return res.json({msg:"Admin ALready Registered"})
        }
        const passwordHash = await bcrypt.hash(password,10);
       const adminReg =  await new Admin({email:email,password:passwordHash});
        res.json("Admin Registered Successfully")
    }catch(er){
        console.log(er);
        res.json({msg:"Sorry try again"})
        
    }
});
// login route
routes.post('/login',async(req,res)=>{
    try{
        const {email,password} = req.body;
        const data = await Admin.findOne({email:email})
        if(!data){
            return res.json({msg:"Email Not Matched"})
        }
        const pass = await bcrypt.compare(password,data.password)
        if(!pass){
            return res.json({msg:"Password Not Matched"})
        }
        const token = jwt.sign({id:data._id},process.env.JWT_SECRET,{expiresIn:"1d"});
        res.json({
            msg:"Login Successfully",
            token:token,
            role:"Admin",
            id:data._id
        });
    }
    catch(er){
        console.log(er);
        res.json({msg:"Admin login failed"})
        
    }
})
module.exports = routes