import 'dotenv/config'
import { GoogleGenAI } from "@google/genai";
import fs from 'fs/promises'
import http from 'node:http'

const summaryLength = 40
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

let result = ''
let history = []
let state = ''

const models = [
  {name: 'gemini-3-flash-preview', outOfLimit: false, unavailable: false}, 
  {name: 'gemini-3.1-flash-lite', outOfLimit: false, unavailable: false}
]



const data = await fs.readFile('history.txt', 'utf-8')
history = JSON.parse(data)

async function clearHistory(){
  await fs.writeFile('history.txt', JSON.stringify([]))
}


async function main(){

  for(const model of models){
    
    if(model.outOfLimit || model.unavailable){
      continue
    } 
    
    else{
      try{
        return result = await ai.models.generateContent({
          model: model.name, 
          config: {
            'systemInstruction' : 'You are a brutally honest Genius. respond to the prompts honestly'
          },
          contents : history
        })

        
      } catch(err) {
        if(err.status === 429){
          model.outOfLimit = true
          continue
        } else if(err.status === 503) {
          model.unavailable = true
          continue
        }
        else{

          throw err

        }

      }
    }
  }
}

async function renderChat(userInput){

  if(history.length > summaryLength){

    result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      config: {
        'systemInstruction' : 'You are a genius summarizer in the world, summarize the input so that it has all the important information but still its short'
      },
      contents : history
    })

    const lastModelOutput = history[history.length - 1]
    history = []

    

    history.push({
      role: 'user',
      parts: [{text: `In this conversation so far we talked about the following, I just want you to know this, and no acknowledgement needed just continue the conversation beyond this, ${result.text}, after this is the last reponse you gave in the chat also no need to acknowledge just continue`}]
    })

    history.push(lastModelOutput)

  }

  if(userInput == 'quit'){
    return 'escape'
  }

  history.push({
    role: "user",
    parts: [{ text: userInput.text }]
  })

  const resultGemini = await main()

  history.push({
    role: "model", 
    parts : [{text : resultGemini.text}]
  })

  await fs.writeFile('history.txt', JSON.stringify(history))
  console.log(resultGemini)
  return resultGemini
}


async function getBody(req){
  const result = new Promise((resolve) => {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => resolve(JSON.parse(body)))
  })

  return result
}

const PORT = 8000

const server = http.createServer(async (req, res) => {

  res.setHeader('Access-Control-Allow-Origin', "*")
  res.setHeader("Access-Control-Allow-Methods", 'GET, POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if(req.method === 'OPTIONS'){
    res.statusCode = 204
    res.end()
    return
  }


  if(req.url === '/returnchat' && req.method === 'GET'){
    const result = await renderChat()
    res.setHeader("Content-Type", "application/json")
    
    res.end(JSON.stringify({ text: result.text }))

  } 

  else if (req.url === '/returnchat' && req.method === 'POST'){
    const body = await getBody(req)

    const result = await renderChat(body)
    res.setHeader("Content-Type", "application/json")
    
    res.end(JSON.stringify({ text: result.text }))
    
  }
  
  else{
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({error: 'This path is not supported', message: 'plase check your url'}))
  }
})

server.listen(PORT, () => console.log(`Server is listening at the Port: ${PORT}`))
