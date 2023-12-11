import Producto from "../models/ProductoModel.js";
import Usuario from "../models/UsuarioModel.js";


//------------------NUEVO------------------//
export const cerrarPuja = async (req, res) => {
    try {
        const { idProducto } = req.params

        const producto = await Producto.findById(idProducto);

        if (!producto) {
            console.error('No se pudo actualizar el producto');
            return res.status(500).json({ message: 'Error al cerrar la puja', error: 'No se pudo actualizar el producto' });
        }

        var user = -1
            for(const puja of producto.pujas) {
                if(puja.precio === producto.maximaPuja) {
                    user = puja.usuario
                }
            }

            //ASIGNAMOS EL CAMPO COMPRADOR Y PONEMOS VENDIDO A TRUE
            //Con new: true hago que devuelva el objeto actualizado y de esta manera lo devuelvo en el res.json
            var actualizado = await Producto.findByIdAndUpdate(idProducto, { comprador: user, vendido: true }, { new: true })
            res.json(actualizado)

    } catch (error) {
        console.log("error al cerrar puja")
        res.status(500).json({ message: 'Error al cerrar puja' })
    }
}

//------------------NUEVO------------------//
export const checkeo = async (req, res) => {
    try {
        const { idProducto } = req.params;

        console.log("antes de consulta")

        const producto = await Producto.findById(idProducto);

        console.log("Despues de consulta: " + producto)
        if (!producto) {
            console.error('No se pudo actualizar el producto');
            return res.status(500).json({ message: 'Error al cerrar la puja', error: 'No se pudo actualizar el producto' });
        }

        if(Date.now() > producto.fechaCierre && !producto.vendido) {
            var user = -1
            
            for(const puja of producto.pujas) {
                console.log("entra en bucle")
                if(puja.precio === producto.maximaPuja) {
                    console.log("entra en if [precio, max]:" + puja.precio + " " + producto.maximaPuja)
                    user = puja.usuario
                }
            }

            console.log("Despues bucle, comprador: " + user)
            //ASIGNAMOS EL CAMPO COMPRADOR Y PONEMOS VENDIDO A TRUE
            //Con new: true hago que devuelva el objeto actualizado y de esta manera lo devuelvo en el res.json
            var actualizado = await Producto.findByIdAndUpdate(idProducto, { comprador: user, vendido: true }, { new: true })
            console.log("Producto vendido: " + actualizado)
            res.json(actualizado)
        } else {
            res.json(producto)
        }

    } catch (error) {
        console.log("error al hacer el checkeo de producto")
        res.status(500).json({ message: 'Error al hacer checkeo de producto' })
    }
}

//------------------NUEVO------------------//
export const nuevaImagen = async (req, res) => {
    try {
        const { idProducto } = req.params;
        const { imagen } = req.body;  // Supongamos que recibes la URL de la nueva foto en el cuerpo de la solicitud

        const producto = await Producto.findById(idProducto);

        const imagenes = producto.imagenes || [];

        imagenes.push(imagen);

        await Producto.findByIdAndUpdate(idProducto, { imagenes });

        res.json({ message: 'Nueva foto añadida con éxito', imagenes });

    } catch (error) {
        console.log('Error al añadir una nueva foto al producto:', error);
        res.status(500).json({ message: 'Error al añadir una nueva foto al producto' });
    }
}

