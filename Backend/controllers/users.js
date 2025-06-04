import express from 'express'
import bcrypt from 'bcrypt'
import User from '../models/user.js'
import generateUsersWithAI from '../utils/generateUsersWithAI.js'

/* Importamos el enrutador de express desde la api local */
const userRouter = express.Router()

/* Ruta get para obtener a los usuarios que contengan blogs */
userRouter.get('/', async(req, res) => {
  try {
    const users = await User.find({}).populate('blogs')
    /* Manejo de respuesta positiva del servidor */
    return res.status(200).json(
      users
    )
  } catch (error) {
    console.error('Error obteniendo los usuarios:', error.message)
    return res.status(500).json({
      error: 'Error obteniendo los usuarios'
    })
  }
})

/* Ruta post para añadir nuevos usuarios */
userRouter.post('/', async(req, res) => {
  try {
    /* Generamos la información del usuario con IA */
    const newUserBody = await generateUsersWithAI()

    /* Manejamos la respuesta si hay un error con la API de IA */
    if (!newUserBody) {
      return res.status(500).json({
        error: 'No se pudo generar usuario con IA'
      })
    }
    /* Limpiamos y parseamos el texto de usuario generado */
    const cleanText = newUserBody.replace(/```json|```/g, '').trim()
    const newUserData = JSON.parse(cleanText) //--> Información limpia del nuevo usuario.

    /* Buscamos si ya existe el usuario creado */
    const userExist = await User.findOne({ username: newUserData.username })

    /* Manejamos de forma controlada si existe o no un usuario único en la BD */
    if (userExist) {
      return res.status(400).json({
        error: 'Username alredy exists'
      })
    }

    /* Añadimos seguridad con bcrypt y saltrounds */
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(newUserData.password, saltRounds)

    /* Creamos nuevo usuario y lo guardamos en la base de datos */
    const newUser = await User.create({
      username: newUserData.username,
      name: newUserData.name,
      passwordHash: passwordHash
    })
    
    return res.status(201).json(newUser)
  } catch (error) {
    return res.status(500).json({
      error: "Error con el servidor"
    })
  }
})

export default userRouter
