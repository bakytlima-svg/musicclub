'use strict';

/* events.js - concert timetable (search, filter, sort) and performer registration form. */

function initEventsPage() {
    const table = byId('events-table');
    if (table === null) {
        return;
    }
    const body = table.tBodies[0];
    const DEADLINE_DAYS = 14; // the page says: apply at least two weeks before the show
    let selectedId = '';

    const ENSEMBLE_RULES = {
        'solo': { label: 'solo performer', min: 1, max: 1 },
        'duo': { label: 'acoustic duo / trio', min: 2, max: 3 },
        'full-band': { label: 'full electric band', min: 4, max: 15 }
    };

    /* ----- Controls above the table ----- */
    const searchInput = createSearchInput('events-search', 'Title, place or style');
    const termSelect = createSelect('events-term', [['all', 'All terms'], ['Autumn', 'Autumn term'], ['Spring', 'Spring term']]);
    const sortSelect = createSelect('events-sort', [['calendar', 'Calendar order'], ['soonest', 'Soonest first']]);
    const resetButton = createButton('Reset filters', 'btn btn-outline-secondary w-100', 'events-reset');
    const controls = document.createElement('div');
    controls.className = 'row g-2 align-items-end mb-2';
    controls.append(
        createField(searchInput, 'Search concerts:', 'col-12 col-md-4'),
        createField(termSelect, 'Term:', 'col-6 col-md-3'),
        createField(sortSelect, 'Sort by:', 'col-6 col-md-3'));
    const resetColumn = document.createElement('div');
    resetColumn.className = 'col-12 col-md-2';
    resetColumn.append(resetButton);
    controls.append(resetColumn);

    const count = document.createElement('p');
    count.id = 'events-count';
    count.className = 'small text-muted mb-1';
    count.setAttribute('aria-live', 'polite');
    const message = document.createElement('p');
    message.id = 'events-message';
    message.className = 'small fw-semibold mb-2';
    message.setAttribute('aria-live', 'polite');
    table.parentElement.before(controls, count, message);

    /* ----- Table ----- */
    function getVisibleEvents() {
        const query = searchInput.value.trim().toLowerCase();
        const list = getUpcomingEvents().filter(function (event) {
            const text = (event.title + ' ' + event.place + ' ' + event.style).toLowerCase();
            return text.includes(query) && (termSelect.value === 'all' || event.term === termSelect.value);
        });
        if (sortSelect.value === 'calendar') {
            list.sort(function (a, b) {
                return a.month - b.month || a.day - b.day;
            });
        }
        return list;
    }

    // One function builds every row of the table.
    function createEventRow(event) {
        const days = daysUntil(event.date);
        const row = document.createElement('tr');
        if (event.id === selectedId) {
            row.classList.add('selected');
        }
        const dateCell = document.createElement('th');
        dateCell.scope = 'row';
        const when = document.createElement('small');
        when.className = 'd-block text-muted fw-normal';
        when.textContent = describeDays(days);
        dateCell.append(MONTH_NAMES[event.month - 1] + ' ' + event.day, when);

        const titleCell = document.createElement('td');
        const button = createButton('Choose for my application', 'btn btn-outline-primary btn-sm d-block mt-2');
        button.dataset.eventId = event.id;
        if (days < DEADLINE_DAYS) {
            button.disabled = true;
            button.textContent = 'Applications closed';
        }
        titleCell.append(event.title, button);
        row.append(dateCell, titleCell, makeCell(event.place), makeCell(event.style));
        return row;
    }

    function render() {
        const visible = getVisibleEvents();
        body.replaceChildren();
        visible.forEach(function (event) {
            body.append(createEventRow(event));
        });
        if (visible.length === 0) {
            const row = document.createElement('tr');
            const cell = makeCell('No concerts match your search. Use “Reset filters” to see all ' + EVENTS.length + ' concerts.');
            cell.colSpan = 4;
            row.append(cell);
            body.append(row);
        }
        count.textContent = 'Showing ' + visible.length + ' of ' + EVENTS.length + ' concerts. Applications close ' +
            DEADLINE_DAYS + ' days before each show.';
    }

    // Fills the registration form with the chosen concert.
    function selectEvent(id) {
        selectedId = id;
        const event = EVENTS.find(function (item) {
            return item.id === id;
        });
        const eventSelect = byId('target-event');
        const dateField = byId('performance-date');
        eventSelect.value = id;
        if (event !== undefined) {
            const date = getNextOccurrence(event.month, event.day);
            dateField.value = formatDateInput(date);
            message.textContent = 'Selected: ' + event.title + ', ' + formatDateLong(date) + '. The registration form below is filled in.';
        } else {
            message.textContent = '';
        }
        clearFieldError(eventSelect);
        clearFieldError(dateField);
        render();
    }

    body.addEventListener('click', function (event) {
        const button = event.target.closest('button[data-event-id]');
        if (button === null) {
            return;
        }
        selectEvent(button.dataset.eventId);
        byId('performer-signup').scrollIntoView({ behavior: 'smooth' });
    });
    searchInput.addEventListener('input', render);
    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            searchInput.value = '';
            render();
        }
    });
    termSelect.addEventListener('change', render);
    sortSelect.addEventListener('change', render);
    resetButton.addEventListener('click', function () {
        searchInput.value = '';
        termSelect.value = 'all';
        sortSelect.value = 'calendar';
        render();
    });
    byId('target-event').addEventListener('change', function () {
        selectEvent(byId('target-event').value);
    });
    byId('performance-date').min = formatDateInput(getToday());

    /* ----- Registration form ----- */
    function validate() {
        const errors = [];
        addIf(errors, 'lead-name', nameProblem(getValue('lead-name')));
        addIf(errors, 'student-email', emailProblem(getValue('student-email'), true));
        addIf(errors, 'contact-phone', phoneProblem(getValue('contact-phone')));

        const sizeError = numberProblem(getValue('ensemble-members'), 1, 15, 'Number of musicians');
        addIf(errors, 'ensemble-members', sizeError);
        const type = getChecked('ensemble_type');
        addIf(errors, 'format-solo', choiceProblem(type, 'Choose the ensemble category.'));

        const event = EVENTS.find(function (item) {
            return item.id === getValue('target-event');
        });
        let eventDate = null;
        if (event === undefined) {
            addIf(errors, 'target-event', 'Choose the campus event.');
        } else {
            eventDate = getNextOccurrence(event.month, event.day);
            const left = daysUntil(eventDate);
            if (left < DEADLINE_DAYS) {
                addIf(errors, 'target-event', 'Applications for ' + event.title + ' are closed: they must be sent at least ' +
                    DEADLINE_DAYS + ' days before the show (it is ' + describeDays(left) + ').');
            }
        }

        const dateText = getValue('performance-date');
        const dateError = dateProblem(dateText, getToday(), 'The concert date cannot be in the past.');
        if (dateError !== '') {
            addIf(errors, 'performance-date', dateError);
        } else if (event !== undefined && dateText !== formatDateInput(eventDate)) {
            addIf(errors, 'performance-date', 'The date must match the event: ' + event.title + ' takes place on ' +
                formatDateLong(eventDate) + '.');
        }

        // Rules that combine fields: category vs. number of musicians, category vs. type of event.
        if (type !== '' && sizeError === '') {
            const rule = ENSEMBLE_RULES[type];
            const size = Number(getValue('ensemble-members'));
            if (size < rule.min || size > rule.max) {
                const range = rule.min === rule.max ? String(rule.min) : rule.min + '–' + rule.max;
                addIf(errors, 'ensemble-members', 'A ' + rule.label + ' has ' + range + ' musician(s), but you entered ' + size + '.');
            }
        }
        if (type === 'full-band' && event !== undefined && !event.electricAllowed) {
            addIf(errors, 'format-solo', event.title + ' is an unplugged evening: choose Solo or Acoustic Duo / Trio.');
        }

        addIf(errors, 'song-list', textProblem(getValue('song-list'), 10, 500, 'Setlist and technical requirements'));
        if (!byId('rehearsal-pledge').checked) {
            addIf(errors, 'rehearsal-pledge', 'You must agree to attend the pre-concert soundchecks.');
        }
        return errors;
    }

    function buildSummary() {
        const event = EVENTS.find(function (item) {
            return item.id === getValue('target-event');
        });
        return {
            title: 'Demonstration stage application prepared',
            lines: [
                ['Applicant', getValue('lead-name')],
                ['Email', getValue('student-email')],
                ['Phone', formatPhone(getValue('contact-phone'))],
                ['Concert', event.title + ', ' + formatDateLong(getNextOccurrence(event.month, event.day)) + ', ' + event.place],
                ['Category', getCheckedLabel('ensemble_type')],
                ['Musicians on stage', getValue('ensemble-members')],
                ['Setlist and technical needs', getValue('song-list')],
                ['Demo reference', makeReference('STAGE')]
            ],
            note: 'The next steps of the real workflow (screening, dress rehearsal) are not scheduled by this demonstration.'
        };
    }

    setupForm('performer-signup-form', validate, buildSummary);
    byId('performer-signup-form').addEventListener('reset', function () {
        selectedId = '';
        message.textContent = '';
        render();
    });
    render();
}

initEventsPage();
