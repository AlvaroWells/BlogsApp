import mongoose from "mongoose";

/* Creamos esquema de usuario con mongoose */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3
  },
  name: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ]
})
/* Transformamos la información a JSON que recivimos de la base de datos y la borramos de la api para no mostrar información innecesaria o comprometida */
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

/* Guardamos la información del esquema del usuario */
export default mongoose.model('User', userSchema)