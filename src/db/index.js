import mongoose from "mongoose";
import {DB_NAME} from '../constants.js'

const connectDb = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`)
        console.log(`DataBase Connected !!!! , DB_HOST - ${connectionInstance.connection.host}`)
        // console.log(connectionInstance);
    } catch (error) {
        console.log(`Error in connection Database`, error);
    }
}

export default connectDb;