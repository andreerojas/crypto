const equivalentContainer = document.querySelector('.equivalent-container');
const amount = document.querySelector('#amount');
const equivalent = document.querySelector('#equivalent');
const select = document.querySelector('#coins');

const calculateAmount = ()=>{
    const currency = currencies.find(currency => currency['API_id'] === Number.parseInt(select.value));
    if(!amount.validity.patternMismatch && currency){
        equivalentContainer.classList.remove('hide');
        const price = (currency['price']*amount.value).toFixed(2)
        equivalent.innerText = `${price}`;
    }else{
        equivalentContainer.classList.add('hide');
    }
}

amount.addEventListener('input',calculateAmount);
select.addEventListener('input',calculateAmount);
