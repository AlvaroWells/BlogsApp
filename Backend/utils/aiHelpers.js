/* Funcion para limpiar texto y parsear JSON de texto generado por IA */
function cleanAIText(rawText) {
  try {
    const cleanAIText = rawText.replace(/```json|```/g, '').trim()
    const parsedText = JSON.parse(cleanAIText)
    return parsedText
  } catch (error) {
    console.error('Error al parsear el texto generado por IA')
    return null
  }
}


export default {
  cleanAIText
}



