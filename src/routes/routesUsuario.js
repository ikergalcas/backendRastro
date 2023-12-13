import express from 'express'
import multer from 'multer'
import cloudinary from 'cloudinary'

const upload = multer();  // Indica el directorio donde multer debe almacenar los archivos temporales
cloudinary.config({
    cloud_name: 'dten77l85',
    api_key: '829615256525372',
    api_secret: 'Km6kFadj1HOmPf6mYYyyd6KIMeQ'
});

import { getAllUsuarios, createUsuario, editUsuario, deleteUsuario,getUsuarioNombre,getUsuarioValoracion, 
    getUbiUsuario,getCompradores, getUsuarioPorId, getProductosUsuario, getProductosUsuarioDescripcion, getProductosUsuarioPrecioMax, getProductosUsuarioDescripcionPrecioMax} from '../controllers/UsuarioController.js'

import { getPujasUsuario } from '../controllers/PujaController.js'

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

routerUsuario.post('/subirFoto', upload.single('foto'), async (req, res) => {
    try {
      const foto = req.file;
  
      // Verifica si multer ha creado el archivo temporal correctamente
      if (!foto) {
        return res.status(400).json({ error: 'No se proporcionó el archivo de imagen.' });
      }
  
      // Subir la foto a Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(foto.path, {
        // Puedes agregar opciones adicionales aquí
      });
  
      // Puedes hacer algo con la respuesta de Cloudinary, como almacenar la URL en tu base de datos
      console.log('Foto subida a Cloudinary:', cloudinaryResponse.url);
  
      res.status(200).json({ message: 'Imagen subida correctamente', imageUrl: cloudinaryResponse.url});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al subir la foto a Cloudinary' });
    }
  });

export default routerUsuario