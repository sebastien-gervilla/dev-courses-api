import Mongoose from 'mongoose';

export const initDatabaseConnection = async () => {
    try {
        if (!process.env.DBNAME)
            throw Mongoose.MongooseError;

        Mongoose.set('strictQuery', true);
        await Mongoose.connect(process.env.DBNAME);
        console.log("🍃 Database successfully connected\n");
    } catch (error) {
        console.log("Database connection Error : " + error);
    }
}