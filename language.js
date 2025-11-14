// language.js — automatische detectie + JSON translation database

let currentLang = localStorage.getItem("lang") || "nl";
let translations = {};

// 1. Translation JSON laden
async function loadTranslations() {
    const res = await fetch("./translations.json");
    translations = await res.json();
    applyTranslations();
}

// 2. Tekst in HTML vervangen
function applyTranslations() {
    if (currentLang === "nl") return; // NL blijft origineel

    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                const text = node.nodeValue.trim();
                if (!text) return NodeFilter.FILTER_REJECT;
                if (translations[text] && translations[text][currentLang] !== "") {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_REJECT;
            }
        }
    );

    let node;
    while ((node = walker.nextNode())) {
        const original = node.nodeValue.trim();
        const translated = translations[original][currentLang];
        node.nodeValue = translated;
    }
}

// 3. Taal wisselen
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
    applyTranslations();
}

// 4. Init
document.addEventListener("DOMContentLoaded", loadTranslations);

