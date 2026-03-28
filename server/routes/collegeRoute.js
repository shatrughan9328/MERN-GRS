const express = require('express')
const routes = express.Router();
const College = require('../model/College')

routes.get('/',async(req,res)=>{
    const data = await College.find();
    res.json({msg:"college fetched",data:data})
});
// post api
routes.post('/',async(req,res)=>{
   try{
     const {name,description} = req.body;
    const data = await new College({
        name:name,
        description:description,
    });
    data.save();
    res.json({msg:"College Added successfully"})
   }
   catch(er){
    console.log(er);
    res.json({msg:"College not added"})
    
   }
});
routes.patch('/:id',async(req,res)=>{
    try{
        const data = await College.findByIdAndUpdate(req.params.id,req.body);
        res.json({msg:"College Updated Successfully"})
    }catch(er){
        console.log(er);
        res.json({msg:"College Not Updated"})
        
    }
});
routes.delete('/:id',async(req,res)=>{
    try{
        const data = await College.findByIdAndDelete(req.params.id);
        res.json({msg:"Data Deleted Successfully"})
    }catch(er){
        console.log(er);
        res.json("College not deleted")
        
    }
});
module.exports = routes;