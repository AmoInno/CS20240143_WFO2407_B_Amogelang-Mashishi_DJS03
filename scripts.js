import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

let page = 1;
let matches = books;


function createElement(tag, className = '', attributes = {}) {
    const element = document.createElement(tag);
    element.className = className;
    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
    }
    return element;
}

// ** Book Preview Functions **
function createBookPreview({ author, id, image, title }) {
    const button = createElement('button', 'preview', { 'data-preview': id });
    button.innerHTML = `
        <img class="preview__image" src="${image}" />
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;
    return button;
}

function getBooks(bookList, container) {
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    for (const book of bookList) {
        fragment.appendChild(createBookPreview(book));
    }
    container.appendChild(fragment);
}

function populateSelect(element, options, defaultOption) {
    const fragment = document.createDocumentFragment();
    const defaultEl = createElement('option', '', { value: 'any' });
    defaultEl.innerText = defaultOption;
    fragment.appendChild(defaultEl);
    for (const [id, name] of Object.entries(options)) {
        const option = createElement('option', '', { value: id });
        option.innerText = name;
        fragment.appendChild(option);
    }
    element.appendChild(fragment);
}

function updateTheme(theme) {
    const isNight = theme === 'night';
    document.documentElement.style.setProperty('--color-dark', isNight ? '255, 255, 255' : '10, 10, 20');
    document.documentElement.style.setProperty('--color-light', isNight ? '10, 10, 20' : '255, 255, 255');
}

function updateShowMoreButton(matches, page) {
    const listButton = document.querySelector('[data-list-button]');
    const remaining = matches.length - page * BOOKS_PER_PAGE;
    listButton.disabled = remaining <= 0;
    listButton.innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${remaining > 0 ? remaining : 0})</span>
    `;
}


const initialBooks = matches.slice(0, BOOKS_PER_PAGE);
getBooks(initialBooks, document.querySelector('[data-list-items]'));
populateSelect(document.querySelector('[data-search-genres]'), genres, 'All Genres');
populateSelect(document.querySelector('[data-search-authors]'), authors, 'All Authors');
updateShowMoreButton(matches, page);

document.querySelector('[data-settings-theme]').value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
updateTheme(document.querySelector('[data-settings-theme]').value);

// ** Event Listeners **
document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false;
});

document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false;
});

document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true;
    document.querySelector('[data-search-title]').focus();
});

document.querySelector('[data-header-settings]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true;
});

document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false;
});

document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    updateTheme(formData.get('theme'));
    document.querySelector('[data-settings-overlay]').open = false;
});

document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);

    matches = books.filter((book) => {
        const genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
        const titleMatch = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
        const authorMatch = filters.author === 'any' || book.author === filters.author;
        return genreMatch && titleMatch && authorMatch;
    });

    page = 1;
    renderBooks(matches.slice(0, BOOKS_PER_PAGE), document.querySelector('[data-list-items]'));
    updateShowMoreButton(matches, page);
    document.querySelector('[data-list-message]').classList.toggle('list__message_show', matches.length === 0);
    document.querySelector('[data-search-overlay]').open = false;
});

document.querySelector('[data-list-button]').addEventListener('click', () => {
    const nextBooks = matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE);
    getBooks(nextBooks, document.querySelector('[data-list-items]'));
    page += 1;
    updateShowMoreButton(matches, page);
});

document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const bookElement = event.composedPath().find(el => el?.dataset?.preview);
    if (bookElement) {
        const bookId = bookElement.dataset.preview;
        const activeBook = books.find(book => book.id === bookId);
        if (activeBook) {
            document.querySelector('[data-list-active]').open = true;
            document.querySelector('[data-list-blur]').src = activeBook.image;
            document.querySelector('[data-list-image]').src = activeBook.image;
            document.querySelector('[data-list-title]').innerText = activeBook.title;
            document.querySelector('[data-list-subtitle]').innerText = `${authors[activeBook.author]} (${new Date(activeBook.published).getFullYear()})`;
            document.querySelector('[data-list-description]').innerText = activeBook.description;
        }
    }
});
