import Usuario from '../models/UsuarioModel.js'
import Producto from "../models/ProductoModel.js";
import axios from 'axios'

export const getAllUsuarios = async (req, res) => {
    try {
        const data = await Usuario.find()

        res.json(data)

    } catch (error) {
        console.log('Error en la consulta de usuarios a la base de datos:', error);
        res.status(500).json({ message: 'Error al obtener los usuarios' });
    }
};

export const getUsuarioID = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await Usuario.findById(id);
        res.json(user);

    } catch (error) {
        console.log('Error en la consulta de usuarios a la base de datos:', error);
        res.status(500).json({ message: 'Error al editar un usuario' });
    }
}

export const createUsuario = async (req, res) => {
    try {
        const { contacto, ubicacion, username, valoracionMedia } = req.body

        const newUser = new Usuario({
            contacto,
            ubicacion,
            username,
            valoracionMedia
        })

        await newUser.save()

        res.send(newUser._id)

    } catch (error) {
        console.log('Error en la consulta de usuarios a la base de datos:', error);
        res.status(500).json({ message: 'Error al crear un usuario' });
    }
}

export const editUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body; //la info modificada

        //buscamos user y modificamos
        const updatedUserAux = await Usuario.findByIdAndUpdate(id, updateData, {new: true});

        if(!updatedUserAux){
            return res.status(404).json({message : 'User no encontrado' });
        }

        //Compruebo si la ubicacion ha sido cambiada
        const nominatimEndpoint = 'https://nominatim.openstreetmap.org/search';
        const format = 'json'; 

        const response = await axios.get(`${nominatimEndpoint}?q=${updatedUserAux.ubicacion}&format=${format}`);

        const firstResult = response.data[0];
        if (!firstResult) {
            return res.status(404).json({ error: 'No se encontraron resultados.' });
        }

        const { lat, lon } = firstResult;

        if(lat != updatedUserAux.lat || lon != updatedUserAux.lon) {
            const updatedUser = await Usuario.findByIdAndUpdate(id, {lat : lat, lon : lon}, {new: true});
            res.json(updatedUser)
        } else {
            res.json(updatedUserAux);
        }

    } catch (error) {
        console.log('Error en la consulta de usuarios a la base de datos:', error);
        res.status(500).json({ message: 'Error al editar un usuario' });
    }
}


export const deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        //buscamos user y borramos
        const searchedUser = await Usuario.findByIdAndDelete(id);

        if(!searchedUser){
            return res.status(404).json({message : 'User no encontrado' });
        }
        res.send("borrado")

    } catch (error) {
        console.log('Error en la consulta de usuarios a la base de datos:', error);
        res.status(500).json({ message: 'Error al editar un usuario' });
    }
}

export const getUsuarioNombre = async (req, res) => {
    try {
        const {username}  = req.body;
        const listaUsuarios = (await Usuario.find({username: {$regex: username, $options:"i"}}));

        res.json(listaUsuarios);

    } catch (error) {
        console.log('Error en la consulta de usuarios en la base de datos: ', error)
        res.status(500).json({ message: 'Error al obtener el usuarios' })
    }
};

export const getUsuarioPorId = async (req, res) => {
    try {
        const {idUsuario}  = req.params;
        const user = (await Usuario.findById(idUsuario));

        res.json(user);

    } catch (error) {
        console.log('Error en la consulta de usuarios en la base de datos: ', error)
        res.status(500).json({ message: 'Error al obtener el usuarios' })
    }
};


export const getUsuarioValoracion = async (req, res) => {
    try {
        const {valoracionMedia} = req.body;
        const listaUsuarios = (await Usuario.find({valoracionMedia: {$gte:valoracionMedia}}));

        res.json(listaUsuarios);

    } catch (error) {
        console.log('Error en la consulta de usuarios en la base de datos: ', error)
        res.status(500).json({ message: 'Error al obtener los usuarios' })
    }
};

