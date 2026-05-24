import fs from 'node:fs/promises'

export async function summarizeChat(history, ai) {

    const result = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite', 
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

    await fs.writeFile('history.txt', JSON.stringify(history))
  
}