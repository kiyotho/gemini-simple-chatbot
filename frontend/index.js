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
        container.textContent = result.text

    }catch(err){
        console.log(err)
    }

}

buttonEl.addEventListener('click', () => {
    const value = inputEl.value
    changeChat(value)

})