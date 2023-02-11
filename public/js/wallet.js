//remove favorites functionality
const favorites = document.querySelectorAll('.favs-container div ul li');
for(let fav of favorites){
    const checkbox = fav.children[2].children[0];
    checkbox.addEventListener('change', async ()=>{
        try{
            const response = await axios.post('/favorites',{
                'action'    : 'remove',
                'name'      : checkbox.value
            })
            fav.remove();
        }catch(e){
            console.log('error is: ',e)
        }
    })
}

// stylying the flash messages
const createAlert = (holderId, message, type )=>{
    const alertPlaceholder = document.getElementById(holderId);
    const wrapper = document.createElement('div')
    wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible crypto-alerts" role="alert">' + message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
    alertPlaceholder.append(wrapper);
}