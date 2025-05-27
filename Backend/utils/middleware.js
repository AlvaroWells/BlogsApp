// import jwt from 'jwt'
// import User from './models/User'



/* Middleware para devolver la información de los request del blackend */
const requestLogger = (req, res, next) => {
  console.log('Method:', req.method)
  console.log('Path:', req.path)
  console.log('Body:', req.body)
  console.log('---')
  next()
}


export default {
  requestLogger
}