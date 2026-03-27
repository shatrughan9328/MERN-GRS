const mongoose = require('mongoose')

const mongoDB  = ()=>{ 
    mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("Database connected");
    
})
.catch(()=>{
    console.log("DB Not Connected");
})
}

module.exports = mongoDB;