export const getCompradores = async (req, res) => {
    try {
        const {username}  = req.body;
        const usuario = (await Usuario.findOne({username: username}));
        const listaProductos = (await Producto.find({vendedor: usuario._id}));
        const listaIdCompradores = listaProductos.map((producto) => producto.comprador);

        const listaCompradores = [];
        
        for (const comprador of listaIdCompradores) {
            const compradorObjeto = await Usuario.findById(comprador);
            listaCompradores.push(compradorObjeto);
        }

        res.json(listaCompradores);

    } catch (error) {
        console.log('Error en la consulta de usuarios en la base de datos: ', error)
        res.status(500).json({ message: 'Error al obtener el usuario' })
    }
};

export const getProductosUsuario = async (req, res) => {
    try {
        const {idUsuario, filtro} = req.params;
        var listaProductos = []

        if (filtro == "pujados") {
            const productos = await Producto.find();
            for (const producto of productos) {
                for(const puja of producto.pujas) {
                    if (puja.usuario == idUsuario && !listaProductos.includes(producto)) {
                        listaProductos.push(producto)
                    }
                }
            }
        } else if (filtro == "vendidos") {
            listaProductos = (await Producto.find({vendedor : idUsuario, vendido : true}).sort({fechaCierre: -1}));
        } else if (filtro == "enVenta") {
            listaProductos = (await Producto.find({vendedor : idUsuario, vendido : false}).sort({fechaCierre: -1}));
        } else if (filtro == "comprados") {
            listaProductos = (await Producto.find({comprador : idUsuario}).sort({fechaCierre: -1}));
        } else if (filtro == "pendientes") {
            const productos = await Producto.find();
            for (const producto of productos) {
                for(const puja of producto.pujas) {
                    if (puja.usuario == idUsuario && 
                        !listaProductos.includes(producto) && 
                        puja.precio == producto.maximaPuja &&
                        producto.vendido &&
                        producto.comprador == null) {
                        listaProductos.push(producto)
                    }
                }
            }
        }

        res.json(listaProductos);

    } catch (error) {
        console.log('Error en la consulta de usuarios en la base de datos: ', error)
        res.status(500).json({ message: 'Error al obtener los productos' })
    }
};

export const getProductosUsuarioDescripcion = async (req, res) => {
    try {
        const {idUsuario, filtro} = req.params;
        const {descripcion}  = req.body;
        var listaProductos = []

        if (filtro == "pujados") {
            const productos = await Producto.find({
            $or:[
                {descripcion: {$regex: descripcion, $options:"i"}}, 
                {titulo:{$regex: descripcion, $options:"i"}}
            ]});
            for (const producto of productos) {
                for(const puja of producto.pujas) {
                    if (puja.usuario == idUsuario && !listaProductos.includes(producto)) {
                        listaProductos.push(producto)
                    }
                }
            }
        } else if (filtro == "vendidos") {
            listaProductos = (await Producto.find({vendedor : idUsuario, vendido : true, 
            $or:[
                {descripcion: {$regex: descripcion, $options:"i"}}, 
                {titulo:{$regex: descripcion, $options:"i"}}
            ]}).sort({fechaCierre: -1}));
        } else if (filtro == "enVenta") {
            listaProductos = (await Producto.find({vendedor : idUsuario, vendido : false, 
            $or:[
                {descripcion: {$regex: descripcion, $options:"i"}}, 
                {titulo:{$regex: descripcion, $options:"i"}}
            ]}).sort({fechaCierre: -1}));
        } else if (filtro == "comprados") {
            listaProductos = (await Producto.find({comprador : idUsuario, 
            $or:[
                {descripcion: {$regex: descripcion, $options:"i"}}, 
                {titulo:{$regex: descripcion, $options:"i"}}
            ]}).sort({fechaCierre: -1}));
        } else if (filtro == "pendientes") {
            const productos = await Producto.find({
                $or:[
                {descripcion: {$regex: descripcion, $options:"i"}}, 
                {titulo:{$regex: descripcion, $options:"i"}}
            ]});
            for (const producto of productos) {
                for(const puja of producto.pujas) {
                    if (puja.usuario == idUsuario && 
                        !listaProductos.includes(producto) && 
                        puja.precio == producto.maximaPuja &&
                        producto.vendido &&
                        producto.comprador == null) {
                        listaProductos.push(producto)
                    }
                }
            }
        }

        res.json(listaProductos);

    } catch (error) {
        console.log('Error en la consulta de usuarios en la base de datos: ', error)
        res.status(500).json({ message: 'Error al obtener los productos' })
    }
};