//------------------NUEVO------------------//
//numero de productos valorados de un usuario (VALORACION)
export const valoracion = async (req, res) => {
    try {
        // Obtener parámetros desde query o body
        const { idUsuario, idProducto, fiabilidad, calidad, valorComprador } = req.body;

        //-------------Actualizar el producto con idProducto a valorado = true-------------
        var producto = await Producto.findById(idProducto);
        
        var valoracionNueva
        var mediaNueva
        var valoraciones

        //--Dependiendo de si es el comprador o vendedor calculare la nueva valoracion de una forma distinta--
        if(idUsuario == producto.comprador) {      //Soy el comprador, valoro al vendedor  

            //---Actualizo atributo valoracion para el vendedor---
            await Producto.findByIdAndUpdate(idProducto, { valoracionVendedor: true })

            //---Calculo valoracion nueva---
            valoracionNueva = (fiabilidad + calidad) / 2;

            //-------------Obtener el número de productos valorados del vendedor de idProducto-------------------
            const vendidos = await Producto.find({ vendedor: producto.vendedor, valoracionVendedor: true });
            const comprados = await Producto.find({ comprador: producto.vendedor, valoracionComprador: true });
            valoraciones = vendidos.length + comprados.length;


            // Obtener el usuario a valorar mediante su id
            const vendedor = await Usuario.findById(producto.vendedor);
            
            if (!vendedor) {
                return res.status(404).json({ message: 'Vendedor no encontrado' });
            }

            //---------------Calcular la nueva valoracionMedia del usuario (en este caso el comprador)----
            mediaNueva = ((vendedor.valoracionMedia * (valoraciones-1)) + valoracionNueva) / (valoraciones);
            mediaNueva = Math.round(mediaNueva)
       
            //---------------Actualizar el atributo valoracionMedia del vendedor---------------
            await Usuario.findByIdAndUpdate(vendedor._id, { valoracionMedia: mediaNueva });

        } else if(idUsuario == producto.vendedor){    //Viceversa
            //---Actualizo atributo valoracion para el comprador
            await Producto.findByIdAndUpdate(idProducto, { valoracionComprador: true })
            valoracionNueva = valorComprador 

            //-------------Obtener el número de productos valorados del comprador de idProducto-------------------
            const vendidos = await Producto.find({ vendedor: producto.comprador, valoracionVendedor: true });
            const comprados = await Producto.find({ comprador: producto.comprador, valoracionComprador: true });
            valoraciones = vendidos.length + comprados.length;

            // Obtener el usuario a valorar mediante su id
            const comprador = await Usuario.findById(producto.comprador);
            
            if (!comprador) {
                return res.status(404).json({ message: 'Comprador no encontrado' });
            }

            if(valoraciones == 0) {
                mediaNueva = valoracionNueva
            } else {
                //---------------Calcular la nueva valoracionMedia del usuario (en este caso el comprador)----
                mediaNueva = ((comprador.valoracionMedia * (valoraciones-1)) + valoracionNueva) / (valoraciones);
                mediaNueva = Math.round(mediaNueva)
            }

            //---------------Actualizar el atributo valoracionMedia del vendedor---------------
            await Usuario.findByIdAndUpdate(comprador._id, { valoracionMedia: mediaNueva });
        }else {
            res.json({mensaje: "sa rallao", user: idUsuario, comprador: producto.comprador})
        }


        res.json({MediaNueva: mediaNueva, ValoracionNueva: valoracionNueva, fiab: fiabilidad, cal: calidad, valoracionComprador: valorComprador, Valoraciones: valoraciones });

    } catch (error) {
        console.log('Error en la consulta de obtener productos vendidos de un usuario:', error);
        res.status(500).json({ message: 'Error al obtener productos vendidos de un usuario' });
    }
}

export const getAllProductos = async (req, res) => {
    try {
        const data = await Producto.find()

        res.json(data)

    } catch (error) {
        console.log('Error en la consulta de productos en la base de datos: ', error)
        res.status(500).json({ message: 'Error al obtener los productos' })
    }
};

