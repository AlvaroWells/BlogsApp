import express from 'express'
import bcrypt from 'bcrypt'
import Blog from '../models/blog.js'
import User from '../models/user.js' //--> Importante para la utilización del método .populate() de los enrutadores.
import middleware from '../utils/middleware.js'
import aiHelpers from '../utils/aiHelpers.js'
import generateBlogsWithAI from '../utils/generateBlogWithAI.js'
import generateUsersWithAI from '../utils/generateUsersWithAI.js'

/* Importamos el enrutador api de los blogs */
const blogRouter = express.Router()

/* Ruta para obtener el array de blogs de la api */
blogRouter.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 } )
    res.json(blogs)
  } catch (error) {
    console.log('Error obtaining blogs:', error.message)
  }
})

/* Ruta para obtener un blog según su id */
blogRouter.get('/:id', middleware.requestLogger, async (req, res) => {
  try {
    /* Obtenemos la información del blog de la base de datos */
    const selectedBlog = await Blog.findById(req.params.id).populate('user', { username: 1, name: 1 } )

    if (!selectedBlog) {
      return res.status(400).json({
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
  } catch (error){
    console.log('Error obtaining selected blog:', error.message)
    res.status(500).json({ error: 'Server error' })
  }
})


/* Ruta post para añadir blogs con IA*/
blogRouter.post('/', async (req, res) => {
  try {
    let user = null
    const aiResponse = await generateUsersWithAI() /* --> Llamada a la función que genera blogs con IA */
    console.log('Respuesta de la ia:', aiResponse)
    const userData = aiHelpers.cleanAIText(aiResponse)
    console.log(userData)

    if (userData.userExisting) {
      user = await User.findOne({ username: userData.username })

      if (!user) {
        return res.status(404).json({
          error: 'El usuario existente no fue encontrado'
        })
      }
    } else {
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(userData.password, saltRounds)

      const newUser = await User({
        username: userData.username,
        name: userData.name,
        passwordHash
      })

      await newUser.save()
      user = newUser
    }

    // /* Llamar a la función de generación de blogs */
    const blogsText = await generateBlogsWithAI()
    if (!blogsText) {
      return res.status(500).json({
        error: 'No se pudo generar ningún blog con IA'
      })
    }
    /* Llamamos a la función que limpia y parsea los datos de la IA */
    const blogsData = aiHelpers.cleanAIText(blogsText)

    // /* Asociar usuario y guardar blogs */
    const blogs = blogsData.map(blog => ({
      ...blog,
      user: user._id
    }))

    const savedBlogs = await Blog.insertMany(blogs)

    /* Asociamos al usuario */
    user.blogs = user.blogs.concat(savedBlogs.map(b => b._id))
    await user.save()

    return res.status(201).json(
      savedBlogs //--> Manejamos la respuesta de los blogs creados 
    )
  } catch (error) {
    console.error("Error:", error.message)
    return res.status(500).json({
      error: 'Error generando blogs con IA' 
    })
  }
})

/* Ruta DELETE para borrar un blog */
blogRouter.delete('/:id', middleware.tokenExtractor, middleware.userExtractor, async (req, res) => {
  try {
    /* Recuperamos la información del middleware apartir del request */
    const user = req.user
    console.log('Usuario autenticado:', user)

    /* Encontramos el blog por el id de la ruta */
    const blog = await Blog.findById(req.params.id)
    console.log('ID del blog que se quiere borrar:', req.params.id)

    if (!blog) {
      return res.status(404).json({
        error: 'Blog not found'
      })
    }

    if (blog.user.toString() === user._id.toString()) {
      await Blog.findByIdAndDelete(req.params.id)
      return res.status(204).end()
    } else {
      return res.status(401).json({
        error: 'You are not authorized to delete this blog'
      })
    }
  } catch (error) {
    return res.status(500).json({
      error: 'error con el servidor'
    })
  }
})

export default blogRouter
