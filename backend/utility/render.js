import fs from 'node:fs/promises'


import { main } from "./chat-api-call.js"
import { summarizeChat } from "./summarize-chat.js"

const summaryLength = 4

export async function renderChat(userInput, res, history, ai){


  if(history.length > summaryLength){

    await summarizeChat(history, ai)
  }    

  history.push({
    role: "user",
    parts: [{ text: userInput.text }]
  })

  res.setHeader("Content-Type", "application/json")

  let resultGemini = ""

  const stream = await main(history, ai)

  for await(const chunk of stream){
    res.write(chunk.text)
    resultGemini += chunk.text
  }
  res.end()
  res.statusCode = 200

  history.push({
    role: "model", 
    parts : [{text : resultGemini}]
  })

  await fs.writeFile('history.txt', JSON.stringify(history))
}