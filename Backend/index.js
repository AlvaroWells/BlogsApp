import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import blogRouter from './controllers/blogs.js'
const app = express()

/* Permitimos el filtrado por campos que no estén definidos en el equema */
mongoose.set('strictQuery', false)

/* constante para manejar el timeout de la base de datos */
//const DEV_TIMEOUT = 30000000000000000n

/* Inicializamos la conexión a MongoDB */
mongoose.connect(process.env.TEST_MONGODB_URI)
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

/* nombre ruta de la api */
app.use('/api/blogs', blogRouter)

/* Puerta de escucha de la app */
app.listen(process.env.PORT, () => {
  console.log('Server running on port:', process.env.PORT)
})


