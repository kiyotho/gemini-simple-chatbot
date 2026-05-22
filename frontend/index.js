
const container = document.getElementById('container')
const inputEl = document.getElementById('input-el')
const buttonEl = document.getElementById('button-el')

renderHistory()
async function changeChat(userInput){

    try{
        const responce = await fetch('http://localhost:8000/returnchat', {
        method: 'POST',
        body: JSON.stringify({"text" : userInput}), 
        headers : {
            'Content-Type': 'application/json'
        }})

        const reader = responce.body.getReader()
        const decoder = new TextDecoder()

        let data = ''

        while(true){

            const {done, value} = await reader.read()

            if(done) break 

            const chunk = decoder.decode(value)
            data += chunk
            console.log(chunk)

        }

        // const result = await responce.json()
        const childChatHtml = `<div class='chatbot-res'>${marked.parse(data)}</div>`
        container.insertAdjacentHTML('beforeend', childChatHtml)

    }catch(err){
        console.log(err)
    }

}

buttonEl.addEventListener('click', () => {
    const value = inputEl.value
    inputEl.value = ''
    const childUserHtml = `<div class='user-res'>${value}</div>`
    container.insertAdjacentHTML('beforeend', childUserHtml)
    changeChat(value)

})

inputEl.addEventListener('input', () => {
  inputEl.style.height = 'auto'
  inputEl.style.height = inputEl.scrollHeight + 'px'
})



inputEl.addEventListener('keydown', (event) => {
    if(event.key === 'Enter' && !event.shiftKey){
        event.preventDefault()
        buttonEl.click()
    }
})


async function logHistory(){
    const history = await fetch('http://localhost:8000/returnhistory')
    const chatHistory = await history.json()
    return chatHistory
}


async function renderHistory(){ 
    const history = await logHistory()

    for (const item of history){
        if(item.role === 'user'){
            const childUserHtml = `<div class='user-res'>${item.parts[0].text}</div>`
            container.insertAdjacentHTML('beforeend', childUserHtml)
        } else{
            const childChatHtml = `<div class='chat-res'>${marked.parse(item.parts[0].text)}</div>`
            container.insertAdjacentHTML('beforeend', childChatHtml)
        }
    }
}