import mongoose from "mongoose";
import { dbName } from "../constants.js";

const dbConnection = async () => {
    await mongoose.connect(`${process.env.MONGO_URI}`, {
        dbName: dbName
    }).then((res) => {
        console.log("DATABASE CONNECTED SUCCUSSFULLY !!", `DB HOST: ${res.connection.host}`);
    }).catch((error) => {
        console.log("DATABASE connected FAILED", error);
        process.exit(1)
    })

}

export default dbConnection;