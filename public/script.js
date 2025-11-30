// Tarot deck
const majorArcana = [
	'The Fool',
	'The Magician',
	'The High Priestess',
	'The Empress',
	'The Emperor',
	'The Hierophant',
	'The Lovers',
	'The Chariot',
	'Strength',
	'The Hermit',
	'Wheel of Fortune',
	'Justice',
	'The Hanged Man',
	'Death',
	'Temperance',
	'The Devil',
	'The Tower',
	'The Star',
	'The Moon',
	'The Sun',
	'Judgement',
	'The World',
];

const suits = ['Wands', 'Cups', 'Swords', 'Pentacles'];
const ranks = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Page', 'Knight', 'Queen', 'King'];

const minorArcana = [];
suits.forEach((suit) => {
	ranks.forEach((rank) => {
		minorArcana.push(`${rank} of ${suit}`);
	});
});

const deck = majorArcana.concat(minorArcana);

// Create the shuffled deck for first use
let shuffled = [...deck];
reshuffleDeck();

// Card Positions
const positions = ['Current State', 'Focus for Growth', 'Potential in 7 Days'];

function reshuffleDeck() {
	shuffled = [...deck];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
}

// Function to display cards
function displayCards(cards) {
	const container = document.getElementById('cardsContainer');
	container.innerHTML = '';
	cards.forEach((card) => {
		const cardDiv = document.createElement('div');
		cardDiv.className = 'card';
		cardDiv.innerHTML = `<strong>${card.position}</strong><br>${card.name}`;
		container.appendChild(cardDiv);
	});
}

// Function to draw cards
function drawCards(selectedCard) {
	const shuffled = [...deck].sort(() => 0.5 - Math.random());
	return positions.map((pos, i) => ({ name: shuffled[i], position: pos }));
}

function pickCard(selection) {
	const selectedCard = shuffled[selection - 1];
	console.log(selectedCard);
	console.log(shuffled);
	const cardsContainer = document.getElementById('cardsContainer');
	const positionIndex = cardsContainer.childElementCount;
	console.log(positionIndex);

	if (positionIndex < 3) {
		shuffled.pop(selection);
		const selectedCardElement = document.getElementById(selection);
		selectedCardElement.style.display = 'none';
		const cardDiv = document.createElement('div');

		cardDiv.className = 'card';
		cardDiv.childElementCount;
		cardDiv.innerHTML = `<strong>${positions[positionIndex]}</strong><br>${selectedCard}`;

		cardsContainer.appendChild(cardDiv);
	}
}

async function getReading(cards) {
	const response = await fetch('/api/reading', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ cards }),
	});

	if (!response.ok) {
		throw new Error('API request failed: ' + response.status);
	}

	const data = await response.json();
	console.log(data);
	return data.prediction;
}

function renderMarkdown(text) {
	return text
		.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.*?)\*/g, '<em>$1</em>')
		.replace(/^# (.*)$/gm, '<h1>$1</h1>')
		.replace(/^## (.*)$/gm, '<h2>$1</h2>')
		.replace(/^### (.*)$/gm, '<h3>$1</h3>')
		.replace(/^#### (.*)$/gm, '<h4>$1</h4>')
		.replace(/^---$/gm, '<hr>')
		.replace(/^\*\*\*$/gm, '<hr>')
		.replace(/^- (.*)$/gm, '<li>$1</li>')
		.replace(/^\* (.*)$/gm, '<li>$1</li>')
		.replace(/\n/g, '<br>');
}

document.getElementById('clearShuffleButton').addEventListener('click', async () => {
	try {
		const readingContainer = document.getElementById('readingContainer');
		const cardsContainer = document.getElementById('cardsContainer');
		cardsContainer.innerHTML = '';
		readingContainer.innerHTML = `
			<div id="spinner" style="display: none">
				<div class="spinner"></div>
				Good things come for those who wait.This may take up to 60 seconds.
			</div>
		`;

		// Show all hidden cards again
		const allCards = document.querySelectorAll('.card[id]');
		allCards.forEach((card) => {
			card.style.display = '';
		});
		readButton.disabled = false;
		reshuffleDeck();
		document.getElementById('deckContainer').style.display = 'block';
	} catch (error) {
		console.error(error);
		document.getElementById('spinner').style.display = 'none';
		document.getElementById('readingContainer').textContent = 'Error getting reading: ' + error.message;
	}
});

document.getElementById('readButton').addEventListener('click', async () => {
	if (deck.length - shuffled.length === 3) {
		try {
			readButton.disabled = true;
			clearShuffleButton.disabled = true;
			const cardsContainer = document.getElementById('cardsContainer');
			const cards = cardsContainer.getElementsByClassName('card');
			const cardsData = Array.from(cards).map((card) => {
				const match = card.innerHTML.match(/<strong>(.*?)<\/strong><br>(.*)/);
				return {
					position: match ? match[1] : '',
					name: match ? match[2] : '',
				};
			});
			console.log(cardsData);
			const readingContainer = document.getElementById('readingContainer');
			document.getElementById('spinner').style.display = 'block';
			document.getElementById('deckContainer').style.display = 'none';
			const reading = await getReading(cardsData);
			document.getElementById('spinner').style.display = 'none';
			readingContainer.innerHTML = renderMarkdown(reading);
		} catch (error) {
			console.error(error);
			document.getElementById('spinner').style.display = 'none';
			document.getElementById('readingContainer').textContent = 'Error getting reading: ' + error.message;
		} finally {
			//readButton.disabled = false;
			clearShuffleButton.disabled = false;
			//document.getElementById('deckContainer').style.display = 'flex';
		}
	}
});
