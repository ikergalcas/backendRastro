import { jwtDecode } from 'jwt-decode';
import Usuario from '../models/UsuarioModel.js';

export const verificarTokenGoogle = async (req, res) => {
    try {
        const {token} = req.params
        var userObjetct = jwtDecode(token)
        var epochExpire = userObjetct.exp

        const user = (await Usuario.findOne({correo: userObjetct.email}));

        let data ={
            "correo": userObjetct.email,
            "expiracionToken": new Date((epochExpire+3600)*1000),
            "tokenId": userObjetct.jti,
            "foto": userObjetct.picture
        };

        if(user != null) {
            res.json({token : data, idUser : user._id})
        } else {
            //REGISTRO USUARIO NUEVO
            var username= userObjetct.name;
            var correo= userObjetct.email;
            var expiracionToken =new Date((epochExpire+3600)*1000);
            var tokenId = userObjetct.jti;

            const newUser = new Usuario({
                username,
                correo
            })
    
            await newUser.save()
    
            res.send({token : data, idUser : newUser._id})
        }

    } catch (error) {
        console.log('Error en la verificacion ', error)
        res.status(500).json({ message: 'Error al verificar el token' })
    }
};


export const verificarConexion = async (req, res) => {
    try {
        const {idUsuario} = req.params;
        const {tokenId, token}  = req.params;
        var userObjetct = jwtDecode(token)
        const user = (await Usuario.findById(idUsuario));

        if (user.correo != userObjetct.email ){
            res.send("sesionChanged")
        }else{
            var epochExpire = new Date ((userObjetct.exp+3600)*1000)

            var fechaActual= new Date ()
            fechaActual.setHours(fechaActual.getHours() + 1);
            
            console.log(fechaActual)

            if(tokenId == userObjetct.jti){
                if(epochExpire < fechaActual){
                    res.send("expired");
                }else{
                    res.send("ok");
                }
            }else{
                res.send("invalid token")
            }
        }


    } catch (error) {
        console.log('Error en la consulta de usuarios en la base de datos: ', error)
        res.status(500).json({ message: 'Error al obtener el usuarios' })
    }
};