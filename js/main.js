'use strict';

/* main.js - shared helpers and site-wide features. Loaded on every page after data.js. */

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEMO_NOTICE = 'This is a front-end demonstration: no data is sent to a server and no real booking, payment or order is created.';

/* ---------- Small DOM helpers ---------- */

function byId(id) {
    return document.getElementById(id);
}

function getValue(id) {
    return byId(id).value.trim();
}

// Value of the selected radio button of a group ('' when nothing is chosen).
function getChecked(name) {
    const radio = document.querySelector('input[name="' + name + '"]:checked');
    return radio === null ? '' : radio.value;
}

function getCheckedLabel(name) {
    const radio = document.querySelector('input[name="' + name + '"]:checked');
    return radio === null ? '' : document.querySelector('label[for="' + radio.id + '"]').textContent.trim();
}

function getSelectedText(id) {
    const select = byId(id);
    return select.options[select.selectedIndex].text;
}

function makeCell(text) {
    const cell = document.createElement('td');
    cell.textContent = text;
    return cell;
}

function createButton(text, className, id) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = text;
    if (id) {
        button.id = id;
    }
    return button;
}

function createSearchInput(id, placeholder) {
    const input = document.createElement('input');
    input.type = 'search';
    input.id = id;
    input.className = 'form-control';
    input.placeholder = placeholder;
    input.autocomplete = 'off';
    return input;
}

// options: array of [value, label] pairs
function createSelect(id, options) {
    const select = document.createElement('select');
    select.id = id;
    select.className = 'form-select';
    options.forEach(function (pair) {
        const option = document.createElement('option');
        option.value = pair[0];
        option.textContent = pair[1];
        select.append(option);
    });
    return select;
}

// Wraps a control and its label in one column of a Bootstrap row.
function createField(control, labelText, columnClass) {
    const column = document.createElement('div');
    column.className = columnClass;
    const label = document.createElement('label');
    label.htmlFor = control.id;
    label.className = 'form-label fw-semibold mb-1';
    label.textContent = labelText;
    column.append(label, control);
    return column;
}

/* ---------- Dates and times ---------- */

function getToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function addDays(date, amount) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + amount);
    return copy;
}

// '2026-10-31' -> Date at local midnight (null when the text is not a date)
function parseDateInput(text) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        return null;
    }
    const date = new Date(text + 'T00:00:00');
    return Number.isNaN(date.getTime()) ? null : date;
}

// Date -> '2026-10-31' (the format of <input type="date">)
function formatDateInput(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return date.getFullYear() + '-' + month + '-' + day;
}

function formatDateLong(date) {
    return WEEKDAY_NAMES[date.getDay()] + ', ' + date.getDate() + ' ' + MONTH_NAMES[date.getMonth()] + ' ' + date.getFullYear();
}

function daysUntil(date) {
    return Math.round((date - getToday()) / MS_PER_DAY);
}

function describeDays(days) {
    if (days === 0) {
        return 'today';
    }
    if (days === 1) {
        return 'tomorrow';
    }
    return 'in ' + days + ' days';
}

// '17:30' -> 1050 minutes after midnight
function toMinutes(time) {
    const parts = time.split(':');
    return Number(parts[0]) * 60 + Number(parts[1]);
}

// Next date (today or later) of a yearly event such as "October 31".
function getNextOccurrence(month, day) {
    const today = getToday();
    let date = new Date(today.getFullYear(), month - 1, day);
    if (date < today) {
        date = new Date(today.getFullYear() + 1, month - 1, day);
    }
    return date;
}

// Next date and time of a weekly event (weekday 0-6, time '16:00').
function getNextWeekdayDate(weekday, time) {
    const date = getToday();
    date.setDate(date.getDate() + ((weekday - date.getDay() + 7) % 7));
    date.setMinutes(toMinutes(time));
    if (date < new Date()) {
        date.setDate(date.getDate() + 7);
    }
    return date;
}

