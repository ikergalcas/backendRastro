import Producto from "../models/ProductoModel.js";

export const getAllComentarios = async (req, res) => {
    try {
        const {idProducto} = req.params
        const data = await Producto.findById(idProducto)

        const comentariosOrdenados = data.comentarios.sort((a, b) => b.fecha < a.fecha);
        //para q se muestre ordenado bien
        const comentariosBuenos = comentariosOrdenados.reverse()
        res.json(comentariosBuenos)

    } catch (error) {
        console.log('Error en la consulta de comentarios en la base de datos: ', error)
        res.status(500).json({ message: 'Error al obtener los comentarios' })
    }
};

export const createComentario = async (req, res) => {
    try {
        const {idProducto} = req.params
        const { usuario, texto } = req.body

        const newComentario = new Object({
            "usuario": usuario,
            "texto": texto
        })

        const data = await Producto.findById(idProducto)
        const listaComentarios = data.comentarios
        listaComentarios.push(newComentario)

        await Producto.findByIdAndUpdate(idProducto, {comentarios:listaComentarios}, {new:true})

        res.send(listaComentarios)

    } catch (error) {
        console.log('Error en la consulta de comentarios a la base de datos:', error);
        res.status(500).json({ message: 'Error al crear un comentarios' });
    }
}

//No se deberia utilizar
export const editComentario = async (req, res) => {
    try {
        const { idComentario, idProducto } = req.params;
        const {texto} = req.body;

        const producto = await Producto.findById(idProducto)
        const listaComentarios = producto.comentarios
        for (const comentario of listaComentarios ) {
            if(comentario._id == idComentario){
                const usuario = comentario.usuario
                const fecha = comentario.fecha 
                const respuesta = comentario.respuesta
                listaComentarios.pull(comentario);
                listaComentarios.push(new Object ({
                    "texto": texto,
                    "usuario": usuario,
                    "fecha": fecha,
                    "respuesta": respuesta
                }));
            }    
        }
        const updatedProducto = await Producto.findByIdAndUpdate(idProducto, {comentarios:listaComentarios}, {new:true})

        if(!updatedProducto){
            return res.status(404).json({message : 'Producto o comentario no encontrado' });
        }
        res.json("editando comentario");

    } catch (error) {
        console.log('Error en la consulta de comentarios a la base de datos:', error);
        res.status(500).json({ message: 'Error al editar un comentarios' });
    }
}

export const crearRespuestaComentario = async (req, res) => {
    try {
        const { idComentario, idProducto } = req.params;
        const {respuesta} = req.body;

        const producto = await Producto.findById(idProducto)
        const listaComentarios = producto.comentarios
        for (const comentario of listaComentarios ) {
            if(comentario._id == idComentario){
                const usuario = comentario.usuario
                const fecha = comentario.fecha 
                const texto = comentario.texto
                listaComentarios.pull(comentario);
                listaComentarios.push(new Object ({
                    "texto": texto,
                    "usuario": usuario,
                    "fecha": fecha,
                    "respuesta": respuesta
                }));
            }    
        }
        const updatedProducto = await Producto.findByIdAndUpdate(idProducto, {comentarios:listaComentarios}, {new:true})

        if(!updatedProducto){
            return res.status(404).json({message : 'Producto o comentario no encontrado' });
        }
        res.json("editando comentario");

    } catch (error) {
        console.log('Error en la consulta de comentarios a la base de datos:', error);
        res.status(500).json({ message: 'Error al editar un comentarios' });
    }
}


export const deleteComentario = async (req, res) => {
    try {
        const { idComentario, idProducto } = req.params;
        const {texto} = req.body;

        const producto = await Producto.findById(idProducto)
        const listaComentarios = producto.comentarios
        for (const comentario of listaComentarios ) {
            if(comentario._id == idComentario){
                listaComentarios.pull(comentario);
            }    
        }
        const updatedProducto = await Producto.findByIdAndUpdate(idProducto, {comentarios:listaComentarios}, {new:true})

        if(!updatedProducto){
            return res.status(404).json({message : 'Producto o comentario no encontrado' });
        }
        res.json("borrando comentario");

    } catch (error) {
        console.log('Error en la consulta de comentarios a la base de datos:', error);
        res.status(500).json({ message: 'Error al editar un comentario' });
    }
}