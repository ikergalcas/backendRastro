import express from 'express'
import multer from 'multer'
import cloudinary from 'cloudinary'
import streamifier from 'streamifier'


import { getAllUsuarios, createUsuario, editUsuario, deleteUsuario,getUsuarioNombre,getUsuarioValoracion, 
    getUbiUsuario,getCompradores, getUsuarioPorId, getProductosUsuario, getProductosUsuarioDescripcion, getProductosUsuarioPrecioMax, getProductosUsuarioDescripcionPrecioMax} from '../controllers/UsuarioController.js'

import { getPujasUsuario } from '../controllers/PujaController.js'
//----NUEVO - TEMPORAL----//
import { verificarConexion, verificarTokenGoogle } from '../controllers/LoginController.js';
//----NUEVO - TEMPORAL----//

const routerUsuario = express.Router()

routerUsuario.get('/', getAllUsuarios)
routerUsuario.post('/', createUsuario)
routerUsuario.put('/:id', editUsuario)
routerUsuario.delete('/:id', deleteUsuario)
routerUsuario.post('/username',getUsuarioNombre)
routerUsuario.get('/:idUsuario',getUsuarioPorId)
routerUsuario.post('/valoracion',getUsuarioValoracion)
routerUsuario.get('/:idUsuario/pujas', getPujasUsuario)
routerUsuario.get('/:idUsuario/productos/:filtro',getProductosUsuario) //Filtro: pujados, comprados, vendidos, enVenta
routerUsuario.post('/:idUsuario/descripcionProductos/:filtro',getProductosUsuarioDescripcion)
routerUsuario.post('/:idUsuario/precioProductos/:filtro',getProductosUsuarioPrecioMax)
routerUsuario.post('/:idUsuario/descripcionPrecioProductos/:filtro',getProductosUsuarioDescripcionPrecioMax)
routerUsuario.get('/ubi/:idUsuario', getUbiUsuario)
routerUsuario.post('/compradores',getCompradores)

//----NUEVO - TEMPORAL----//
routerUsuario.get('/loginToken/:token', verificarTokenGoogle)
routerUsuario.get('/conexion/:idUsuario/:tokenId/:token',verificarConexion)
//----NUEVO - TEMPORAL----//

const fileUpload = multer();
cloudinary.config({
  cloud_name: 'dten77l85',
  api_key: '829615256525372',
  api_secret: 'Km6kFadj1HOmPf6mYYyyd6KIMeQ'
});

routerUsuario.post('/subirFoto', fileUpload.single('foto'), function (req, res, next) {
  let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
          let stream = cloudinary.uploader.upload_stream(
            (result, error) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            }
          );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
  };

  async function upload(req) {
    try {
      let result = await streamUpload(req);
      res.status(200).json({ message: 'Imagen subida correctamente', imageUrl: result.url});
    } catch (error) {
      console.log('Error al subir la imagen: ', error)
      res.status(500).json({ message: 'Error al subir la imagen:', error});
    }
  }

  upload(req);
});

export default routerUsuario