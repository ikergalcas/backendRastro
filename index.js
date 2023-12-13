//Desde index.js arrancamos el backend

import appProducto from './src/apps/appProducto.js'  //Como el fichero app.js es creado por nosotros debemos indicar la direccion
import appUsuario from './src/apps/appUsuario.js'
import {connectDB} from './src/db.js'   //Uso las llaves pq no he hecho export default

connectDB()
appProducto.listen(3001)
console.log('Server Productos on port', 3001)
appUsuario.listen(3003)
console.log('Server Usuarios on port', 3003)


