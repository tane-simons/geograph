let countries = [];
let currentCountry = "";
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let remainingTime = 120;
let timerInterval;

async function loadCountries() {
    const response = await fetch('https://countries.dev/countries'); //api
    countries = await response.json();
    resetGame();
}

function getFlag() { //get random country and display flag
    if (remainingTime <= 0) return;
    currentCountry = countries[Math.floor(Math.random()*countries.length)];
    const flagImage = document.getElementById('flag');
    flagImage.innerHTML = `<img src="${currentCountry.flags.svg}">`;
    
    document.querySelectorAll("input[type='text']").forEach(input => { //reset each input to null
        input.value = "";
        input.style.color = "";
        input.disabled = false; //so user cant keep clikgin check to farm points
    });
    document.getElementById('next').style.display = "none";
    document.getElementById('check').style.display = "inline-block";
    document.getElementById('check').disabled = false;

    const selectedFields = Array.from(document.querySelectorAll("input[type='text']")).filter(input=>input.style.display !== 'none');
    if (selectedFields.length > 0) {
        selectedFields[0].focus() //changes focused text field to always be the first on new load
    }
}

const customAnswers = { //for custom entries to be accepted
    "Korea (Democratic People's Republic of)":["North Korea"],
    "Korea (Republic of)":["South Korea"],
    "Saint Lucia":["St Lucia","St. Lucia"],
    "Palestine, State of":["Palestine"],
    "Swaziland":["Eswatini"],
    "Tanzania, United Republic of":["Tanzania"],
    "Republic of Kosovo":["Kosovo"],
    "Russian Federation": ["Russia"],
    "United States of America": ["USA", "United States", "US"],
    "Iran (Islamic Republic of)": ["Iran"]
};

function checkAnswers() {
    if (remainingTime <= 0) return;
    const removeAccents = (str) => str ? str.toString().normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase():""; //remove accents and make lowercase
    const validate = (id, correctVals) => {
        const inputField = document.getElementById(id); //gets input
        const userEntry = removeAccents(inputField.value.trim().toLowerCase()); //cleans
        const check = userEntry !== "" && (Array.isArray(correctVals) ? correctVals.some(val => removeAccents(val) === userEntry) : removeAccents(correctVals) === userEntry); //checks input agaionst single or array of correct answers
        inputField.style.color = check ? "#708b70":"#af5d5d";
        inputField.disabled = true;
        if (!check){
            inputField.value = Array.isArray(correctVals) ? correctVals[0] : correctVals; //display correct ans if wrong
        }
        return check ? 1:0; // point if correct
    };

    let correctCount = 0; //for tracking how many correct you get
    const check=(id,vals) => {
        if (document.getElementById(`checkbox-${id}`).checked) { //ensure only tracking against currently checked
            correctCount += validate(id,vals);
        }
    };

    const customNames=customAnswers[currentCountry.name] || [];
    const formatCallingCode=(currentCountry.callingCodes || []).flatMap(code => {
        const removePlus = code.replace('+','');
        return [removePlus, `+${removePlus}`];
    });

    check ("name", [currentCountry.name,...(currentCountry.altSpellings || []), ...customNames]); //ensure alt spellings are accounted
    check ("capital", currentCountry.capital);
    check ("callingCode", formatCallingCode);
    check ("currency", currentCountry.currencies ? currentCountry.currencies.map(c => c.code):[]); //has to extract from currecny object first as theres multiple options
    check ("timezone", currentCountry.timezones);
    
    const pointsPerCorrect = [0,10,25,50,80,150]; //how many points depends on how many you get right
    score += pointsPerCorrect[correctCount] || 0; //increases score based on how many correct and the above array

    document.getElementById("score").innerText = `Score: ${score}`; //update score
    if (score > highScore) { //updates highscore
                highScore = score; //updates live if getting highscore
                localStorage.setItem("highScore",score);
                document.getElementById("high-score").innerText = `HIGH SCORE: ${score}`;
            }
    document.getElementById("next").style.display = "inline-block";
    document.getElementById("next").disabled = false;
    document.getElementById("check").style.display = "none";
    document.getElementById("check").disabled = true;
}

function startTimer() {
    document.getElementById("high-score").innerText = `HIGH SCORE: ${highScore}`;
    timerInterval = setInterval(() => {
        remainingTime--; //decrease by 1s
        document.getElementById("timer").innerText = `${Math.floor(remainingTime/60)}:${(remainingTime%60).toString().padStart(2,'0')}`; //formats time

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            document.querySelectorAll("input[type='text'],button").forEach(el => el.disabled = true);

            const playAgain=document.getElementById("play-again");
            playAgain.disabled = false;
            playAgain.style.display = "inline-block"; //when round ends, show button
            document.getElementById("next").style.display = "none";

            document.getElementById("next").style.display = "none";
            document.getElementById("check").style.display = "none";

        }
    }, 1000); //1s delay for int
}

function resetGame() { //for clean slate, keeping high schore
    score=0;
    remainingTime=120;
    document.getElementById("score").innerText=`Score: ${score}`;
    document.getElementById("timer").innerText = `${Math.floor(remainingTime/60)}:${(remainingTime%60).toString().padStart(2,'0')}`; //formats time
    document.getElementById("play-again").style.display='none';
    document.querySelectorAll("input[type='checkbox']").forEach(el => el.disabled = false);
    getFlag();
    startTimer();

}

document.addEventListener('DOMContentLoaded', () => {
    loadCountries();
    document.getElementById('next').addEventListener('click',getFlag);
    document.getElementById('check').addEventListener('click', checkAnswers);
    document.getElementById('play-again').addEventListener('click', resetGame);
    document.getElementById('edit-fields').addEventListener('click', (e)=> {
        const settings= document.getElementById("settings");
        settings.style.display = settings.style.display === "flex" ? "none" : "flex";
    });
    document.querySelectorAll("input[type='text']").forEach(input => {
        input.addEventListener('input',() => {
            const hasEntry = Array.from(document.querySelectorAll("input[type='text']")).some(el=>el.value.trim() !== "");
            document.getElementById('check').innerText=hasEntry ? "Check": "Skip"; //button state determined if theres any entry or not
        });
    });

    document.addEventListener('keydown',(e)=> { //enter/return key acts and check/skip/enter
        if (e.key === 'Enter') {
            const checkButton = document.getElementById('check');
            const nextButton = document.getElementById('next');
            if (!checkButton.disabled){
                checkButton.click()
            } else if (!nextButton.disabled) {
                nextButton.click();
            }
        }
    });

    ["name","capital","callingCode","currency","timezone"].forEach(field => {
        document.getElementById(`checkbox-${field}`).addEventListener("change",(e) => {
            document.getElementById(field).style.display = e.target.checked ? "inline-block" : "none"; //show input field if box checked
        })
    })
});