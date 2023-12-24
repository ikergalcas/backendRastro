import Producto from "../models/ProductoModel.js";
import Usuario from "../models/UsuarioModel.js";
import axios from 'axios'

//------------------NUEVO------------------//
// Consulta que se ejecuta en ShowProductos (inicio de la app) 
// Buscamos productos que no esten en venta
// Devolvemos ubi del usuario para centrar el mapa en su ubicacion
export const getProductosInicioConLogin = async (req, res) => {
    try {
        const { idUsuario } = req.params

        const productos = await Producto.find({vendido : false})

        const usuario = await Usuario.findById(idUsuario)

        res.json({ productos : productos, usuario : usuario})
    } catch (error) {
        console.log("error al obtener productos en venta")
        res.status(500).json({ message: 'Error al obtener productos en venta' })
    }
}

//------------------NUEVO------------------//
// Consulta que se ejecuta en ShowProductos (inicio de la app) 
// Buscamos productos que no esten en venta
export const getProductosInicio = async (req, res) => {
    try {
        const productos = await Producto.find({vendido : false})

        res.json(productos)
    } catch (error) {
        console.log("error al obtener productos en venta")
        res.status(500).json({ message: 'Error al obtener productos en venta' })
    }
}

//------------------NUEVO------------------//
export const cerrarPuja = async (req, res) => {
    try {
        const { idProducto } = req.params

        const producto = await Producto.findById(idProducto);

        if (!producto) {
            console.error('No se pudo obtener el producto');
            return res.status(500).json({ message: 'Error al cerrar la puja', error: 'No se pudo actualizar el producto' });
        }

        var user = -1

        //Conseguimos el id del usuario con la mayor puja
        for(const puja of producto.pujas) {
            if(puja.precio === producto.maximaPuja) {
                user = puja.usuario
            }
        }
        
        console.log("CIERRE DE PUJA: " + user)

        //ASIGNAMOS EL CAMPO COMPRADOR Y PONEMOS VENDIDO A TRUE
        //Con new: true hago que devuelva el objeto actualizado y de esta manera lo devuelvo en el res.json
        var actualizado = await Producto.findByIdAndUpdate(idProducto, { vendido: true }, { new: true })
        var comprador = await Usuario.findById(user)
        console.log("Objeto comprador: " + comprador)
        console.log("Id comprador: " + user)
        res.json({id : user, comprador : comprador })

    } catch (error) {
        console.log("error al cerrar puja")
        res.status(500).json({ message: 'Error al cerrar puja' })
    }
}

