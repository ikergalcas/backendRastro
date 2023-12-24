import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    contacto: {
        type: String,
    },
    foto: {
        type: String,
        default: "http://res.cloudinary.com/dten77l85/image/upload/v1702144932/e3u40bht3yjtycbck0ko.png"
    },
    ubicacion:{
        type: String,
    },
    lat: {
        type: Number,
        default: 0
    },
    lon: {
        type: Number,
        default: 0
    },
    username: {
        type: String,
        //(en principio lo quito pq en la bdd no esta puesto asi)
        //required: true, //Esto hace que sea obligatorio que este atributo tenga un valor
        //trim: true,     //Esto hace que si hay espacios no los tiene en cuenta

    },
    correo: {
        type: String,
        unique: true
    },
    valoracionMedia: {
        type:Number,
        default: 0
    },
    expiracionToken:{
        type: Date
    },
    tokenId: {
        type: String
    }
},{ versionKey: false });

export default mongoose.model('usuarios', userSchema)