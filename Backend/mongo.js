import 'dotenv/config';
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import Blog from './models/blog.js'
import User from './models/user.js'
import generateBlogsWithAI from './utils/generateBlogWithAI.js';
// import { GoogleGenAI } from '@google/genai'

// Configuración inicial
const url = process.env.TEST_MONGODB_URI
// const ai = new GoogleGenAI({ apiKey: process.env.GEMINIAI_API_KEY })

// Función para generar blogs con IA
// async function generateBlogsWithAI() {
//   const prompt = `
//   Devuélveme un **array JSON plano** con exactamente 2 blogs tecnológicos. Solo responde con los datos, sin texto extra ni etiquetas markdown.

// [
//   {
//     "title": "Título creativo",
//     "author": "Nombre realista",
//     "url": "url-seo-amigable",
//     "likes": 42
//   },
//   {
//     "title": "Otro título creativo",
//     "author": "Otro autor",
//     "url": "otra-url",
//     "likes": 17
//   }
// ]
// `

//   try {
//     const response = await ai.models.generateContent({
//       model: "gemini-2.0-flash",
//       contents: [{ role: "user", parts: [{ text: prompt }] }]
//     })
    
//     const text = response.candidates[0].content.parts[0].text
//     return text
//   } catch (error) {
//     console.error("Error con Gemini:", error)
//     return null
//   }
// }

// Conexión a MongoDB y creación de blogs
async function main() {
  try {
    await mongoose.connect(url)
    console.log("✔ Conectado a MongoDB");

    /* Buscar usuario (o crear uno si no existe) */
    let user = await User.findOne({ username: 'ia-bot' })

    if (!user) {
      user = new User({
        username: 'ia-bot',
        name: 'Generador automático',
        passwordHash: await bcrypt.hash('password1', 10)
      })
      await user.save()
      console.log('Usuario de prueba creado')
    }

    /* Obtener blogs de IA */
    const blogsText = await generateBlogsWithAI()
    if (!blogsText) return

    /*  1. Limpiar etiquetas markdown */
    const cleanText = blogsText.replace(/```json|```/g, '').trim()
    
    /*  2. Parsear a array de objetos */
    const blogsData = JSON.parse(cleanText)
    
    /*  3. Asociar User a cada blog */
    const blogs = blogsData.map(blog => ({
      ...blog,
      user: user._id
    }))
    console.log(blogs)

    /* Insertar blogs y guardar referencias en el usuario */
    const savedBlogs = await Blog.insertMany(blogs)
    user.blogs = user.blogs.concat(savedBlogs.map(b => b._id))
    await user.save()

    console.log("✅ Blogs generados y asignados al usuario")
  } catch (error) {
    console.error("❌ Error:", error.message)
  } finally {
    await mongoose.connection.close()
    process.exit()
  }
}

// Ejecución
mongoose.set('strictQuery', false)
main()