//------------------NUEVO------------------//
//HAY QUE MANDAR CORREO A COMPRADOR Y VENDEDOR
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

        var user = -1
        console.log("Pujas: " + producto.pujas)
        //Conseguimos el id del usuario con la mayor puja
        for(const puja of producto.pujas) {
            if(puja.precio === producto.maximaPuja) {
                user = puja.usuario
            }
        }

        if(Date.now() > producto.fechaCierre && !producto.vendido) {
            if (user == -1) {
                //SE HA CERRADO LA SUBASTA SIN NINGUNA PUJA
                console.log("Usuerio: " + user)
                console.log("Subasta desierta, bajando precio inicial")

                //BAJAMOS PRECIO INICIAL
                //Con new: true hago que devuelva el objeto actualizado y de esta manera lo devuelvo en el res.json
                var precioRebajado = producto.precioInicial*0.9
                precioRebajado = precioRebajado.toFixed(2)
                const fechaActual = new Date()
                const fechaActualizada = fechaActual.setDate(fechaActual.getDate() + 10)
                var actualizado = await Producto.findByIdAndUpdate(idProducto, { precioInicial : precioRebajado, fechaCierre : fechaActualizada, maximaPuja : precioRebajado }, { new: true })
                console.log("Producto vendido: " + actualizado)
                
                res.json({producto : actualizado, idUserMaxPuja : user, comprador : comprador})
            } else {
                //SE HA CERRADO LA SUBASTA -> DEVUELVO EL OBJETO COMPRADOR
                console.log("Id user: " + user)
                var comprador = await Usuario.findById(user)
                
                //ASIGNAMOS PONEMOS VENDIDO A TRUE
                //Con new: true hago que devuelva el objeto actualizado y de esta manera lo devuelvo en el res.json
                var actualizado = await Producto.findByIdAndUpdate(idProducto, { vendido: true }, { new: true })
                console.log("Producto vendido: " + actualizado)
                
                res.json({producto : actualizado, idUserMaxPuja : user, comprador : comprador})
            }
        } else {
            //NO SE HA CERRADO LA SUBASTA -> DEVUELVO COMPRADOR A NULL
            console.log("Usuario: " + user)
            res.json({producto : producto, idUserMaxPuja : user, comprador : null})
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
/*
export const getUbiProducto = async (req, res) => {
    try {
        const {idProducto} = req.params;
        const producto = await Producto.findById(idProducto);
        if(producto) {
            if(producto.lat == -1) {    // Primera consulta a la ubi
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
        } else {
            res.json({latitude : producto.lat, longitude : producto.lon})
        }

    } catch (error) {
        console.log('Error en la consulta de productos en la base de datos: ', error)
        res.status(500).json({ message: 'Error al obtener la localización' })
    }
};
*/

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
        const { descripcion, fechaCierre, foto, precioInicial, titulo, ubicacion, vendedor,peso } = req.body
        let maximaPuja= precioInicial;

        const nominatimEndpoint = 'https://nominatim.openstreetmap.org/search';
        const format = 'json'; 

        const response = await axios.get(`${nominatimEndpoint}?q=${ubicacion}&format=${format}`);

        const firstResult = response.data[0];
        if (!firstResult) {
            return res.status(404).json({ error: 'No se encontraron resultados.' });
        }

        const { lat, lon } = firstResult;


        const newProducto = new Producto({
            descripcion,
            fechaCierre,
            foto,
            precioInicial,
            maximaPuja,
            titulo,
            ubicacion,
            lat,
            lon,
            vendedor,
            peso
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
        console.log("precio: " + updateData.precioInicial)
        const updatedProductAux = await Producto.findByIdAndUpdate(id, updateData, {new: true});

        if(!updatedProductAux){
                return res.status(404).json({message : 'Producto no encontrado' });
        }
        console.log("Producto editado: " + updatedProductAux)
        //Compruebo si la ubicacion ha sido cambiada
        const nominatimEndpoint = 'https://nominatim.openstreetmap.org/search';
        const format = 'json'; 

        const response = await axios.get(`${nominatimEndpoint}?q=${updatedProductAux.ubicacion}&format=${format}`);


        const firstResult = response.data[0];
        if (!firstResult) {
            return res.status(404).json({ error: 'No se encontraron resultados.' });
        }

        const { lat, lon } = firstResult;
        
        if(lat != updatedProductAux.lat || lon != updatedProductAux.lon) {
            const updatedProduct = await Producto.findByIdAndUpdate(id, {lat : lat, lon : lon}, {new: true});
            res.json(updatedProduct)
        } else {
            res.json(updatedProductAux);
        }

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
            $and: [
                {$or:[
                    {descripcion: {$regex: descripcion, $options:"i"}}, 
                    {titulo:{$regex: descripcion, $options:"i"}}
                ]}, {vendido : false}
            ]
            }));

        res.json(listaProductos);

    } catch (error) {
        console.log('Error al filtrar productos por descripcion: ', error)
        res.status(500).json({ message: 'Error al obtener los productos' })
    }
};

export const getProductosPrecioMax= async (req, res) => {
    try {
        const {precio}  = req.body;
        const listaProductos = (await Producto.find({   
            $and: [
                {maximaPuja: {$lte: precio}}, {vendido: false}
            ]      
            }));

        res.json(listaProductos);

    } catch (error) {
        console.log('Error al filtrar productos por precioMax: ', error)
        res.status(500).json({ message: 'Error al obtener los productos' })
    }
};

