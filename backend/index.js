import 'dotenv/config'
import { GoogleGenAI } from "@google/genai";

import fs from 'node:fs/promises'
import http from 'node:http'

import { clear } from 'node:console';
import { renderChat } from './utility/render.js';
import { getHistory, getBody } from './utility/get-stuff.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

let result = ''
let history = []
let state = ''
let isHistoryAvailable = false


const data = await fs.readFile('history.txt', 'utf-8')
history = JSON.parse(data)

if( history.length > 2){
  isHistoryAvailable = true
}

async function clearHistory(){
  history = [] 
  await fs.writeFile('history.txt', JSON.stringify([]))
  isHistoryAvailable = false
  console.log('History cleared...')
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

    const body = "Hello, Gemini"
    const result = await renderChat(body, res, history, ai)
    
    res.end(JSON.stringify({ text: result.text }))

  } 

  else if (req.url === '/returnchat' && req.method === 'POST'){
    const body = await getBody(req)

    renderChat(body, res, history, ai)
    
  } 

  else if(req.url ==='/returnhistory' && req.method === 'GET'){
    const history = await getHistory()
    res.setHeader('Content-Type', 'application/json')
    res.end(history)
    res.statusCode = 200
  }

  else if(req.url === '/clearhistory' && req.method === "DELETE"){

      clearHistory()
      res.statusCode = 200
      res.end(JSON.stringify({ success: true }))
      
  }

  else{
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({error: 'This path is not supported', message: 'plase check your url'}))
  }
})

server.listen(PORT, () => console.log(`Server is listening at the Port: ${PORT}`))