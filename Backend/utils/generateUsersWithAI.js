import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINIAI_API_KEY })

export default async function generateUsersWithAI() {
  const prompt = `
  Devuélveme un objeto plano tipo JSON con la información de un usuario con la siguiente estructura:

  {
    "username": "Nombre de usuario, longitud mínima de 3 carácteres, y no más de 12, sin carácteres especiales",
    "name": "Nombre realista del usuario",
    "password": "Contraseña segura"
  }
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