import mongoose, { connect } from "mongoose";
const uri = "mongodb+srv://admin:1234@prova.1kccofr.mongodb.net/?appName=PROVA"

const connectDb = async ()=>{

    try {
        const conn = await mongoose.connect(uri)
        console.log("Connected to database");
        
    } catch (error) {   
        console.log("Problem while trying to connect database :", error)
    }
}


export default connectDb