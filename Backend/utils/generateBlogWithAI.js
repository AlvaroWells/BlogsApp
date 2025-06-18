import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINIAI_API_KEY })

export default async function generateBlogsWithAI() {
  const prompt = `
  Devuélveme un **array JSON plano** con exactamente 2 blogs tecnológicos. Solo responde con los datos, sin texto extra ni etiquetas markdown.

  [
    {
      "title": "Título creativo",
      "author": "Nombre realista",
      "url": "url-seo-amigable",
      "likes": "número aleatório"
    },
    {
      "title": "Otro título creativo",
      "author": "Un autor",
      "url": "otra-url",
      "likes": "número aleatório"
    }
  ]
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
  
  /* guardamos la respuesta de la api de google AI */
  const text = response.candidates[0].content.parts[0].text
  console.log(text)
  return text
} catch (error) {
  console.error('Error con GeminiAI:', error)
  return null
}
}