export const getProductosUsuarioPrecioMax= async (req, res) => {
    try {
        const {idUsuario, filtro} = req.params;
        const {precio}  = req.body;
        var listaProductos = []

        if (filtro == "pujados") {
            const productos = await Producto.find({maximaPuja: {$lte: precio}});
            for (const producto of productos) {
                for(const puja of producto.pujas) {
                    if (puja.usuario == idUsuario && !listaProductos.includes(producto)) {
                        listaProductos.push(producto)
                    }
                }
            }
        } else if (filtro == "vendidos") {
            listaProductos = (await Producto.find({vendedor : idUsuario, vendido : true, maximaPuja: {$lte: precio}}).sort({fechaCierre: -1}));
        } else if (filtro == "enVenta") {
            listaProductos = (await Producto.find({vendedor : idUsuario, vendido : false, maximaPuja: {$lte: precio}}).sort({fechaCierre: -1}));
        } else if (filtro == "comprados") {
            listaProductos = (await Producto.find({comprador : idUsuario, maximaPuja: {$lte: precio}}).sort({fechaCierre: -1}));
        } else if (filtro == "pendientes") {
            const productos = await Producto.find({maximaPuja: {$lte: precio}});
            for (const producto of productos) {
                for(const puja of producto.pujas) {
                    if (puja.usuario == idUsuario && 
                        !listaProductos.includes(producto) && 
                        puja.precio == producto.maximaPuja &&
                        producto.vendido &&
                        producto.comprador == null) {
                        listaProductos.push(producto)
                    }
                }
            }
        }

        res.json(listaProductos);

    } catch (error) {
        console.log('Error en la consulta de productos en la base de datos: ', error)
        res.status(500).json({ message: 'Error al obtener los productos' })
    }
};

export const getProductosUsuarioDescripcionPrecioMax = async (req, res) => {
    try {
        const {idUsuario, filtro} = req.params;
        const {descripcion, precio}  = req.body;
        var listaProductos = []

        if (filtro == "pujados") {
            const productos = await Producto.find({
                $or:[
                {descripcion: {$regex: descripcion, $options:"i"}}, 
                {titulo:{$regex: descripcion, $options:"i"}}
            ], maximaPuja: {$lte: precio}});
            for (const producto of productos) {
                for(const puja of producto.pujas) {
                    if (puja.usuario == idUsuario && !listaProductos.includes(producto)) {
                        listaProductos.push(producto)
                    }
                }
            }
        } else if (filtro == "vendidos") {
            listaProductos = (await Producto.find({vendedor : idUsuario, vendido : true, 
                $or:[
                {descripcion: {$regex: descripcion, $options:"i"}}, 
                {titulo:{$regex: descripcion, $options:"i"}}
            ], maximaPuja: {$lte: precio}}).sort({fechaCierre: -1}));
        } else if (filtro == "enVenta") {
            listaProductos = (await Producto.find({vendedor : idUsuario, vendido : false, 
                $or:[
                {descripcion: {$regex: descripcion, $options:"i"}}, 
                {titulo:{$regex: descripcion, $options:"i"}}
            ], maximaPuja: {$lte: precio}}).sort({fechaCierre: -1}));
        } else if (filtro == "comprados") {
            listaProductos = (await Producto.find({comprador : idUsuario, 
                $or:[
                {descripcion: {$regex: descripcion, $options:"i"}}, 
                {titulo:{$regex: descripcion, $options:"i"}}
            ], maximaPuja: {$lte: precio}}).sort({fechaCierre: -1}));
        } else if (filtro == "pendientes") {
            const productos = await Producto.find({
                $or:[
                {descripcion: {$regex: descripcion, $options:"i"}}, 
                {titulo:{$regex: descripcion, $options:"i"}}
            ], maximaPuja: {$lte: precio}});
            for (const producto of productos) {
                for(const puja of producto.pujas) {
                    if (puja.usuario == idUsuario && 
                        !listaProductos.includes(producto) && 
                        puja.precio == producto.maximaPuja &&
                        producto.vendido &&
                        producto.comprador == null) {
                        listaProductos.push(producto)
                    }
                }
            }
        }

        res.json(listaProductos);

    } catch (error) {
        console.log('Error en la consulta de usuarios en la base de datos: ', error)
        res.status(500).json({ message: 'Error al obtener los productos' })
    }
};

