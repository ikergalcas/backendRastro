import express from 'express'
import multer from 'multer'
import cloudinary from 'cloudinary'
import streamifier from 'streamifier'

const fileUpload = multer();  // Indica el directorio donde multer debe almacenar los archivos temporales
cloudinary.config({
    cloud_name: 'dten77l85',
    api_key: '829615256525372',
    api_secret: 'Km6kFadj1HOmPf6mYYyyd6KIMeQ'
});

import { getAllProductos, createProducto, editProducto, deleteProducto,getProductosdeUsuario,getProductosDescripcion,
    getHuellaCarbono,getProductosPrecioMax, getProductosDescripcionPrecio, getUbiProducto, getProductoPorId, valoracion, nuevaImagen, checkeo, cerrarPuja } from '../controllers/ProductoController.js'

import { getAllPujas, createPuja, deletePuja, editPuja, getPujasPrecio } from '../controllers/PujaController.js'

import { crearRespuestaComentario, createComentario, deleteComentario, editComentario, getAllComentarios } from '../controllers/ComentarioController.js';
 
const routerProducto = express.Router()

routerProducto.get('/', getAllProductos)
routerProducto.post('/', createProducto)
routerProducto.put('/:id', editProducto)
routerProducto.delete('/:id', deleteProducto)
routerProducto.get('/:idProducto', getProductoPorId)
routerProducto.get('/usuario/:idUsuario',getProductosdeUsuario)
routerProducto.post('/descripcion',getProductosDescripcion)
routerProducto.post('/preciomax',getProductosPrecioMax)
routerProducto.post('/descripcionPrecio',getProductosDescripcionPrecio)
routerProducto.post('/huellaCarbono',getHuellaCarbono)
routerProducto.put('/valoracion/calculoValoracion', valoracion)  //--NUEVO--
routerProducto.put('/:idProducto/nuevaImagen', nuevaImagen) //--NUEVO--
routerProducto.put('/:idProducto/checkeo', checkeo) //--NUEVO-- CHECKEAMOS SI HA TERMINADO LA PUJA Y DEVOLVEMOS EL PRODUCTO
routerProducto.put('/:idProducto/cerrarPuja', cerrarPuja) //--NUEVO--
routerProducto.get('/:idProducto/pujas',getAllPujas)
routerProducto.put('/:idProducto/crearPuja',createPuja)
routerProducto.put('/:idProducto/editPuja/:idPuja',editPuja)
routerProducto.put('/:idProducto/deletePuja/:idPuja',deletePuja)
routerProducto.get('/:idProducto/pujasPrecio/',getPujasPrecio)
routerProducto.get('/:idProducto/comentarios',getAllComentarios)
routerProducto.put('/:idProducto/crearComentario',createComentario)
routerProducto.put('/:idProducto/editComentario/:idComentario',editComentario)
routerProducto.put('/:idProducto/crearRespuestaComentario/:idComentario',crearRespuestaComentario)
routerProducto.put('/:idProducto/deleteComentario/:idComentario',deleteComentario)
routerProducto.get('/:idProducto/ubicacion', getUbiProducto)

routerProducto.post('/subirFoto', fileUpload.single('foto'), function (req, res, next) {
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

export default routerProducto