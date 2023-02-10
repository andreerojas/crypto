const themeOptions = document.querySelectorAll('input[type="radio"]');
const header = document.querySelector('header');
const footer = document.querySelector('footer');
const main = document.querySelector('main');
const navbar = document.querySelector('#navbar');
const anchors = document.querySelectorAll('a');
const icons = document.querySelectorAll('i');
const headerRow = document.querySelector('#headerRow');
const dataRows = document.querySelectorAll('#dataRows .row');
const toggleOption = document.querySelector('#label-option-2 .options');
const toggleContainer = document.querySelector('.color-mode');


const toggleMultiple = (el, ...cls)=> cls.map( cl => el.classList.toggle(cl));
const applyTheme = () =>{
    toggleMultiple(header, 'bg-light', 'text-dark');
    toggleMultiple(footer,'bg-light', 'text-dark');
    toggleMultiple(main,'dark','text-light');
    navbar.classList.toggle('navbar-dark');
    anchors.forEach(a => a.classList.toggle('text-dark'));
    icons.forEach(i => i.classList.toggle('text-dark'));
    toggleOption.classList.toggle('bg-light');
    if(headerRow) {headerRow.classList.toggle('border-secondary')}
    if(dataRows) {dataRows.forEach(row => row.classList.toggle('border-secondary'))}
}

const toggle = (e) =>{
    e.preventDefault();
    e.stopPropagation();
    const unchecked = document.querySelector('input[type="radio"]:not(input[type="radio"]:checked)');
    unchecked.checked = true;
    applyTheme();
}

themeOptions.forEach(option => option.addEventListener('click',(e)=>{e.preventDefault()}));
toggleContainer.addEventListener('click',toggle);


