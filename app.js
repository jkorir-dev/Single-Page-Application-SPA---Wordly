const dictionaryForm = document.getElementById('dictionaryForm');
const wordInput = document.getElementById('wordInput');
const inputFeedback = document.getElementById('inputFeedback');
const resultsContainer = document.getElementById('resultsContainer');
const resultWord = document.getElementById('resultWord');
const resultPhonetic = document.getElementById('resultPhonetic');
const audioPlaybackBtn = document.getElementById('audioPlaybackBtn');
const pronunciationAudio = document.getElementById('pronunciationAudio');
const meaningsWrapper = document.getElementById('meaningsWrapper');
const synonymsBox = document.getElementById('synonymsBox');
const synonymsList = document.getElementById('synonymsList');
const sourceLink = document.getElementById('sourceLink');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorBanner = document.getElementById('errorBanner');
const errorTitle = document.getElementById('errorTitle');
const errorMessage = document.getElementById('errorMessage');
const themeToggleBtn = document.getElementById('themeToggleBtn');

const dictionaryApiUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en';

function initializeApp() {
    setupThemeToggle();
    setupSearchForm();
    setupAudioPlayback();
}

function setupThemeToggle() {
    themeToggleBtn.addEventListener('click', () => {
        const isDarkMode = document.body.getAttribute('data-theme') === 'dark';

        if (isDarkMode) {
            document.body.removeAttribute('data-theme');
            themeToggleBtn.textContent = 'Toggle Dark Mode';
            return;
        }

        document.body.setAttribute('data-theme', 'dark');
        themeToggleBtn.textContent = 'Toggle Light Mode';
    });
}

function setupSearchForm() {
    dictionaryForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const rawQuery = wordInput.value;
        const queryTerm = normalizeSearchTerm(rawQuery);

        inputFeedback.classList.add('hidden');
        inputFeedback.textContent = '';

        if (!queryTerm) {
            inputFeedback.textContent = 'Please enter a valid word or phrase using letters, spaces, hyphens, or apostrophes.';
            inputFeedback.classList.remove('hidden');
            wordInput.focus();
            return;
        }

        wordInput.value = queryTerm;

        if (queryTerm.includes(' ')) {
            inputFeedback.textContent = `Multiple words detected. Searching for "${queryTerm}".`;
            inputFeedback.classList.remove('hidden');
        }

        fetchDictionaryData(queryTerm);
    });
}

function normalizeSearchTerm(value) {
    if (typeof value !== 'string') {
        return '';
    }

    return value
        .normalize('NFKC')
        .trim()
        .replace(/[^\p{L}\p{N}\s'-]/gu, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*[-'’]\s*/g, '-')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

function buildDictionaryQuery(word) {
    return word
        .trim()
        .toLowerCase()
        .replace(/['’]/g, '')
        .replace(/\s+/g, '-');
}

// Dictionary request flow
async function fetchDictionaryData(word) {
    loadingIndicator.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    errorBanner.classList.add('hidden');

    try {
        const safeQuery = buildDictionaryQuery(word);
        const response = await fetch(`${dictionaryApiUrl}/${encodeURIComponent(safeQuery)}`);

        if (!response.ok) {
            const errorPayload = await response.json().catch(() => ({}));
            throw {
                isApiError: true,
                title: errorPayload.title || 'Word Not Found',
                message: errorPayload.message || 'No definition summaries available for this word or phrase.'
            };
        }

        const dataCollection = await response.json();

        if (!Array.isArray(dataCollection) || !dataCollection.length) {
            throw {
                isApiError: true,
                title: 'Word Not Found',
                message: 'No definition summaries are available for this word.'
            };
        }

        renderDictionaryProfile(dataCollection[0]);
    } catch (error) {
        displayErrorBanner(error);
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}

// Render dictionary content
function renderDictionaryProfile(entryData) {
    const meanings = Array.isArray(entryData.meanings) ? entryData.meanings : [];
    const sourceUrl = Array.isArray(entryData.sourceUrls) ? entryData.sourceUrls[0] : null;

    resultWord.textContent = entryData.word || 'Word';
    resultPhonetic.classList.add('hidden');
    resultPhonetic.textContent = '';

    if (entryData.phonetic) {
        resultPhonetic.textContent = entryData.phonetic;
        resultPhonetic.classList.remove('hidden');
    }

    audioPlaybackBtn.classList.add('hidden');
    pronunciationAudio.src = '';

    if (Array.isArray(entryData.phonetics) && entryData.phonetics.length > 0) {
        const explicitAudio = entryData.phonetics.find((phonetic) => {
            return typeof phonetic.audio === 'string' && phonetic.audio.trim() !== '';
        });

        if (explicitAudio) {
            pronunciationAudio.src = explicitAudio.audio;
            audioPlaybackBtn.classList.remove('hidden');
        }
    }

    renderMeanings(meanings);
    renderSynonyms(meanings);
    setSourceLink(sourceUrl, entryData.word);
    resultsContainer.classList.remove('hidden');
}

function renderMeanings(meanings) {
    meaningsWrapper.innerHTML = '';

    meanings.forEach((meaning) => {
        const block = document.createElement('div');
        block.classList.add('part-of-speech-block');

        const heading = document.createElement('h3');
        heading.classList.add('pos-heading');
        heading.textContent = meaning.partOfSpeech || 'Definition';
        block.appendChild(heading);

        const list = document.createElement('ol');
        list.classList.add('definitions-list');

        const definitions = Array.isArray(meaning.definitions) ? meaning.definitions : [];

        definitions.forEach((defNode) => {
            const li = document.createElement('li');
            const p = document.createElement('p');
            p.textContent = defNode.definition || 'No definition available.';
            li.appendChild(p);

            if (defNode.example) {
                const ex = document.createElement('span');
                ex.classList.add('example');
                ex.textContent = `"${defNode.example}"`;
                li.appendChild(ex);
            }

            list.appendChild(li);
        });

        block.appendChild(list);
        meaningsWrapper.appendChild(block);
    });
}

function renderSynonyms(meanings) {
    const globalSynonyms = meanings.flatMap((meaning) => meaning.synonyms || []);
    const uniqueSynonyms = [...new Set(globalSynonyms)].slice(0, 6);

    synonymsList.innerHTML = '';
    synonymsBox.classList.add('hidden');

    if (uniqueSynonyms.length > 0) {
        uniqueSynonyms.forEach((synonym) => {
            const tag = document.createElement('span');
            tag.classList.add('synonym-tag');
            tag.textContent = synonym;
            synonymsList.appendChild(tag);
        });

        synonymsBox.classList.remove('hidden');
    }
}

function setSourceLink(url, word) {
    if (url) {
        sourceLink.href = url;
        sourceLink.textContent = url;
        return;
    }

    sourceLink.href = `https://en.wiktionary.org/wiki/${encodeURIComponent(word || '')}`;
    sourceLink.textContent = 'Wiktionary Entry';
}

function setupAudioPlayback() {
    audioPlaybackBtn.addEventListener('click', () => {
        if (pronunciationAudio.src) {
            pronunciationAudio.play().catch((error) => console.error('Audio playback failed:', error));
        }
    });
}

function displayErrorBanner(error) {
    resultsContainer.classList.add('hidden');

    if (error && error.isApiError) {
        errorTitle.textContent = error.title;
        errorMessage.textContent = error.message;
    } else {
        errorTitle.textContent = 'Connection Disruption';
        errorMessage.textContent = 'Please check your internet configuration settings.';
    }

    errorBanner.classList.remove('hidden');
}

initializeApp();