// All concerts with the date of their next occurrence, soonest first.
function getUpcomingEvents() {
    const list = EVENTS.map(function (event) {
        return { ...event, date: getNextOccurrence(event.month, event.day) };
    });
    list.sort(function (a, b) {
        return a.date - b.date;
    });
    return list;
}

/* ---------- Validation rules ----------
   Every "...Problem" function returns an error message, or '' when the value is fine. */

function isFullName(text) {
    return text.length >= 5 && /^[\p{L}'’.-]+(\s+[\p{L}'’.-]+)+$/u.test(text);
}

function isEmail(text) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
}

function normalizePhone(text) {
    let digits = text.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('8')) {
        digits = '7' + digits.slice(1);
    }
    return digits;
}

function isKzPhone(text) {
    return /^[+\d\s()-]+$/.test(text) && /^77\d{9}$/.test(normalizePhone(text));
}

function formatPhone(text) {
    const d = normalizePhone(text);
    return '+7 ' + d.slice(1, 4) + ' ' + d.slice(4, 7) + ' ' + d.slice(7, 9) + ' ' + d.slice(9, 11);
}

function nameProblem(value) {
    if (value === '') {
        return 'Full name is required.';
    }
    if (!isFullName(value)) {
        return 'Enter your name and surname (letters only, at least two words).';
    }
    return '';
}

function emailProblem(value, aituOnly) {
    if (value === '') {
        return 'Email is required.';
    }
    if (!isEmail(value)) {
        return 'Enter a valid email address, for example student@astanait.edu.kz.';
    }
    if (aituOnly && !value.toLowerCase().endsWith('@astanait.edu.kz')) {
        return 'Use your AITU student email (it ends with @astanait.edu.kz).';
    }
    return '';
}

function phoneProblem(value) {
    if (value === '') {
        return 'Phone number is required.';
    }
    if (!isKzPhone(value)) {
        return 'Enter a Kazakhstan number such as +7 777 123 45 67.';
    }
    return '';
}

function numberProblem(value, min, max, label) {
    if (value === '') {
        return label + ' is required.';
    }
    const number = Number(value);
    if (!Number.isInteger(number) || number < min || number > max) {
        return label + ' must be a whole number from ' + min + ' to ' + max + '.';
    }
    return '';
}

function textProblem(value, min, max, label) {
    if (value === '') {
        return label + ' is required.';
    }
    if (value.length < min) {
        return 'Write at least ' + min + ' characters (now ' + value.length + ').';
    }
    if (value.length > max) {
        return 'Write at most ' + max + ' characters (now ' + value.length + ').';
    }
    return '';
}

function choiceProblem(value, message) {
    return value === '' ? message : '';
}

function dateProblem(value, earliest, tooEarlyMessage) {
    if (value === '') {
        return 'Choose a date.';
    }
    const date = parseDateInput(value);
    if (date === null) {
        return 'Enter a valid date.';
    }
    return date < earliest ? tooEarlyMessage : '';
}

function timeProblem(value, label) {
    if (value === '') {
        return 'Choose the ' + label + ' time.';
    }
    const minutes = toMinutes(value);
    if (minutes < 9 * 60 || minutes > 22 * 60) {
        return 'The room is open from 09:00 to 22:00.';
    }
    return '';
}

// Adds an error for a field to the list when the message is not empty.
function addIf(errors, fieldId, message) {
    if (message !== '') {
        errors.push({ field: byId(fieldId), message: message });
    }
}

// Temporary reference for the demonstration confirmation (not a real booking number).
function makeReference(prefix) {
    return 'DEMO-' + prefix + '-' + Math.floor(1000 + Math.random() * 9000);
}

/* ---------- Form feedback ---------- */

// Radio buttons share one message, so a group is handled together.
function getGroup(field) {
    if (field.type === 'radio') {
        return Array.from(field.form.querySelectorAll('input[name="' + field.name + '"]'));
    }
    return [field];
}

