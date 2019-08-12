//#region table setting

// how many numbers back to remember (updated as game progresses)
let currentBackValue = 1;
// the notice element which informs the player how far back to recall
const stageNotice = document.querySelector('.stage-notice');
// the game card
const gameCard = document.querySelector('.card');
// the number input element
const numInput = document.querySelector('.number-input');
// the color selector element
const colSelector = document.querySelector('.color-selector');
// the submit guess button
const submitButton = document.querySelector('.submit-guess');
// result text alert
const resultElement = document.querySelector('.result');
// the entire game form (where values are entered and submitted)
const gameForm = document.querySelector('.game-form');
// the "play" button
const playButton = document.querySelector('.play');
// the high score notice (should notify if no high score is recorded)
const highScore = document.querySelector('.high-score');
// the array of possible numbers to remember (gets built when play button is clicked)
let possibleNumbers = [];
// the array of possible colors to remember
const possibleColors = [
	"red",
	"blue",
	"yellow",
	"orange",
	"purple",
	"gray"
];

// will hold our game cards once play button is pressed
let cards = [];

// animation container for rendering win animation
const animationContainer = document.querySelector(".animation-container");

// build color selector options
possibleColors.forEach((color) => {
	const colOption = document.createElement("option");
	colOption.value = color;
	colOption.textContent = color;
	colSelector.appendChild(colOption);
});

let noticeString = stageNotice.textContent;

noticeString = noticeString.replace("%n", currentBackValue);

stageNotice.textContent = noticeString;

getHighScore();

//#endregion

//#region game functions

function updateCard(entries) {
	var i = 0;
	const intervalID = setInterval(
		function () {
			if (i < entries.length) {
				showCard(entries[i]);
				i++;

				gameCard.classList.add("change");

				setTimeout(() => {
					gameCard.classList.remove("change");
				}, 1000);

			} else {
				gameForm.classList.remove("hide");
				clearCard();
				clearInterval(intervalID);
			}
		},
		1500
	);
}

function getRandIndex(maxIndex) {
	return Math.floor((Math.random()) * maxIndex);
}

function showCard(entry) {	// each entry should be an object (passed as an array element)
	gameCard.textContent = Object.keys(entry)[0];		// the key is our number
	gameCard.style = `background-color: ${Object.values(entry)[0]};`;		// and the value is our color
}

function getCards() {
	cards = [];
	const possibleNumbersLength = possibleNumbers.length;
	const possibleColorsLength = possibleColors.length;
	// building the random order of numbers and colors
	for (var i = 0; i < possibleNumbersLength; i++) {
		let randIndex = getRandIndex(possibleColorsLength);
		const randCol = possibleColors[randIndex];
		randIndex = getRandIndex(possibleNumbersLength);
		const randNum = possibleNumbers[randIndex];
		cards.push({ [randNum]: randCol })
	};
	return cards;
}

function clearCard() {
	gameCard.textContent = "";
	gameCard.style = "background-color: black;";
}

function getRandomNumber(max = 20) {
	return Math.floor(Math.random() * max);
}

function buildPossibleNumbers() {
	const arr = [];
	// to keep the count of numbers unpredictable, we add some random amount of extras
	const extraNumbers = currentBackValue + Math.floor(Math.random() * 10);
	for (var i = 0; i < currentBackValue + extraNumbers; i++) {
		const num = getRandomNumber();
		arr.push(num);
	}
	return arr;
}

function getHighScore() {
	// if a high score exists, update the high score text
	if (localStorage.getItem("highScore")) {
		const recordedHighScore = localStorage.getItem("highScore");
		highScore.textContent = `(Current best is ${recordedHighScore}-back)`;
	}
}

//#endregion

//#region event listeners

submitButton.addEventListener("click", (e) => {
	e.preventDefault();

	const selectedNumber = numInput.value;
	const selectedColor = colSelector.value;
	const lastIndex = cards.length - 1;
	const indexToCheck = lastIndex - currentBackValue;

	const targetNumber = Object.keys(cards[indexToCheck])[0];
	const targetColor = Object.values(cards[indexToCheck])[0];

	const selectedNumberMatchesTargetNumber = selectedNumber == targetNumber;
	const selectedColorMatchesTargetColor = selectedColor == targetColor;

	if (
		selectedNumberMatchesTargetNumber &&
		selectedColorMatchesTargetColor
	) {
		// if there is no recorded best, or if the recorded best is lower than the latest successful current value, update the record in local storage
		if (
			!localStorage.getItem("highScore") ||
			Number(localStorage.getItem("highScore")) < currentBackValue
		) {
			localStorage.setItem(
				"highScore",
				currentBackValue
			);
		}

		currentBackValue++;
		noticeString = noticeString.replace(currentBackValue - 1, currentBackValue);
		stageNotice.textContent = noticeString;

		// manipulate "win" container
		animationContainer.style = `background-color: ${selectedColor};`;
		animationContainer.classList.add("win");

		setTimeout(() => {
			animationContainer.classList.remove("win");
			playButton.classList.remove("hide");
		}, 3500);

		resultElement.textContent = "Nice work";

		getHighScore();

	} else {
		console.group("Your guess");
		console.log({ [selectedNumber]: selectedColor });
		console.groupEnd();
		console.group("The target");
		console.log({ [targetNumber]: targetColor });
		console.groupEnd();

		resultElement.textContent = "Didn't get that one. Try again.";
		playButton.classList.remove("hide");
	}

	gameForm.classList.add("hide");
});

playButton.addEventListener("click", (e) => {
	e.preventDefault();

	// updating state for presentation to player
	playButton.classList.add("hide");
	resultElement.textContent = "";

	possibleNumbers = buildPossibleNumbers();
	cards = getCards();
	updateCard(cards);
});

//#endregion