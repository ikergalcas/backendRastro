import { jwtDecode } from 'jwt-decode';
import Usuario from '../models/UsuarioModel.js'

export const verificarTokenGoogle = async (req, res) => {
    try {
        const {token} = req.params
        var userObjetct = jwtDecode(token)
        var epochExpire = userObjetct.exp

        const user = (await Usuario.find({correo: userObjetct.email}));
        
        console.log(user)
        if(user[0]!=null){
            let updateData ={
                "correo": userObjetct.email,
                "expiracionToken": new Date((epochExpire+3600)*1000),
                "tokenId": userObjetct.jti
            };
            
            const defUser = await Usuario.findByIdAndUpdate(user[0]._id, updateData, {new: true});

            res.send(defUser._id)
        }else{
            var username= userObjetct.name;
            var correo= userObjetct.email;
            var expiracionToken =new Date((epochExpire+3600)*1000);
            var tokenId = userObjetct.jti;

            const newUser = new Usuario({
                username,
                correo,
                expiracionToken,
                tokenId
            })
    
            await newUser.save()
    
            res.send(newUser._id)
        }
    } catch (error) {
        console.log('Error en la verificacion ', error)
        res.status(500).json({ message: 'Error al verificar el token' })
    }
};

export const verificarConexion = async (req, res) => {
    try {
        const {idUsuario}  = req.params;
        const user = (await Usuario.findById(idUsuario));
        var fechaActual= new Date ()
        fechaActual.setHours(fechaActual.getHours() + 1);

        if(user.expiracionToken < fechaActual){
            res.send("expired");
        }else{
            res.send("ok");
        }

    } catch (error) {
        console.log('Error en la consulta de usuarios en la base de datos: ', error)
        res.status(500).json({ message: 'Error al obtener el usuarios' })
    }
};