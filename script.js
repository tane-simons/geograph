let countries = [];
let currentCountry = "";
let score = 0;
async function loadCountries() {
    const response = await fetch('https://countries.dev/countries'); //api
    countries = await response.json();
    getFlag();
}

function getFlag() { //get random country and display flag
    currentCountry = countries[Math.floor(Math.random()*countries.length)];
    const flagImage = document.getElementById('flag');
    flagImage.innerHTML = `<img src="${currentCountry.flags.svg}">`;
    
    document.querySelectorAll("input[type='text']").forEach(input => { //reset each input to null
        input.value = "";
        input.style.backgroundColor = "";
        input.disabled = false; //so user cant keep clikgin check to farm points
    });
    document.getElementById('next').disabled = true;
    document.getElementById('check').disabled = false;
}

function checkAnswers() {
    const removeAccents = (str) => str ? str.toString().normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase():""; //remove accents and make lowercase
    const validate = (id, correctVals) => {
        const inputField = document.getElementById(id); //gets input
        const userEntry = removeAccents(inputField.value.trim().toLowerCase()); //cleans
        const check = userEntry !== "" && (Array.isArray(correctVals) ? correctVals.some(val => removeAccents(val) === userEntry) : removeAccents(correctVals) === userEntry); //checks input agaionst single or array of correct answers
        inputField.style.backgroundColor = check ? "green":"red";
        inputField.disabled = true;
        if (!check){
            inputField.value = Array.isArray(correctVals) ? correctVals[0] : correctVals; //display correct ans if wrong
        }
        return check ? 1:0; //1 point if correct
    };

    let roundScore = 0, failed = false; //for tracking the score of current round
    const check=(id,vals) => {
        if (document.getElementById(`checkbox-${id}`).checked) { //ensure only tracking against currently checked
            const result=validate(id,vals);
            roundScore += result;
            if (result===0) failed = true; //fail condition if not all are met
        }
    };

    check ("name", [currentCountry.name,...(currentCountry.altSpellings || [])]); //ensure alt spellings are accounted
    check ("capital", currentCountry.capital);
    check ("callingCode", currentCountry.callingCodes);
    check ("currency", currentCountry.currencies ? currentCountry.currencies.map(c => c.code):[]); //has to extract from currecny object first as theres multiple options
    check ("timezone", currentCountry.timezones);
    score=failed ? 0 : score+roundScore; // reset 0 if failed

    document.getElementById("score").innerText = `Score: ${score}`; //update score
    document.getElementById("next").disabled = false;
    document.getElementById("check").disabled = true;
}

document.addEventListener('DOMContentLoaded', () => {
    loadCountries();
    document.getElementById('next').addEventListener('click',getFlag);
    document.getElementById('check').addEventListener('click', checkAnswers);

    ["name","capital","callingCode","currency","timezone"].forEach(field => {
        document.getElementById(`checkbox-${field}`).addEventListener("change",(e) => {
            document.getElementById(field).style.display = e.target.checked ? "inline-block" : "none"; //show input field if box checked
        })
    })
});