//--NUEVO--//
export const getProductosRadio = async (req, res) => {
    try {
        const {radio, idUsuario} = req.body

        const usuario = await Usuario.findById(idUsuario)
        const productosSinFiltrar = await Producto.find({vendido : false})

        if(usuario.lat != 0 || usuario.lat != 0) {  //Tiene ubicacion valida
            const productosFiltrados = productosSinFiltrar.filter((producto) => {
                const distancia = getDistanceFromLatLonInKm(
                    usuario.lat,
                    usuario.lon,
                    producto.lat,
                    producto.lon
                )

                return distancia <= radio;
            })

            res.json(productosFiltrados)
        } else {
            //Como no puedo filtrar lo devuelvo todo
            res.json(productosSinFiltrar)
        }

    } catch (error) {
        console.log('Error al filtrar productos por radio de proximidad: ', error)
        res.status(500).json({ message: 'Error al obtener los productos' })
    }
}

export const getProductosDescripcionRadio = async (req, res) => {
    try {
        const {radio, idUsuario, descripcion} = req.body

        const usuario = await Usuario.findById(idUsuario)
        const productosPorDescripcion = (await Producto.find({
            $and: [
                {$or:[
                    {descripcion: {$regex: descripcion, $options:"i"}}, 
                    {titulo:{$regex: descripcion, $options:"i"}}
                ]}, {vendido: false}
            ]
            }));

        if(usuario.lat != 0 || usuario.lat != 0) {  //Tiene ubicacion valida
            const productosFiltrados = productosPorDescripcion.filter((producto) => {
                const distancia = getDistanceFromLatLonInKm(
                    usuario.lat,
                    usuario.lon,
                    producto.lat,
                    producto.lon
                )

                return distancia <= radio;
            })

            res.json(productosFiltrados)
        } else {
            //Como no puedo filtrar lo devuelvo todo
            res.json(productosPorDescripcion)
        }

    } catch (error) {
        console.log('Error al filtrar productos por radio de proximidad y descripcion: ', error)
        res.status(500).json({ message: 'Error al obtener los productos' })
    }
}

export const getProductosPrecioMaxRadio= async (req, res) => {
    try {
        const {radio, idUsuario, precio}  = req.body;

        const usuario = await Usuario.findById(idUsuario)
        const productosPorPrecio = (await Producto.find({         
            $and: [
                {maximaPuja: {$lte: precio}}, {vendido : false}
            ]  
            }));

        console.log("Filtrado por precio: " + productosPorPrecio)
        
        if(usuario.lat != 0 || usuario.lat != 0) {  //Tiene ubicacion valida
            const productosFiltrados = productosPorPrecio.filter((producto) => {
                const distancia = getDistanceFromLatLonInKm(
                    usuario.lat,
                    usuario.lon,
                    producto.lat,
                    producto.lon
                )

                return distancia <= radio;
            })

            console.log("Filtrado por precio y radio: " + productosFiltrados)

            res.json(productosFiltrados)
        } else {
            //Como no puedo filtrar lo devuelvo todo
            console.log("No ha podido filtrar por radio")
            res.json(productosPorPrecio)
        }

    } catch (error) {
        console.log('Error al filtrar productos por radio de proximidad y precioMax: ', error)
        res.status(500).json({ message: 'Error al obtener los productos' })
    }
};

