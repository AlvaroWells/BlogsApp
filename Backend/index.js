import 'dotenv/config'
import express from 'express'
const app = express()
import mongoose from 'mongoose'

/* Permitimos el filtrado por campos que no estén definidos en el equema */
mongoose.set('strictQuery', false)

/* constante para manejar el timeout de la base de datos */
const DEV_TIMEOUT = 30_000

/* Inicializamos la conexión a MongoDB */
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    setTimeout(() => {
      mongoose.connection.close()
      .then(() => console.log('Conection closing with MongoDB'))
    }, DEV_TIMEOUT)
  })
  .catch((error) => {
    console.log('Error conecting to MongoDB:', error)
  })


app.listen(process.env.PORT, () => {
  console.log('Server running on port:', process.env.PORT)
})


