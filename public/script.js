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

// Function to get card image filename from card name
function getCardImage(cardName) {
	// Major Arcana mapping
	const majorArcanaMap = {
		'The Fool': '00-TheFool.png',
		'The Magician': '01-TheMagician.png',
		'The High Priestess': '02-TheHighPriestess.png',
		'The Empress': '03-TheEmpress.png',
		'The Emperor': '04-TheEmperor.png',
		'The Hierophant': '05-TheHierophant.png',
		'The Lovers': '06-TheLovers.png',
		'The Chariot': '07-TheChariot.png',
		Strength: '08-Strength.png',
		'The Hermit': '09-TheHermit.png',
		'Wheel of Fortune': '10-WheelOfFortune.png',
		Justice: '11-Justice.png',
		'The Hanged Man': '12-TheHangedMan.png',
		Death: '13-Death.png',
		Temperance: '14-Temperance.png',
		'The Devil': '15-TheDevil.png',
		'The Tower': '16-TheTower.png',
		'The Star': '17-TheStar.png',
		'The Moon': '18-TheMoon.png',
		'The Sun': '19-TheSun.png',
		Judgement: '20-Judgement.png',
		'The World': '21-TheWorld.png',
	};

	// Check if it's a Major Arcana card
	if (majorArcanaMap[cardName]) {
		return `cards/${majorArcanaMap[cardName]}`;
	}

	// Minor Arcana mapping
	const parts = cardName.split(' of ');
	if (parts.length === 2) {
		const rank = parts[0];
		const suit = parts[1];

		// Map rank to number
		const rankMap = {
			Ace: '01',
			2: '02',
			3: '03',
			4: '04',
			5: '05',
			6: '06',
			7: '07',
			8: '08',
			9: '09',
			10: '10',
			Page: '11',
			Knight: '12',
			Queen: '13',
			King: '14',
		};

		const rankNumber = rankMap[rank];
		return `cards/${suit}${rankNumber}.png`;
	}

	// Fallback to card back if not found
	return 'cards/CardBacks.png';
}

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

function pickCard(selection) {
	const selectedCard = shuffled[selection - 1];
	console.log(selectedCard);
	console.log(shuffled);
	const cardsContainer = document.getElementById('cardsContainer');
	const positionIndex = cardsContainer.childElementCount;
	console.log(positionIndex);

	if (positionIndex < 3) {
		shuffled.pop(selection);
		const selectedCardElement = document.getElementById(`card-${selection}`);
		selectedCardElement.style.display = 'none';
		const cardDiv = document.createElement('div');

		const cardImage = getCardImage(selectedCard);
		cardDiv.className =
			'bg-gradient-to-br from-purple-900/40 to-gray-800 p-4 rounded-lg shadow-lg shadow-purple-900/30 text-center flex flex-col items-center gap-3 border border-purple-700/30';
		cardDiv.setAttribute('data-card-name', selectedCard);
		cardDiv.setAttribute('data-position', positions[positionIndex]);
		cardDiv.innerHTML = `
			<img src="${cardImage}" alt="${selectedCard}" class="w-32 h-auto rounded-md shadow-md" />
			<div>
				<strong class="block text-sm font-semibold text-tarot-gold mb-1">${positions[positionIndex]}</strong>
				<span class="text-purple-200 text-sm">${selectedCard}</span>
			</div>
		`;

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

// TODO: Make this more robust, maybe.
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
			<div id="spinner" style="display: none" class="text-center">
				<div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-300/30 border-t-tarot-gold"></div>
				<p class="mt-4 text-purple-300">Good things come for those who wait. This may take up to 60 seconds.</p>
			</div>
		`;

		// Show all cards again
		for (let i = 1; i <= 78; i++) {
			const card = document.getElementById(`card-${i}`);
			if (card) card.style.display = '';
		}
		readButton.disabled = false;
		reshuffleDeck();
		document.getElementById('deckContainer').style.display = 'grid';
	} catch (error) {
		console.error(error);
		document.getElementById('spinner').style.display = 'none';
		document.getElementById('readingContainer').textContent = 'Error getting reading: ' + error.message;
	}
});

document.getElementById('readButton').addEventListener('click', async () => {
	const cardsContainer = document.getElementById('cardsContainer');
	if (cardsContainer.childElementCount === 3) {
		try {
			readButton.disabled = true;
			clearShuffleButton.disabled = true;
			const cards = Array.from(cardsContainer.children);
			const cardsData = cards.map((card) => {
				return {
					position: card.getAttribute('data-position'),
					name: card.getAttribute('data-card-name'),
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
			clearShuffleButton.disabled = false;
		}
	}
});

// TODO: Add a follow-up question option
