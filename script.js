document.addEventListener('DOMContentLoaded', () => {
	const resultsList = document.getElementById('results-list');
	const resultsCount = document.getElementById('results-count');

	if (!resultsList) return;

	const formatWaiting = (weeks) => {
		if (weeks == null || Number.isNaN(weeks)) return '🕒 onbekend';
		if (weeks <= 1) return '🕒 < 1-2 weken';
		if (weeks <= 2) return '🕒 1-2 weken';
		if (weeks <= 4) return '🕒 2-4 weken';
		if (weeks <= 6) return '🕒 4-6 weken';
		return `🕒 ${weeks}+ weken`;
	};

	const contractLabel = (status) => {
		if (status === 'contracted') return 'Contract CZ';
		if (status === 'cap_reached') return 'Contract (limiet)';
		return 'Geen contract';
	};

	const createBadge = (text, className) => {
		const span = document.createElement('span');
		span.className = `badge ${className || ''}`.trim();
		span.textContent = text;
		return span;
	};

	const createCard = (practice) => {
		const card = document.createElement('div');
		card.className = 'provider-card';

		// Header
		const header = document.createElement('div');
		header.className = 'provider-header';

		const name = document.createElement('h2');
		name.className = 'provider-name';
		name.textContent = practice.name;

		const fav = document.createElement('button');
		fav.className = 'favorite-btn';
		fav.setAttribute('aria-label', 'Voeg toe aan favorieten');
		fav.textContent = '☐';

		header.appendChild(name);
		header.appendChild(fav);

		// Badges
		const badges = document.createElement('div');
		badges.className = 'provider-badges';

		const contractStatus = practice.contract?.status || 'not_contracted';
		if (contractStatus === 'contracted') {
			badges.appendChild(createBadge(contractLabel(contractStatus), 'contract-cz'));
		} else {
			badges.appendChild(createBadge(contractLabel(contractStatus), ''));
		}

		badges.appendChild(createBadge(formatWaiting(practice.waiting_time_weeks), 'waiting'));

		// Toon maximaal 1-2 specialisaties als badge
		const specs = Array.isArray(practice.specializations) ? practice.specializations.slice(0, 2) : [];
		specs.forEach((s, idx) => {
			const nice = String(s).replace(/_/g, ' ');
			// geef de eerste spec een opvallende kleur (klassenaam 'stress' bestaat al)
			const cls = idx === 0 ? 'stress' : '';
			badges.appendChild(createBadge(nice.charAt(0).toUpperCase() + nice.slice(1), cls));
		});

		// Info rij
		const info = document.createElement('div');
		info.className = 'provider-info';

		const city = practice.address?.city ? `${practice.address.city}` : 'Onbekende plaats';
		const locationItem = document.createElement('div');
		locationItem.className = 'info-item';
		locationItem.textContent = `📍 ${city}`;

		const ratingScore = practice.rating?.score;
		const ratingCount = practice.rating?.count;
		const ratingItem = document.createElement('div');
		ratingItem.className = 'info-item';
		if (typeof ratingScore === 'number' && typeof ratingCount === 'number') {
			ratingItem.textContent = `⭐ ${ratingScore.toFixed(1)} (${ratingCount})`;
		} else {
			ratingItem.textContent = '⭐ n.v.t.';
		}

		info.appendChild(locationItem);
		info.appendChild(ratingItem);

		// Details link (placeholder)
		const details = document.createElement('a');
		details.href = '#';
		details.className = 'details-link';
		details.textContent = 'Bekijk details';

		card.appendChild(header);
		card.appendChild(badges);
		card.appendChild(info);
		card.appendChild(details);

		return card;
	};

	const renderList = (items) => {
		resultsList.innerHTML = '';
		items.forEach((p) => resultsList.appendChild(createCard(p)));
		if (resultsCount) {
			const n = items.length;
			resultsCount.textContent = `${n} aanbieder${n === 1 ? '' : 's'} gevonden`;
		}
	};

	fetch('./data/practices.json', { cache: 'no-store' })
		.then((r) => r.json())
		.then((data) => {
			if (!Array.isArray(data)) {
				throw new Error('Onjuist JSON-formaat: verwacht een array');
			}
			renderList(data);
		})
		.catch((err) => {
			console.error('Kon praktijken niet laden:', err);
			if (resultsCount) resultsCount.textContent = '0 aanbieders gevonden';
			resultsList.innerHTML = '<div class="provider-card">Kon resultaten niet laden.</div>';
		});
});