function showFieldError(field, message) {
    if (field.classList.contains('error')) {
        return;
    }
    const group = getGroup(field);
    const note = document.createElement('div');
    note.className = 'field-error';
    note.id = field.id + '-message';
    note.textContent = '⚠ ' + message;
    group.forEach(function (item) {
        item.classList.remove('success');
        item.classList.add('error');
        item.setAttribute('aria-invalid', 'true');
        item.setAttribute('aria-describedby', note.id);
    });
    const last = group[group.length - 1];
    const anchor = (last.type === 'radio' || last.type === 'checkbox') ? last.closest('.form-check') : last;
    anchor.after(note);
}

function clearFieldError(field) {
    if (!field.classList.contains('error')) {
        return;
    }
    const note = byId(field.getAttribute('aria-describedby'));
    if (note !== null) {
        note.remove();
    }
    getGroup(field).forEach(function (item) {
        item.classList.remove('error');
        item.removeAttribute('aria-invalid');
        item.removeAttribute('aria-describedby');
    });
}

function hideBox(box) {
    box.classList.add('hidden');
    box.replaceChildren();
}

function showBox(box, text) {
    box.textContent = text;
    box.classList.remove('hidden');
}

// summary = { title, lines: [[label, value], ...], note }
function showSummary(box, summary) {
    box.replaceChildren();
    const title = document.createElement('h3');
    title.className = 'h5 fw-bold';
    title.textContent = '✔ ' + summary.title;
    const list = document.createElement('ul');
    list.className = 'mb-3';
    summary.lines.forEach(function (pair) {
        const item = document.createElement('li');
        const label = document.createElement('strong');
        label.textContent = pair[0] + ': ';
        item.append(label, pair[1]);
        list.append(item);
    });
    const note = document.createElement('p');
    note.className = 'mb-1';
    note.textContent = summary.note;
    const demo = document.createElement('p');
    demo.className = 'mb-0 fw-semibold';
    demo.textContent = DEMO_NOTICE;
    box.append(title, list, note, demo);
    box.classList.remove('hidden');
    box.setAttribute('tabindex', '-1');
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    box.focus({ preventScroll: true });
}

/* Connects one form to its validation.
   validate() returns a list of { field, message }; onValid() returns the summary for the confirmation box.
   The error and confirmation boxes already exist in the HTML: <base>-error and <base>-result. */
function setupForm(formId, validate, onValid) {
    const form = byId(formId);
    const base = formId.replace('-form', '');
    const errorBox = byId(base + '-error');
    const resultBox = byId(base + '-result');
    form.noValidate = true; // our own messages replace the browser bubbles

    function clearAll() {
        form.querySelectorAll('.field-error').forEach(function (note) {
            note.remove();
        });
        form.querySelectorAll('.error, .success').forEach(function (item) {
            item.classList.remove('error', 'success');
            item.removeAttribute('aria-invalid');
            item.removeAttribute('aria-describedby');
        });
        hideBox(errorBox);
        hideBox(resultBox);
    }

    function onEdit(event) {
        clearFieldError(event.target);
        if (form.querySelector('.field-error') === null) {
            hideBox(errorBox);
        }
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        clearAll();
        const errors = validate();
        // the first invalid field in page order gets the focus
        errors.sort(function (a, b) {
            return a.field.compareDocumentPosition(b.field) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
        });
        errors.forEach(function (error) {
            showFieldError(error.field, error.message);
        });
        const invalid = errors.map(function (error) {
            return error.field;
        });
        form.querySelectorAll('.form-control, .form-select').forEach(function (item) {
            if (!invalid.includes(item) && item.value.trim() !== '') {
                item.classList.add('success');
            }
        });
        if (errors.length > 0) {
            showBox(errorBox, 'Please correct the highlighted fields and submit again.');
            errors[0].field.focus();
            return;
        }
        showSummary(resultBox, onValid());
    });
    form.addEventListener('input', onEdit);
    form.addEventListener('change', onEdit);
    form.addEventListener('reset', clearAll);
    return form;
}

