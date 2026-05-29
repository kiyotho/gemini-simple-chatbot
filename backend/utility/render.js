import fs from 'node:fs/promises'


import { main, models } from "./chat-api-call.js"
import { summarizeChat } from "./summarize-chat.js"


const summaryLength = 4

export async function renderChat(userInput, res, history, ai){


  if(history.length > summaryLength){

    await summarizeChat(history, ai)
  }    

  console.log('userInput:', userInput)

  history.push({
    role: "user",
    parts: [{ text: userInput.text }]
  })

  res.setHeader("Content-Type", "application/json")

  let resultGemini = ""

  const stream = await main(history, ai)

  if(!stream){
    res.end() 
    return
  }

  try{

    for await(const chunk of stream.result){
      res.write(chunk.text)
      resultGemini += chunk.text
    }
    

  } catch(err){

    console.log(err)
    res.end()

    const parsed = JSON.parse(err.message)

    if(parsed.error.code === 503){
      for(const model of models){
        if(model.name === stream.modelUsed){
          model.unavailable = true
        }
      }
    }

  }

  res.end()
  res.statusCode = 200


  history.push({
    role: "model", 
    parts : [{text : resultGemini}]
  })

  await fs.writeFile('history.txt', JSON.stringify(history, null, 2))
}