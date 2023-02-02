// stylying the arrow next to the change24h value
const changeContainers = document.querySelectorAll('.change-container');
for(let container of changeContainers){
    const changeValue = container.children[2].innerText.slice(0,-1);
    const negArrow = document.querySelector(`#${container.id}.change-container .bi-caret-down-fill`);
    const posArrow = document.querySelector(`#${container.id}.change-container .bi-caret-up-fill`);
    if(changeValue>0){
        if(negArrow){
            negArrow.classList.remove('arrow-show');
        }
        if(posArrow){
            posArrow.classList.add('arrow-show');
        }
        container.classList.remove('negativeChange');
        container.classList.add('positiveChange');
    }else{
        if(negArrow){
            negArrow.classList.add('arrow-show');
        }
        if(posArrow){
            posArrow.classList.remove('arrow-show');
        }
        container.classList.add('negativeChange');
        container.classList.remove('positiveChange');
    }
}

//stylying the hearts corresponding to the favorites functionality
const heartContainers = document.querySelectorAll('.heart-container');
for(let heartContainer of heartContainers){
    const checkbox = heartContainer.children[0];
    checkbox.checked = userFavs.includes(checkbox.id.match(/\d+/)[0]);
    checkbox.addEventListener('change',async (e)=>{
        console.log('change event');
        const action = checkbox.checked ? 'add' : 'remove';
        try{
            console.log('fav request is: ',{
                'name' : checkbox.value,
                'action' : action
            })
            const response = await axios.post('/favorites',{
                'name' : checkbox.value,
                'action' : action
            })
            const alertMsg = `You ${(response.data.msg)==="add"? "added" : "removed"} this coin to your favorite list succesfully`; 
            createAlert("alert-holder", alertMsg, 'success');
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


// styles to order the currencies data
const rowsContainer = document.querySelector('#dataRows');
const sortingFn = (a,b)=>{
    return a.id.match(/\d+/) - b.id.match(/\d+/)
}
if(rowsContainer){
    rowsContainer.replaceChildren(... Array.from(rowsContainer.children).sort(sortingFn))
}
