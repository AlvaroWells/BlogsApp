import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import blogRouter from './controllers/blogs.js'
import userRouter from './controllers/users.js'
import loginRouter from './controllers/login.js'
import middleware from './utils/middleware.js'
const app = express()

/* Permitimos el filtrado por campos que no estén definidos en el equema */
mongoose.set('strictQuery', false)

/* constante para manejar el timeout de la base de datos */
//const DEV_TIMEOUT = 30000000000000000n

/* Inicializamos la conexión a MongoDB */
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    /* timeout en development */
    // setTimeout(() => {
    //   mongoose.connection.close()
    //   .then(() => console.log('Conection closing with MongoDB'))
    // }, DEV_TIMEOUT)
  })
  .catch((error) => {
    console.log('Error conecting to MongoDB:', error)
  })

/* Paquetes de express */
app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

/* nexos de entrada a los enrutadores de la app */
app.use('/api/blogs', blogRouter)
app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)

/* Puerta de escucha de la app */
app.listen(process.env.PORT, () => {
  console.log('Server running on port:', process.env.PORT)
})


