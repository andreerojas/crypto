const changeContainers = document.querySelectorAll('.change-container');

for(let container of changeContainers){
    // console.log("val is: ",container.lastChild);
    const changeValue = container.lastChild.innerText.slice(0,-1);
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