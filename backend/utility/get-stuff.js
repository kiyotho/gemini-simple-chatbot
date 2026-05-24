import fs from 'node:fs/promises'

export async function getBody(req){
  const result = new Promise((resolve) => {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => resolve(JSON.parse(body)))
  })

  return result
}

export async function getHistory(){
  return await fs.readFile('history.txt', 'utf-8')
}