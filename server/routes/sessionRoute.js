const express = require('express')
const routes = express.Router();
const Session = require('../model/Session')

routes.get('/',async(req,res)=>{
    const data = await Session.find();
    res.json({msg:"Session fetched",data:data})
});
// post api
routes.post('/',async(req,res)=>{
   try{
     const {name,description} = req.body;
    const data = await new Session({
        name:name,
        description:description,
    });
    data.save();
    res.json({msg:"Session Added successfully"})
   }
   catch(er){
    console.log(er);
    res.json({msg:"Session not added"})
    
   }
});
routes.patch('/:id',async(req,res)=>{
    try{
        const data = await Session.findByIdAndUpdate(req.params.id,req.body);
        res.json({msg:"Session Updated Successfully"})
    }catch(er){
        console.log(er);
        res.json({msg:"Session Not Updated"})
        
    }
});
routes.delete('/:id',async(req,res)=>{
    try{
        const data = await Session.findByIdAndDelete(req.params.id);
        res.json({msg:"Data Deleted Successfully"})
    }catch(er){
        console.log(er);
        res.json("Session not deleted")
        
    }
});
module.exports = routes;