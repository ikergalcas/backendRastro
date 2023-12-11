import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    descripcion: {
        type: String
    },
    fechaCierre: {
        type: Date
    },
    foto: {
        type: String,
        default: "http://res.cloudinary.com/dten77l85/image/upload/v1701645989/hfxempzbqlkawdekvuxy.jpg"
    },
    imagenes: {
        type:[String],
        default: []
    },
    precioInicial: {
        type: Number
    },
    maximaPuja: {
        type: Number
    },
    titulo: {
        type: String
    },
    ubicacion: {
        type: String 
    },
    vendedor: {
        type: mongoose.Schema.Types.ObjectId,  
        ref: 'usuarios',
    },
    comprador: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'usuarios',
        default: null
    },
    vendido: {
        type: mongoose.Schema.Types.Boolean, 
        default: false
    },
    valoracionVendedor: {
        type: mongoose.Schema.Types.Boolean, 
        default: false
    },
    valoracionComprador: {
        type: mongoose.Schema.Types.Boolean, 
        default: false
    },
    comentarios: {
        type: [ 
            {usuario: {
                type: mongoose.Schema.Types.ObjectId,
                require: true
            },
            texto: {
                type: String,
                require: true
            },
            fecha: {
                type: Date,
                default: Date.now()
            },
            respuesta: {
                type: String,
                default: ""
            }}
        ],
        default:[]
    },
    pujas: {
        type: [ 
            {precio: {
                type: Number,
            },
            usuario: {
                type: mongoose.Schema.Types.ObjectId,  
                ref: 'usuarios',  
            }}
        ],
        default:[]
    }

},{ versionKey: false });

export default mongoose.model('productos', productSchema)