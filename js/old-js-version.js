'use strict';

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


// Adds an error for a field to the list when the message is not empty.
function addIf(errors, fieldId, message) {
    if (message !== '') {
        errors.push({ field: byId(fieldId), message: message });
    }
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

function initBandsPageOld() {
    const form = byId('band-interest-form');
    const row = document.querySelector('#bands .row');
    if (form === null || row === null) {
        return;
    }

    /* ----- Band finder: search by name, genre or member + genre filter ----- */
    const searchInput = createSearchInput('bands-search', 'Band, genre or member name');
    const genreOptions = [['all', 'All genres']];
    BANDS.forEach(function (band) {
        genreOptions.push([band.genreKey, band.genre]);
    });
    const genreSelect = createSelect('bands-genre', genreOptions);
    const resetButton = createButton('Reset', 'btn btn-outline-secondary w-100', 'bands-reset');
    const resetColumn = document.createElement('div');
    resetColumn.className = 'col-12 col-md-3';
    resetColumn.append(resetButton);
    const controls = document.createElement('div');
    controls.className = 'row g-2 align-items-end mb-2';
    controls.append(
        createField(searchInput, 'Find a band:', 'col-12 col-md-6'),
        createField(genreSelect, 'Genre:', 'col-12 col-md-3'),
        resetColumn);
    const count = document.createElement('p');
    count.id = 'bands-count';
    count.className = 'small text-muted mb-3';
    count.setAttribute('aria-live', 'polite');
    const emptyBox = document.createElement('div');
    emptyBox.id = 'bands-empty';
    emptyBox.className = 'hidden alert alert-info mt-3';
    emptyBox.textContent = 'No student group matches your search. Use “Reset” to see all groups, or send us the interest form below to start a new one.';
    row.before(controls, count);
    row.after(emptyBox);

    function matchesBand(band, query, genre) {
        const text = (band.name + ' ' + band.genre + ' ' + band.members.join(' ')).toLowerCase();
        return text.includes(query) && (genre === 'all' || band.genreKey === genre);
    }

    function renderBands() {
        const query = searchInput.value.trim().toLowerCase();
        let shown = 0;
        BANDS.forEach(function (band) {
            const column = byId(band.id).closest('.col-12');
            const visible = matchesBand(band, query, genreSelect.value);
            column.classList.toggle('hidden', !visible);
            if (visible) {
                shown++;
            }
        });
        emptyBox.classList.toggle('hidden', shown > 0);
        count.textContent = 'Showing ' + shown + ' of ' + BANDS.length + ' student groups.';
    }

    searchInput.addEventListener('input', renderBands);
    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            searchInput.value = '';
            renderBands();
        }
    });
    genreSelect.addEventListener('change', renderBands);
    resetButton.addEventListener('click', function () {
        searchInput.value = '';
        genreSelect.value = 'all';
        renderBands();
    });

    /* ----- Upcoming performances (calculated from the shared concert list) ----- */
    function createPerformanceItem(event) {
        const item = document.createElement('li');
        item.className = 'list-group-item';
        const link = document.createElement('a');
        link.href = 'events.html#events-schedule';
        link.textContent = 'see the full concert calendar';
        item.append(event.title + ' — ' + MONTH_NAMES[event.month - 1] + ' ' + event.day + ', ' + event.place +
            ' (' + describeDays(daysUntil(event.date)) + ') · ', link);
        return item;
    }

    const performances = document.querySelector('#performances ol');
    if (performances !== null) {
        performances.replaceChildren();
        getUpcomingEvents().slice(0, 3).forEach(function (event) {
            performances.append(createPerformanceItem(event));
        });
    }
}