export const getUbiProducto = async (req, res) => {
    try {
        const {idProducto} = req.params;
        const producto = await Producto.findById(idProducto);
        if(producto) {
            const locationName = producto.ubicacion;
            
            const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`;
            
            fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                const firstResult = data[0];
                const latitude = parseFloat(firstResult.lat);
                const longitude = parseFloat(firstResult.lon);
                res.json({latitude, longitude});
                } else {
                console.log("Ubicación de producto no encontrada");
                }
            })
            .catch(error => {
                console.error("Error en la solicitud de geocodificación: " + error);
            });
        }

    } catch (error) {
        console.log('Error en la consulta de productos en la base de datos: ', error)
        res.status(500).json({ message: 'Error al obtener la localización' })
    }
};


export const getProductoPorId = async (req, res) => {
    try {
        const {idProducto}  = req.params;
        const product = (await Producto.findById(idProducto));

        res.json(product);

    } catch (error) {
        console.log('Error en la consulta de productos en la base de datos: ', error)
        res.status(500).json({ message: 'Error al obtener el producto' })
    }
};

export const createProducto = async (req, res) => {
    try {
        const { descripcion, fechaCierre, foto, historialPujas, precioInicial, titulo, ubicacion, vendedor } = req.body
        let maximaPuja= precioInicial;
        const newProducto = new Producto({
            descripcion,
            fechaCierre,
            foto,
            historialPujas,
            maximaPuja,
            precioInicial,
            titulo,
            ubicacion,
            vendedor
        })

        newProducto.maximaPuja = precioInicial

        await newProducto.save()

        const idNuevoProducto = newProducto._id;

        res.send(idNuevoProducto)

    } catch (error) {
        console.log('Error en la consulta de productos a la base de datos:', error);
        res.status(500).json({ message: 'Error al crear un producto' });
    }
}

export const editProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body; //la info modificada
        
        //buscamos user y modificamos
        const updatedProducto = await Producto.findByIdAndUpdate(id, updateData, {new: true});

        if(!updatedProducto){
            return res.status(404).json({message : 'Producto no encontrado' });
        }
        res.json(updatedProducto);

    } catch (error) {
        console.log('Error en la consulta de productos a la base de datos:', error);
        res.status(500).json({ message: 'Error al editar un producto' });
    }
}


export const deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;

        //buscamos user y borramos
        const searchedProducto = await Producto.findByIdAndDelete(id);

        if(!searchedProducto){
            return res.status(404).json({message : 'Producto no encontrado' });
        }
        res.send("borrado")

    } catch (error) {
        console.log('Error en la consulta de productos a la base de datos:', error);
        res.status(500).json({ message: 'Error al editar un producto' });
    }
}

// operación que devuelva los productos ofertados por un usuario ordenados por la fecha
export const getProductosdeUsuario = async (req, res) => {
    try {
        const { idUsuario } = req.params;
        const listaProductos = (await Producto.find({vendedor : idUsuario}).sort({fechaCierre: -1}));

        res.json(listaProductos);

    } catch (error) {
        console.log('Error en la consulta de productos en la base de datos: ', error)
        res.status(500).json({ message: 'Error al obtener los productos' })
    }
};

//obtener productos por descripcion
export const getProductosDescripcion = async (req, res) => {
    try {
        const {descripcion}  = req.body;
        const listaProductos = (await Producto.find({
            $or:[
                {descripcion: {$regex: descripcion, $options:"i"}}, 
                {titulo:{$regex: descripcion, $options:"i"}}
            ]}));

        res.json(listaProductos);

    } catch (error) {
        console.log('Error en la consulta de productos en la base de datos: ', error)
        res.status(500).json({ message: 'Error al obtener los productos' })
    }
};

export const getProductosPrecioMax= async (req, res) => {
    try {
        const {precio}  = req.body;
        const listaProductos = (await Producto.find({         
                maximaPuja: {$lte: precio}
            }));

        res.json(listaProductos);

    } catch (error) {
        console.log('Error en la consulta de productos en la base de datos: ', error)
        res.status(500).json({ message: 'Error al obtener los productos' })
    }
};

export const getProductosDescripcionPrecio = async (req, res) => {
    try {
        const {descripcion, precio}  = req.body;
        const listaProductos = (await Producto.find({
            $and: [
                {$or:[
                    {descripcion: {$regex: descripcion, $options:"i"}}, 
                    {titulo:{$regex: descripcion, $options:"i"}}
                ]},
                { maximaPuja: {$lte: precio} }
            ]
            }));

        res.json(listaProductos);

    } catch (error) {
        console.log('Error en la consulta de productos en la base de datos: ', error)
        res.status(500).json({ message: 'Error al obtener los productos' })
    }
};

//calcular desde ubicacion origen y ubicaion destino por hacer, combina openstreetmap y huella carbono
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
    }
    
    function deg2rad(deg) {
    return deg * (Math.PI/180)
};

export const getHuellaCarbono = async (req, res) => {
    try {
        const {ubicacionOrigen} = req.body;
        const {ubicacionDestino} =req.body;
        const {peso} = req.body;
        const {transporte} = req.body;
        var latO;
        var lonO;
        var latD;
        var lonD;
        var distancia;

        //const locationName = "Calle babor, 13, Malaga";
        const apiUrl1 = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ubicacionOrigen)}`;
        const apiUrl2 = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ubicacionDestino)}`;

        fetch(apiUrl1) //peticion ubicacion Origen
        .then(response => response.json())
        .then(dataU1 => {
            if (dataU1 && dataU1.length > 0) {
            const firstResult = dataU1[0];
            latO = parseFloat(firstResult.lat);
            lonO = parseFloat(firstResult.lon);
            } else {
            console.log("Ubicación1 no encontrada");
            }
            ///////////
            fetch(apiUrl2)//peticion ubicacion Destino
            .then(response => response.json())
            .then(dataU2 => {
                if (dataU2 && dataU2.length > 0) {
                const firstResult2 = dataU2[0];
                latD= parseFloat(firstResult2.lat);
                lonD = parseFloat(firstResult2.lon);
                } else {
                console.log("Ubicación2 no encontrada");
                }
                
                distancia=getDistanceFromLatLonInKm (latO,lonO,latD,lonD);
                
                //Datos para la peticion huella carbono
                const dataHC = {
                    "type": "shipping",
                    "weight_value": peso,
                    "weight_unit": "g",
                    "distance_value": distancia,
                    "distance_unit": "km",
                    "transport_method": `${transporte}`
                };
                  
                const options = {
                  method: 'POST',
                  body: JSON.stringify(dataHC),
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer wxfLsXHV9f8w4hmXKSxA'
                  }
                };
                const apiUrl = `https://www.carboninterface.com/api/v1/estimates`;
        
                fetch(apiUrl,options) //peticion huella carbono
                .then(response => response.json())
                .then(data => {
                    res.json(data.data.attributes.carbon_g)
                })  
                .catch(error => {
                    console.error("Error en la solicitud de huella de carbono: " + error);
                });
            })
            .catch(error => {
                console.error("Error en la solicitud de geocodificación1: " + error);
            });
        })
        .catch(error => {
            console.error("Error en la solicitud de geocodificación2: " + error);
        });

    } catch (error) {
        
    }
};
