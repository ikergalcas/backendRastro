//Desde index.js arrancamos el backend

import app from '../apps/appProducto.js'  //Como el fichero app.js es creado por nosotros debemos indicar la direccion
import {connectDB} from '../db.js'   //Uso las llaves pq no he hecho export default

connectDB()
app.listen(3001)
console.log('Server on port', 3001)