export const getProductosDescripcionPrecioRadio = async (req, res) => {
    try {
        const {descripcion, precio, radio, idUsuario}  = req.body;

        const usuario = await Usuario.findById(idUsuario)
        const productosFiltrados1 = (await Producto.find({
            $and: [
                {$or:[
                    {descripcion: {$regex: descripcion, $options:"i"}}, 
                    {titulo:{$regex: descripcion, $options:"i"}}
                ]},
                { maximaPuja: {$lte: precio} }, { vendido : false }
            ]
            }));

        console.log("Productos filtrados sin radio: " + productosFiltrados1)

        if(usuario.lat != 0 || usuario.lat != 0) {  //Tiene ubicacion valida
            const productosFiltrados2 = productosFiltrados1.filter((producto) => {
                const distancia = getDistanceFromLatLonInKm(
                    usuario.lat,
                    usuario.lon,
                    producto.lat,
                    producto.lon
                )

                return distancia <= radio;
            })
            console.log("Productos filtrados con radio: " + productosFiltrados2)

            res.json(productosFiltrados2)
        } else {
            //Como no puedo filtrar lo devuelvo todo
            res.json(productosFiltrados1)
        }

    } catch (error) {
        console.log('Error al filtrar productos por radio de proximidad, precioMax y descripcion: ', error)
        res.status(500).json({ message: 'Error al obtener los productos' })
    }
}

//--NUEVO//

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
        let transport;
        switch (transporte) {
            case "avion":
                transport="plane";
                break;
            case "barco":
                transport="ship";
                break;

            case "camion":
                transport="truck ";
                break;
            case "tren":
                transport="train";
                break;
            default: 
                transport="truck";
                break;
        }
        
        var latO;
        var lonO;
        var latD;
        var lonD;
        var distancia;
        console.log("u1", ubicacionOrigen, "u2", ubicacionDestino)
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
                console.log("2: Ubicación2 no encontrada");
                }
                
                distancia=getDistanceFromLatLonInKm (latO,lonO,latD,lonD);
                console.log("distancia",distancia,"peso",peso, "transporte", transport)
                //Datos para la peticion huella carbono
                const dataHC = {
                    "type": "shipping",
                    "weight_value": peso,
                    "weight_unit": "g",
                    "distance_value": distancia,
                    "distance_unit": "km",
                    "transport_method": transport
                };
                  
                const options = {
                  method: 'POST',
                  body: JSON.stringify(dataHC),
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer FAEJgvTeItGghJZhfiWJg'
                  }
                };
                const apiUrl = `https://www.carboninterface.com/api/v1/estimates`;
        
                fetch(apiUrl,options) //peticion huella carbono
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    res.json({"carbon":data.data.attributes.carbon_g})
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

export const getHuellaCarbonoNuevo = async (req, res) => {
    try {
        
        const {idComprador} = req.body;
        const {idProducto} =req.body;
        const {transporte} = req.body;
        let transport;
        if (transporte==null){
            transport="truck"
        }
        console.log(transport);

        const comprador = await Usuario.findById(idComprador)
        const ubicacionOrigen = comprador.ubicacion

        const producto = await Producto.findById(idProducto)
        const peso = producto.peso
        const ubicacionDestino = producto.ubicacion

        const vendedor = await Usuario.findById(producto.vendedor)

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
                console.log("1: Ubicación2 no encontrada");
                }
                
                distancia=getDistanceFromLatLonInKm (latO,lonO,latD,lonD);
                console.log("distancia", distancia)
                //Datos para la peticion huella carbono
                const dataHC = {
                    "type": "shipping",
                    "weight_value": peso,
                    "weight_unit": "g",
                    "distance_value": distancia,
                    "distance_unit": "km",
                    "transport_method": `${transport}`
                };
                  
                const options = {
                  method: 'POST',
                  body: JSON.stringify(dataHC),
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer FAEJgvTeItGghJZhfiWJg'
                  }
                };
                const apiUrl = `https://www.carboninterface.com/api/v1/estimates`;
        
                fetch(apiUrl,options) //peticion huella carbono
                .then(response => response.json())
                .then(data => {
                    console.log("Huella de carbono: " + data.data.attributes.carbon_g)
                    console.log("Vendedor: " + vendedor) 
                    console.log("Producto: " + producto)

                    res.json({"huellaCarbono" : data.data.attributes.carbon_g, "vendedor" : vendedor, "producto" : producto, "comprador": comprador})
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
