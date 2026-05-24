
const models = [
  {name: 'gemini-3-flash-preview', outOfLimit: false, unavailable: false}, 
  {name: 'gemini-3.1-flash-lite', outOfLimit: false, unavailable: false}
]



export async function main(history, ai){

  for(const model of models){
    
    if(model.outOfLimit || model.unavailable){
      continue
    } 
    
    else{
      try{
        const result = ai.models.generateContentStream({
          model: model.name, 
          config: {
            'systemInstruction' : 'You are a brutally honest Genius. respond to the prompts honestly'
          },
          contents : history
        })

        return result
        
      } catch(err) {
        const errorData = JSON.parse(err.message)
        const code = errorData.error.code
        console.log(errorData)
        console.log(code)

        if(code === 429){
          model.outOfLimit = true
          continue
        } else if(code === 503) {
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