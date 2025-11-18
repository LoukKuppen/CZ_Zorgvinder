const PRACTICES_URL = 'data/practices.json';

const resultsList = document.getElementById('results-list');
const resultsCount = document.getElementById('results-count');

function formatWaitingTime(weeks) {
    if (typeof weeks !== 'number' || Number.isNaN(weeks)) {
        return 'Onbekend';
    }
    if (weeks <= 2) {
        return '≤ 2 weken';
    }
    if (weeks <= 4) {
        return '2-4 weken';
    }
    return `${weeks} weken`;
}

function contractLabel(status) {
    switch (status) {
        case 'contracted':
            return 'Contract CZ';
        case 'cap_reached':
            return 'Contractlimiet bereikt';
        case 'not_contracted':
            return 'Geen contract';
        default:
            return 'Contractstatus onbekend';
    }
}

function contractBadgeClass(status) {
    switch (status) {
        case 'contracted':
            return 'contract-cz';
        case 'cap_reached':
            return 'warning';
        case 'not_contracted':
            return 'muted';
        default:
            return 'muted';
    }
}

function createBadge(label, extraClass = '') {
    const span = document.createElement('span');
    span.className = `badge ${extraClass}`.trim();
    span.textContent = label;
    return span;
}

function renderCard(practice) {
    const card = document.createElement('article');
    card.className = 'provider-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${practice.name} bekijken`);

    const contractStatus = practice.contract?.status ?? 'unknown';
    const badgeContainer = document.createElement('div');
    badgeContainer.className = 'provider-badges';
    badgeContainer.append(
        createBadge(contractLabel(contractStatus), contractBadgeClass(contractStatus))
    );

    if (practice.specializations?.length) {
        const firstSpecialisation = practice.specializations[0];
        badgeContainer.append(createBadge(firstSpecialisation, 'stress'));
    }

    if (practice.waiting_time_weeks !== undefined) {
        const waitLabel = `Wachttijd: ${formatWaitingTime(practice.waiting_time_weeks)}`;
        badgeContainer.append(createBadge(waitLabel, 'waiting'));
    }

    const languages = (practice.languages ?? []).map(lang => lang.toUpperCase()).join(', ') || 'Onbekend';

    const infoItems = [
        practice.address?.city ?? 'Onbekende plaats',
        `Wachttijd: ${formatWaitingTime(practice.waiting_time_weeks)}`,
        `Beoordeling: ${practice.rating?.score?.toFixed?.(1) ?? 'n.v.t.'}`
    ];

    card.innerHTML = `
        <div class="provider-header">
            <h2 class="provider-name">${practice.name}</h2>
            <button class="favorite-btn" type="button" aria-label="Vergelijk aanbieders">☐</button>
        </div>
    `;

    card.appendChild(badgeContainer);

    const infoRow = document.createElement('div');
    infoRow.className = 'provider-info';
    infoItems.forEach(text => {
        const span = document.createElement('span');
        span.className = 'info-item';
        span.textContent = text;
        infoRow.appendChild(span);
    });
    card.appendChild(infoRow);

    const languageRow = document.createElement('div');
    languageRow.className = 'provider-badges';
    languageRow.append(createBadge(`Talen: ${languages}`, 'muted'));
    card.appendChild(languageRow);

    const favoriteBtn = card.querySelector('.favorite-btn');
    favoriteBtn.addEventListener('click', event => {
        event.stopPropagation();
    });

    const link = document.createElement('a');
    link.className = 'details-link';
    link.href = `DetailPage.html?id=${encodeURIComponent(practice.id)}`;
    link.textContent = 'Bekijk details';
    link.addEventListener('click', event => {
        event.stopPropagation();
    });
    card.appendChild(link);

    card.addEventListener('click', () => {
        window.location.href = link.href;
    });

    card.addEventListener('keyup', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            window.location.href = link.href;
        }
    });

    return card;
}

function updateResultsCount(count) {
    if (!resultsCount) {
        return;
    }
    const label = count === 1 ? 'aanbieder gevonden' : 'aanbieders gevonden';
    resultsCount.textContent = `${count} ${label}`;
}

async function loadPractices() {
    if (!resultsList) {
        return;
    }
    try {
        const response = await fetch(PRACTICES_URL, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Kan data niet laden (${response.status})`);
        }
        const practices = await response.json();
        resultsList.innerHTML = '';
        practices.forEach(practice => {
            const card = renderCard(practice);
            resultsList.appendChild(card);
        });
        updateResultsCount(practices.length);
    } catch (error) {
        console.error(error);
        resultsList.innerHTML = '<p>Er ging iets mis bij het laden van de resultaten. Probeer het later opnieuw.</p>';
        updateResultsCount(0);
    }
}

loadPractices();

