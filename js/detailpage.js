const PRACTICES_URL = 'data/practices.json';

const elements = {
    name: document.getElementById('practice-name'),
    tags: document.getElementById('practice-tags'),
    contact: document.getElementById('practice-contact'),
    description: document.getElementById('practice-description'),
    treatmentList: document.getElementById('treatment-list'),
    languageTags: document.getElementById('language-tags'),
    reviewsSection: document.getElementById('reviews-section'),
    reviewsUpdated: document.getElementById('reviews-updated'),
    nearbyProviders: document.getElementById('nearby-providers'),
    ratingScore: document.getElementById('rating-score'),
    ratingCount: document.getElementById('rating-count'),
    scoreBox: document.getElementById('score-box'),
    waitingBox: document.getElementById('waiting-box'),
    waitingInfo: document.getElementById('waiting-info'),
    waitingUpdated: document.getElementById('waiting-updated'),
    contractBox: document.getElementById('contract-box'),
    contractHeading: document.getElementById('contract-heading'),
    contractDescription: document.getElementById('contract-description'),
    contractPoints: document.getElementById('contract-points'),
    digitalBox: document.getElementById('digital-box'),
    digitalDescription: document.getElementById('digital-description'),
    digitalCta: document.getElementById('digital-cta')
};

const contentCards = Array.from(document.querySelectorAll('.content-card'));
const sidebarBoxes = Array.from(document.querySelectorAll('.sidebar-box'));

function getPracticeId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function formatWaitingTime(weeks) {
    if (typeof weeks !== 'number' || Number.isNaN(weeks)) {
        return null;
    }
    if (weeks <= 2) {
        return '≤ 2 weken';
    }
    if (weeks <= 4) {
        return '2-4 weken';
    }
    return `${weeks} weken`;
}

function createTag(label, className = 'tag-gray') {
    const span = document.createElement('span');
    span.className = `tag ${className}`;
    span.textContent = label;
    return span;
}

function formatType(type) {
    switch (type) {
        case 'psychologist':
            return 'psychologenpraktijk';
        case 'ggz':
            return 'GGZ-organisatie';
        default:
            return 'zorgaanbieder';
    }
}

