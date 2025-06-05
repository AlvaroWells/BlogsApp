import jwt from 'jsonwebtoken'
import User from '../models/user.js'



/* Middleware para devolver la información de los request del blackend */
const requestLogger = (req, res, next) => {
  console.log('Method:', req.method)
  console.log('Path:', req.path)
  console.log('Body:', req.body)
  console.log('---')
  next()
}

/* Middleware para extraer el token del paquete de jwt */
const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  console.log('Authorization header:', authorization) 
  if (authorization && authorization.startsWith('Bearer')) {
    req.token = authorization.replace('Bearer ', '')
    console.log('Token limpio:', req.token)
  }
  
  next()
}

/* Middleware para obtener la información del usuario de la base de datos */
const userExtractor = async (req, res, next) => {
  try{
    /* Info para el debugger */
    console.log('SECRET en userExtractor:', process.env.SECRET)
    console.log('Token recibido:', req.token)
    /* --------------------- */

    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    /* Info para el debugger */
    console.log('Token decodificado:', decodedToken)

    if (!decodedToken.id) {
      return res.status(401).json({ error: 'token invalid' })
    }
    const user = await User.findById(decodedToken.id)
      /* Info para el debugger */
    console.log('Usuario desde el token:', user)
    
    req.user = user
    next()
  } catch (error) {
    console.error('error', error.message)
    res.status(401).json({
      error: error.message
    })
  }
}


export default {
  requestLogger,
  userExtractor,
  tokenExtractor
}