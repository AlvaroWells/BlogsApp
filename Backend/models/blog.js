// const mongoose = require('mongoose')
import mongoose from 'mongoose'

//* Creamos el esquema que seguirán los blogs al crearse en la base de datos.
const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  likes: {
    type: Number,
    default: 0
  }
})

// Configuramos la transformación de la representación JSON de los documentos de la base de datos.
// Esto cambia la propiedad '_id' del documento a una cadena ('string') y la asigna a la propiedad 'id',
// para mantener la consistencia en la estructura de los datos enviados al frontend.
// También eliminamos las propiedades '_id' y '__v' del objeto 'returnedObject' para evitar enviar datos
// innecesarios al frontend y mejorar el rendimiento y la seguridad de la aplicación.
blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

/* Guardamos la información del esquema de los blogs */
export default mongoose.model('Blog', blogSchema)