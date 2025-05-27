import express, { response } from 'express'
import Blog from '../models/blog.js'
import User from '../models/user.js' //--> Importante para la utilización del método .populate() de los enrutadores.
import middleware from '../utils/middleware.js'

/* Importamos el enrutador api de los blogs */
const blogRouter = express.Router()

/* Ruta para obtener el array de blogs de la api */
blogRouter.get('/', async (req, res) => {
  try{
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    res.json(blogs)
  }catch(error){
    console.log('Error obtaining blogs:', error.message)
  }
})

/* Ruta para obtener un blog según su id */
blogRouter.get('/:id', middleware.requestLogger, async(req, res) => {
  try{
    /* Obtenemos la información del blog de la base de datos */
    const selectedBlog = await Blog.findById(req.params.id).populate('user', { username: 1, name: 1 })

    if (!selectedBlog) {
      return response.status(400).json({
        error: 'Blog not found'
      })
    }

    /* Manejamos la respuesta obtenida desde el servidor */
    res.status(200).json({
      id: selectedBlog._id,
      title: selectedBlog.title,
      author: selectedBlog.author,
      url: selectedBlog.url,
      user: selectedBlog.user,
      likes: selectedBlog.likes
    })
  }catch(error){
    console.log('Error obtaining selected blog:', error.message)
    res.status(500).json({ error: 'Server error' })
  }
})

export default blogRouter