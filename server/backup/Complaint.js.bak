const mongoose = require('mongoose')
const complaintSchema  = mongoose.Schema({
    complaintType:{
        type:mongoose.Schema.ObjectId,
        ref:"ComplaintType"
    },
    complaint:{
        type:String,
        required:true
    },
    studentId:{
        type:mongoose.Schema.ObjectId,
        ref:"Student"
    },
    status:{
        type:String,
        enum:['notProcessed','pending','closed'],
        default:'notProcessed'
    }
},{
    timestamps:true
});
module.exports = mongoose.model('Complaint',complaintSchema)