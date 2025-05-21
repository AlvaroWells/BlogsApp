import 'dotenv/config';
import mongoose from 'mongoose'
import Blog from './models/blogs.js'
import { GoogleGenAI } from '@google/genai'

// Configuración inicial
const url = process.env.TEST_MONGODB_URI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINIAI_API_KEY })

// Función para generar blogs con IA
async function generateBlogsWithAI() {
  const prompt = `
  Devuélveme un **array JSON plano** con exactamente 2 blogs tecnológicos. Solo responde con los datos, sin texto extra ni etiquetas markdown.

[
  {
    "title": "Título creativo",
    "author": "Nombre realista",
    "url": "url-seo-amigable",
    "likes": 42
  },
  {
    "title": "Otro título creativo",
    "author": "Otro autor",
    "url": "otra-url",
    "likes": 17
  }
]
`

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    })
    
    const text = response.candidates[0].content.parts[0].text
    return text
  } catch (error) {
    console.error("Error con Gemini:", error)
    return null
  }
}

// Conexión a MongoDB y creación de blogs
async function main() {
  try {
    await mongoose.connect(url)
    console.log("✔ Conectado a MongoDB");
    //guardamos la información de los blogs generados por la funcion IA
    const blogsText = await generateBlogsWithAI()
    if (!blogsText) return

    //  1. Limpiar etiquetas markdown
    const cleanText = blogsText.replace(/```json|```/g, '').trim()

    //  2. Parsear a array de objetos
    const blogs = JSON.parse(cleanText)
    console.log(blogs)
    //  3. Insertar en la base de datos
    await Blog.insertMany(blogs)
    console.log("✅ Blogs insertados correctamente")
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