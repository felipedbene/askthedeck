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
function drawCards() {
	const shuffled = [...deck].sort(() => 0.5 - Math.random());
	const positions = ['Current State', 'Focus for Growth', 'Potential in 7 Days'];
	return positions.map((pos, i) => ({ name: shuffled[i], position: pos }));
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

document.getElementById('drawButton').addEventListener('click', async () => {
	try {
		drawButton.disabled = true;

		const cards = drawCards();
		displayCards(cards);
		const readingContainer = document.getElementById('readingContainer');
		document.getElementById('spinner').style.display = 'block';
		const reading = await getReading(cards);
		document.getElementById('spinner').style.display = 'none';
		//readingContainer.innerHTML = reading;
		readingContainer.innerHTML = renderMarkdown(reading);
	} catch (error) {
		console.error(error);
		document.getElementById('spinner').style.display = 'none';
		document.getElementById('readingContainer').textContent = 'Error getting reading: ' + error.message;
	} finally {
		drawButton.disabled = false;
	}
});