// Devuelve una lista de los productos en los que un usuario específico ha pujado
// export const getProductosPujados = async (req, res) => {
//     try {
//         const {idUsuario} = req.params;
//         const listaProductos = await Producto.find();
        
//         const listaFiltrada = []
//         for (const producto of listaProductos) {
//             for(const puja of producto.pujas) {
//                 if (puja.usuario == idUsuario) {
//                     listaFiltrada.push(producto)
//                 }
//             }
//         }

//         res.json(listaFiltrada);

//     } catch (error) {
//         console.log('Error en la consulta de productos en la base de datos: ', error)
//         res.status(500).json({ message: 'Error al obtener los productos' })
//     }
// };

// operación que devuelva los productos ya vendidos de un usuario ordenados por la fecha
// export const getProductosVendidosDeUsuario = async (req, res) => {
//     try {
//         const { idUsuario } = req.params;
//         const listaProductos = (await Producto.find({vendedor : idUsuario, vendido : true}).sort({fechaCierre: -1}));

//         res.json(listaProductos);

//     } catch (error) {
//         console.log('Error en la consulta de productos en la base de datos: ', error)
//         res.status(500).json({ message: 'Error al obtener los productos' })
//     }
// };

// operación que devuelva los productos sin vender de un usuario ordenados por la fecha
// export const getProductosSinVenderDeUsuario = async (req, res) => {
//     try {
//         const { idUsuario } = req.params;
//         const listaProductos = (await Producto.find({vendedor : idUsuario, vendido : false}).sort({fechaCierre: -1}));


//         res.json(listaProductos);

//     } catch (error) {
//         console.log('Error en la consulta de productos en la base de datos: ', error)
//         res.status(500).json({ message: 'Error al obtener los productos' })
//     }
// };

// export const getProductosComprados = async (req, res) => {
//     try {
//         const { idUsuario } = req.params;
//         const listaProductos = (await Producto.find({comprador : idUsuario}).sort({fechaCierre: -1}));

//         res.json(listaProductos);

//     } catch (error) {
//         console.log('Error en la consulta de productos en la base de datos: ', error)
//         res.status(500).json({ message: 'Error al obtener los productos' })
//     }
// };

export const getUbiUsuario = async (req, res) => {
    try {
        const {idUsuario} = req.params;
        const usuario = await Usuario.findById(idUsuario);
        if(usuario) {
            const locationName = usuario.ubicacion;
            //const locationName = "Calle babor, 13, Malaga";
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
                console.log("Ubicación no encontrada");
                }
            })
            .catch(error => {
                console.error("Error en la solicitud de geocodificación: " + error);
            });
        }

    } catch (error) {
        console.log('Error en la consulta de usuarios en la base de datos: ', error)
        res.status(500).json({ message: 'Error al obtener la localización' })
    }
};