function formatDate(value) {
    if (!value) {
        return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fillTags(practice) {
    elements.tags.innerHTML = '';

    const status = practice.contract?.status;
    if (status === 'contracted') {
        elements.tags.appendChild(createTag('Contract CZ', 'tag-green'));
    } else if (status === 'cap_reached') {
        elements.tags.appendChild(createTag('Contractlimiet bereikt', 'tag-blue'));
    } else if (status === 'not_contracted') {
        elements.tags.appendChild(createTag('Geen contract', 'tag-gray'));
    }

    if (practice.digital_options?.includes('online_intake')) {
        elements.tags.appendChild(createTag('Online intake', 'tag-blue'));
    }
    if (practice.digital_options?.includes('chat_nurse')) {
        elements.tags.appendChild(createTag('Chat met verpleegkundige', 'tag-blue'));
    }

    if (practice.specializations?.length) {
        elements.tags.appendChild(createTag(practice.specializations[0], 'tag-gray'));
    }
}

function fillContact(practice) {
    elements.contact.innerHTML = '';
    if (practice.address) {
        const addressItem = document.createElement('div');
        addressItem.className = 'contact-item';
        addressItem.innerHTML = `
            <i class="fas fa-map-marker-alt"></i>
            <span>${practice.address.street}, ${practice.address.postcode} ${practice.address.city}</span>
        `;
        elements.contact.appendChild(addressItem);
    }

    if (elements.contact.children.length === 0) {
        const placeholder = document.createElement('p');
        placeholder.textContent = 'Contactgegevens niet beschikbaar.';
        elements.contact.appendChild(placeholder);
    }
}

function fillDescription(practice) {
    const type = formatType(practice.type);
    const specialisations = practice.specializations?.length
        ? practice.specializations.join(', ')
        : 'diverse zorgvragen';
    elements.description.textContent = `${practice.name} is een ${type} die ondersteuning biedt bij ${specialisations}.`;
}

function fillTreatments(practice) {
    elements.treatmentList.innerHTML = '';
    if (practice.specializations?.length) {
        practice.specializations.forEach(topic => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-check" style="color: #d72333;"></i> ${topic}`;
            elements.treatmentList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'Geen behandelingen bekend.';
        elements.treatmentList.appendChild(li);
    }
}

function fillLanguages(practice) {
    elements.languageTags.innerHTML = '';
    if (practice.languages?.length) {
        practice.languages.forEach(lang => {
            const span = document.createElement('span');
            span.className = 'language-tag';
            span.textContent = lang;
            elements.languageTags.appendChild(span);
        });
    } else {
        const span = document.createElement('span');
        span.className = 'language-tag';
        span.textContent = 'Niet opgegeven';
        elements.languageTags.appendChild(span);
    }
}

function fillReviews(practice) {
    elements.reviewsSection.innerHTML = '';
    const score = practice.rating?.score;
    const count = practice.rating?.count;

    if (typeof score === 'number') {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        const width = Math.max(0, Math.min(100, Math.round(score * 10)));
        reviewItem.innerHTML = `
            <div class="review-label">
                <span>Gemiddelde beoordeling</span>
                <span class="review-score">${score.toFixed(1)}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${width}%;"></div>
            </div>
        `;
        elements.reviewsSection.appendChild(reviewItem);
    } else {
        const noReviews = document.createElement('p');
        noReviews.textContent = 'Nog geen reviews beschikbaar.';
        elements.reviewsSection.appendChild(noReviews);
    }

    const updated = formatDate(practice.updated_at);
    elements.reviewsUpdated.textContent = updated ? `Laatste update: ${updated}` : '';
}

function fillScore(practice) {
    const score = practice.rating?.score;
    const count = practice.rating?.count;
    if (typeof score === 'number') {
        elements.ratingScore.innerHTML = `<i class="fas fa-star"></i> ${score.toFixed(1)}`;
        elements.ratingCount.textContent = `${count ?? 0} reviews`;
    } else {
        elements.scoreBox.style.display = 'none';
    }
}

function fillWaitingInfo(practice) {
    const formatted = formatWaitingTime(practice.waiting_time_weeks);
    if (!formatted) {
        elements.waitingBox.style.display = 'none';
        return;
    }
    elements.waitingInfo.textContent = `Verwachte wachttijd: ${formatted}`;
    const updated = formatDate(practice.updated_at);
    elements.waitingUpdated.textContent = updated ? `Laatste update: ${updated}` : '';
}

function fillContractInfo(practice) {
    const status = practice.contract?.status;
    const note = practice.contract?.note;
    const defaultPoints = [
        'Erkend zorgverlener',
        'Geverifieerde reviews',
        'CZ cliënten welkom'
    ];

    if (status === 'contracted') {
        elements.contractHeading.textContent = 'Contract CZ';
        elements.contractDescription.textContent = 'Deze praktijk heeft een lopend contract met CZ.';
        elements.contractPoints.innerHTML = '';
        defaultPoints.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-check"></i> ${item}`;
            elements.contractPoints.appendChild(li);
        });
    } else if (status === 'cap_reached') {
        elements.contractHeading.textContent = 'Contractlimiet bereikt';
        elements.contractDescription.textContent = note ?? 'Deze praktijk heeft tijdelijk het maximum aan CZ-verzekerden bereikt.';
        elements.contractPoints.innerHTML = '';
    } else if (status === 'not_contracted') {
        elements.contractHeading.textContent = 'Geen contract met CZ';
        elements.contractDescription.textContent = 'Let op: vergoeding kan afwijken omdat er geen contract is.';
        elements.contractPoints.innerHTML = '';
    } else {
        elements.contractBox.style.display = 'none';
    }
}

function fillDigitalOptions(practice) {
    const options = practice.digital_options ?? [];
    if (!options.length) {
        elements.digitalBox.style.display = 'none';
        return;
    }

    const labels = {
        online_intake: 'Online intake beschikbaar',
        chat_nurse: 'Chat met verpleegkundige mogelijk'
    };

    const available = options.map(option => labels[option] ?? option);
    elements.digitalDescription.textContent = available.join(' • ');
    elements.digitalCta.textContent = 'Plan digitale afspraak';
}

function fillNearby(practice, practices) {
    elements.nearbyProviders.innerHTML = '';
    const others = practices.filter(item => item.id !== practice.id);

    const sameCity = others.filter(item => item.address?.city === practice.address?.city);
    const candidates = sameCity.length >= 2 ? sameCity : others;
    candidates.slice(0, 2).forEach(item => {
        const card = document.createElement('div');
        card.className = 'provider-card';
        card.innerHTML = `
            <h3><a href="DetailPage.html?id=${encodeURIComponent(item.id)}">${item.name}</a></h3>
            <div class="provider-info">
                <i class="fas fa-map-marker-alt"></i>
                <span>${item.address?.city ?? 'Onbekende locatie'}</span>
            </div>
            <div class="provider-info">
                <i class="fas fa-clock"></i>
                <span>Wachttijd: ${formatWaitingTime(item.waiting_time_weeks) ?? 'Onbekend'}</span>
            </div>
            <div class="provider-info">
                <i class="fas fa-star" style="color: #ff9800;"></i>
                <span>${item.rating?.score?.toFixed?.(1) ?? 'n.v.t.'}</span>
            </div>
        `;
        elements.nearbyProviders.appendChild(card);
    });

    if (elements.nearbyProviders.children.length === 0) {
        const paragraph = document.createElement('p');
        paragraph.textContent = 'Geen alternatieve aanbieders gevonden.';
        elements.nearbyProviders.appendChild(paragraph);
    }
}

function showError(message) {
    elements.name.textContent = message;
    elements.tags.innerHTML = '';
    elements.contact.innerHTML = '<p>Klik op Terug naar resultaten om een andere aanbieder te kiezen.</p>';
    contentCards.forEach(card => {
        card.style.display = 'none';
    });
    sidebarBoxes.forEach(box => {
        box.style.display = 'none';
    });
}

async function init() {
    const practiceId = getPracticeId();
    if (!practiceId) {
        showError('Geen aanbieder geselecteerd');
        return;
    }

    try {
        const response = await fetch(PRACTICES_URL, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Kan data niet laden (${response.status})`);
        }
        const practices = await response.json();
        const practice = practices.find(item => item.id === practiceId);

        if (!practice) {
            showError('Aanbieder niet gevonden');
            return;
        }

        elements.name.textContent = practice.name;
        fillTags(practice);
        fillContact(practice);
        fillDescription(practice);
        fillTreatments(practice);
        fillLanguages(practice);
        fillReviews(practice);
        fillScore(practice);
        fillWaitingInfo(practice);
        fillContractInfo(practice);
        fillDigitalOptions(practice);
        fillNearby(practice, practices);
    } catch (error) {
        console.error(error);
        showError('Er ging iets mis bij het laden van de praktijkgegevens');
    }
}

init();

