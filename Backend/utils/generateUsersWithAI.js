import { GoogleGenAI } from "@google/genai";
import User from '../models/user.js'
import blog from "../models/blog.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINIAI_API_KEY })

export default async function generateUsersWithAI() {
  const usersInDB = await User.find({}, { username: 1 }).populate('blogs', '_id') /* Obtenemos la información necesaria de los usuarios en la BD */

  /* Maping del array obtenido para poder ser analizado por la IA */
  const usersList = usersInDB.map(u => ({
    id: u._id.toString(),
    username: u.username,
    blogCount: u.blogs.length
  }))

  const prompt = `
  Tengo una base de datos con usuarios registrados. Aquí están los existentes:

  ${JSON.stringify(usersList, null, 2)}

  Tu tarea es:

  - En un 75% de los casos, elige un usuario existente.
  - Prioriza los usuarios que tienen menos blogs (campo "blogCount").
  - Devuélveme uno de estos dos objetos según el caso:

  {
    "userExisting": true,
    "username": "nombreDeUsuarioExistente"
  }

  - O crear un nuevo usuario con el 25% de las veces restantes con este objeto:

  {
    "userExisting": false,
    "username": "nombre usuario",
    "name": "Nombre realista",
    "password": "contraseñaSegura123"
  }

  Devuelve SOLO el objeto plano JSON, sin explicaciones, sin comillas alrededor del JSON.
  `
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    })

    const text = response.candidates[0].content.parts[0].text
    return text
  } catch (error) {
    console.error('Error con GeminiAI', error)
    return null
  }
}