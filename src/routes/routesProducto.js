import express from 'express'
import multer from 'multer'
import cloudinary from 'cloudinary'
import streamifier from 'streamifier'

import { getAllProductos, createProducto, editProducto, deleteProducto,getProductosdeUsuario,getProductosDescripcion,
    getHuellaCarbono,getProductosPrecioMax, getProductosDescripcionPrecio, /*getUbiProducto,*/ getProductoPorId, valoracion, 
    nuevaImagen, checkeo, cerrarPuja, getHuellaCarbonoNuevo, getProductosInicio, getProductosInicioConLogin, getProductosRadio,
    getProductosDescripcionPrecioRadio, getProductosPrecioMaxRadio, getProductosDescripcionRadio } from '../controllers/ProductoController.js'

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
routerProducto.get('/inicio/mostrar', getProductosInicio)  //--NUEVO--//
routerProducto.get('/:idUsuario/inicio', getProductosInicioConLogin) //--NUEVO--//
routerProducto.post('/preciomax',getProductosPrecioMax)
routerProducto.post('/radio', getProductosRadio)  //--NUEVO--//
routerProducto.post('/descripcionPrecio',getProductosDescripcionPrecio)
routerProducto.post('/radioPrecio', getProductosPrecioMaxRadio)   //--NUEVO--//
routerProducto.post('/descripcionRadio', getProductosDescripcionRadio)  //--NUEVO--//
routerProducto.post('/descripcionRadioPrecio', getProductosDescripcionPrecioRadio)  //--NUEVO--//
routerProducto.post('/huellaCarbono',getHuellaCarbono)
routerProducto.put('/valoracion/calculoValoracion', valoracion)  
routerProducto.put('/:idProducto/nuevaImagen', nuevaImagen) 
routerProducto.put('/:idProducto/checkeo', checkeo) 
routerProducto.put('/:idProducto/cerrarPuja', cerrarPuja) 
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

//--NUEVO
routerProducto.post('/huellaCarbonoNuevo', getHuellaCarbonoNuevo)
//--NUEVO

const fileUpload = multer();
cloudinary.config({
  cloud_name: 'dten77l85',
  api_key: '829615256525372',
  api_secret: 'Km6kFadj1HOmPf6mYYyyd6KIMeQ'
});

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