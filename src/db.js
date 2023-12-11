import mongoose from 'mongoose' //Mongoose nos permite conectarnos a mongodb y tmb a modelar los datos

export const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://rastroAdmin3:adminadmin@ingweb.xdloocr.mongodb.net/elRastro3')
        console.log("Conexión establecida")        
    } catch (error) {
        console.log(error)
    }
};

