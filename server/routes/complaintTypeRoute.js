const express = require('express')
const routes = express.Router();
const ComplaintType = require('../model/ComplaintType');


routes.post('/',async(req,res)=>{
    try{
        const {name,description} = req.body
        const data = await ComplaintType.findOne({name:name})
        if(data){
            return res.json({msg:"Complaint Type already Exist"})
        }
        const saveComplaint = await new ComplaintType({name:name,description:description})
        saveComplaint.save();
    }
    catch(er){
        console.log(er);
        res.json({msg:"Complaint type not added"})
        
    }
});
routes.get('/',async(req,res)=>{
    try{
        const data = await ComplaintType.find().lean();
        res.json({msg:"Complaint type fetched",data:data})
    }catch(er){
        console.log(er);
        res.json({msg:"Complaint type not fetched "})
        
    }
});
routes.patch('/:id',async(req,res)=>{
    try{
        const data = await ComplaintType.findByIdAndUpdate(req.params.id,req.body);
        res.json({msg:"Complaint type updated Successfully"})
    }
    catch(er){
        res.json({msg:"complaint type not update"})
    }
});
routes.delete('/:id',async(req,res)=>{
    try{
        const data = await ComplaintType.findByIdAndDelete(req.params.id)
        res.json({msg:"Complaint type deleted"})
    }catch(er){
        console.log(er);
        
        res.json({msg:"Complaint type not deleted"})
    }
})
module.exports =  routes;