/* ---------- Site-wide feature 1: page search in the header ---------- */

function findPages(query) {
    const words = query.toLowerCase().split(/\s+/);
    return SITE_PAGES.filter(function (page) {
        const text = (page.title + ' ' + page.description + ' ' + page.keywords).toLowerCase();
        return words.every(function (word) {
            return text.includes(word);
        });
    });
}

function createSearchItem(page) {
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    const link = document.createElement('a');
    link.href = page.url;
    link.className = 'list-group-item list-group-item-action';
    if (page.url === currentPage) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
    }
    const title = document.createElement('strong');
    title.textContent = page.title;
    const text = document.createElement('span');
    text.className = 'd-block small';
    text.textContent = page.description;
    link.append(title, text);
    return link;
}

function renderSearchResults(box, query) {
    box.replaceChildren();
    if (query === '') {
        box.classList.add('hidden');
        return 0;
    }
    const matches = findPages(query);
    const count = document.createElement('p');
    count.className = 'small mb-2';
    box.append(count);
    if (matches.length === 0) {
        count.textContent = 'No pages found for “' + query + '”. Try “audition”, “equipment” or “workshop”.';
    } else {
        count.textContent = matches.length + (matches.length === 1 ? ' page found' : ' pages found');
        const list = document.createElement('div');
        list.className = 'list-group';
        matches.forEach(function (page) {
            list.append(createSearchItem(page));
        });
        box.append(list);
    }
    box.classList.remove('hidden');
    return matches.length;
}

function setupSiteSearch() {
    const nav = byId('main-navigation');
    if (nav === null) {
        return;
    }
    const form = document.createElement('form');
    form.id = 'site-search-form';
    form.className = 'mt-3';
    form.setAttribute('role', 'search');

    const label = document.createElement('label');
    label.htmlFor = 'site-search-input';
    label.className = 'visually-hidden';
    label.textContent = 'Search the site';
    const input = createSearchInput('site-search-input', 'Search the site: audition, equipment, workshop...');
    const searchButton = document.createElement('button');
    searchButton.type = 'submit';
    searchButton.className = 'btn btn-primary';
    searchButton.textContent = 'Search';
    const clearButton = createButton('Clear', 'btn btn-outline-secondary');
    const group = document.createElement('div');
    group.className = 'input-group';
    group.append(input, searchButton, clearButton);

    const results = document.createElement('div');
    results.id = 'site-search-results';
    results.className = 'hidden mt-2';
    results.setAttribute('aria-live', 'polite');
    form.append(label, group, results);
    nav.after(form);

    function update() {
        return renderSearchResults(results, input.value.trim());
    }
    function clear() {
        input.value = '';
        update();
        input.focus();
    }

    input.addEventListener('input', update);
    input.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            clear();
        }
    });
    clearButton.addEventListener('click', clear);
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (update() > 0) {
            results.querySelector('a').focus();
        }
    });
}

/* ---------- Site-wide feature 2: next concert notice at the top of every page ---------- */

function showNextConcert() {
    const main = document.querySelector('main');
    if (main === null) {
        return;
    }
    const next = getUpcomingEvents()[0];
    const banner = document.createElement('div');
    banner.className = 'alert alert-warning d-flex flex-wrap align-items-center gap-2';
    const text = document.createElement('span');
    text.textContent = '♪ Next concert: ' + next.title + ', ' + MONTH_NAMES[next.month - 1] + ' ' + next.day +
        ' (' + describeDays(daysUntil(next.date)) + '), ' + next.place + '.';
    const link = document.createElement('a');
    link.className = 'alert-link';
    link.href = 'events.html#events-schedule';
    link.textContent = 'See all concerts';
    banner.append(text, link);
    main.prepend(banner);
}

setupSiteSearch();
showNextConcert();
