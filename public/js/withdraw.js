const equivalentContainer = document.querySelector('.equivalent-container');
const availabilityContainer = document.querySelector('.availability-container');
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
    if(!amount.validity.patternMismatch && !amount.validity.valueMissing &&  asset){   
        if(amount.value > asset.qty.$numberDecimal){
            amount.setCustomValidity('Funds are not available');
            amountFeedback.innerText = 'Funds are not available';
        }else{
            equivalentContainer.classList.remove('hide');
            equivalent.innerText = (asset.currency['price']*amount.value).toFixed(2);
        }
        
    }else{
        equivalentContainer.classList.add('hide');
    }
};

const showAvailability = ()=>{
    const selectedAsset = userWallet.find( asset  => asset.currency['API_id'] === Number.parseInt(select.value));
    availabilityContainer.innerText = `You have ${selectedAsset.qty.$numberDecimal} ${selectedAsset.currency.symbol} available in your wallet`
}

amount.addEventListener('input',inputsValidation);
select.addEventListener('input',()=>{ 
    showAvailability(); 
    inputsValidation();
});

showAvailability();