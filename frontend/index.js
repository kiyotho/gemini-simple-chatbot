const container = document.getElementById('container')
const inputEl = document.getElementById('input-el')
const buttonEl = document.getElementById('button-el')

async function changeChat(userInput){

    try{
        const responce = await fetch('http://localhost:8000/returnchat', {
        method: 'POST',
        body: JSON.stringify({"text" : userInput}), 
        headers : {
            'Content-Type': 'application/json'
        }})
        const result = await responce.json()
        const childChatHtml = `<div class='chatbot-res'>${marked.parse(result.text)}</div>`
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