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
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    req.token = authorization.subString(7)
  } else {
    req.token = null
  }
  next()
}

/* Middleware para obtener la información del usuario de la base de datos */
const userExtractor = async (req, res, next) => {
  try{
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    if (!decodedToken.id) {
      return res.status(401).json({ error: 'token invalid' })
    }
    const user = await User.findById(decodedToken.id)
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