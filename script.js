let countries = [];
async function loadCountries() {
    const response = await fetch('https://countries.dev/countries');
    countries = await response.json();
    getFlag();
}

function getFlag() {
    const randCountry = countries[Math.floor(Math.random()*countries.length)];

    const flagImage = document.getElementById('flag');
    flagImage.innerHTML = `<img src="${randCountry.flags.svg}">`;
}

document.addEventListener('DOMContentLoaded', () => {
    loadCountries();
    document.getElementById('next').addEventListener('click',getFlag);
});