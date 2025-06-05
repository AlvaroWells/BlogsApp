import express, { response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/user.js'


/* Importamos el enrutador para anexar con la api */
const loginRouter = express.Router()


loginRouter.post('/', async (req, res) => {
  try {
    /* Recuperamos el username y la password del cuerpo del request */
    const { username, password } = req.body

    /* Validamos la información obtenida del username y la macheamos con la de la base de datos */
    const user = await User.findOne({ username })
    const passwordCorrect = user === null
      ? false
      : await bcrypt.compare(password, user.passwordHash)

    if (!(user && passwordCorrect)) {
      return res.status(401).json({
        error: 'invalid username or password'
      })
    }
    /* Creamos el esquema del token de login para el usuario */
    const userForToken = {
      username: user.username,
      id: user._id
    }

    /* Creamos el token con el método .sign() de jwt */
    console.log('SECRET en login:', process.env.SECRET) /* --> Debugger */
    const token = jwt.sign(userForToken, process.env.SECRET)
    console.log('Token generado:', token) /* Info del token generado */

    /* Manejamos la respuesta */
    return res
      .status(200)
      .send({ token, username: user.username, name: user.name })
    
  } catch (error) {
    return res.status(500).json({
      error: 'Server error'
    })
  }
})


export default loginRouter