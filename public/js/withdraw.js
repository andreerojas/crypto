const equivalentContainer = document.querySelector('.equivalent-container');
const amount = document.querySelector('#amount');
const equivalent = document.querySelector('#equivalent');
const select = document.querySelector('#coins');
const amountFeedback = document.querySelector('#amount + .invalid-feedback')
const form = document.querySelector('form');

const inputsValidation = ()=>{
    form.classList.add('was-validated');
    amount.setCustomValidity('');
    amountFeedback.innerText = 'Enter a valid number';
    const asset = userWallet.find( asset  => asset.currency['API_id'] === Number.parseInt(select.value));
    console.log('here')
    if(!amount.validity.patternMismatch && !amount.validity.valueMissing &&  asset){   
        if(amount.value > asset.qty){
            amount.setCustomValidity('Funds are not available');
            amountFeedback.innerText = 'Funds are not available';
        }else{
            equivalentContainer.classList.remove('hide');
            equivalent.innerText = (asset.currency['price']*amount.value).toFixed(2);
        }
        
    }else{
        console.log('hideeee')
        equivalentContainer.classList.add('hide');
    }
};

amount.addEventListener('input',inputsValidation);
select.addEventListener('input',inputsValidation);