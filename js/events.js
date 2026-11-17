'use strict';

/* events.js - concert timetable (search, filter, sort) and the concert participation form. */

function initEventsPage() {
    const table = byId('events-table');
    if (table === null) {
        return;
    }
    const body = table.tBodies[0];
    let selectedId = '';

    const ROLE_LABELS = {
        spectator: 'Spectator',
        volunteer: 'Volunteer'
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
        const row = document.createElement('tr');
        if (event.id === selectedId) {
            row.classList.add('selected');
        }
        const dateCell = document.createElement('th');
        dateCell.scope = 'row';
        const when = document.createElement('small');
        when.className = 'd-block text-muted fw-normal';
        when.textContent = describeDays(daysUntil(event.date));
        dateCell.append(MONTH_NAMES[event.month - 1] + ' ' + event.day, when);

        const titleCell = document.createElement('td');
        const button = createButton('Register for this concert', 'btn btn-outline-primary btn-sm d-block mt-2');
        button.dataset.eventId = event.id;
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
        count.textContent = 'Showing ' + visible.length + ' of ' + EVENTS.length + ' concerts.';
    }

    /* ----- Concert list of the form: the same data as the timetable ----- */
    const concertSelect = byId('concert-choice');
    const upcoming = getUpcomingEvents();
    upcoming.forEach(function (event) {
        const option = document.createElement('option');
        option.value = event.id;
        option.textContent = event.title + ' — ' + formatDateLong(event.date);
        concertSelect.append(option);
    });
    if (upcoming.length === 0) {
        byId('concert-empty').classList.remove('hidden');
        concertSelect.disabled = true;
        byId('concert-participation-submit').disabled = true;
    }

    // Fills the form with the chosen concert.
    function selectEvent(id) {
        selectedId = id;
        const event = upcoming.find(function (item) {
            return item.id === id;
        });
        concertSelect.value = id;
        if (event !== undefined) {
            message.textContent = 'Selected: ' + event.title + ', ' + formatDateLong(event.date) + '. The participation form below is filled in.';
        } else {
            message.textContent = '';
        }
        clearFieldError(concertSelect);
        render();
    }

    body.addEventListener('click', function (event) {
        const button = event.target.closest('button[data-event-id]');
        if (button === null) {
            return;
        }
        selectEvent(button.dataset.eventId);
        byId('participation-form').scrollIntoView({ behavior: 'smooth' });
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
    concertSelect.addEventListener('change', function () {
        selectEvent(concertSelect.value);
    });

    /* ----- Participation form ----- */
    const volunteerDetails = byId('volunteer-details');
    const taskSelect = byId('volunteer-task');

    // Only volunteers see the responsibility field.
    function showVolunteerDetails() {
        const isVolunteer = getChecked('participation_role') === 'volunteer';
        volunteerDetails.classList.toggle('hidden', !isVolunteer);
        if (!isVolunteer) {
            taskSelect.value = '';
        }
    }

    function validate() {
        const errors = [];
        addIf(errors, 'participant-name', nameProblem(getValue('participant-name')));
        addIf(errors, 'participant-email', emailProblem(getValue('participant-email'), true));
        addIf(errors, 'concert-choice', choiceProblem(getValue('concert-choice'), 'Choose an upcoming concert.'));
        addIf(errors, 'role-spectator', choiceProblem(getChecked('participation_role'), 'Choose your role: spectator or volunteer.'));
        return errors;
    }

    function buildSummary() {
        const event = upcoming.find(function (item) {
            return item.id === getValue('concert-choice');
        });
        const role = getChecked('participation_role');
        const lines = [
            ['Name', getValue('participant-name')],
            ['Email', getValue('participant-email')],
            ['Concert', event.title + ', ' + formatDateLong(event.date) + ', ' + event.place],
            ['Role', ROLE_LABELS[role]]
        ];
        if (role === 'volunteer') {
            lines.push(['Responsibility', getSelectedText('volunteer-task')]);
        }
        lines.push(['Demo reference', makeReference('CONCERT')]);
        return {
            title: 'Demonstration concert registration prepared',
            lines: lines,
            note: 'No ticket or volunteer shift is booked by this demonstration; it only shows how a confirmation would look.'
        };
    }

    setupForm('concert-participation-form', validate, buildSummary);
    byId('concert-participation-form').querySelectorAll('input[name="participation_role"]').forEach(function (radio) {
        radio.addEventListener('change', showVolunteerDetails);
    });
    byId('concert-participation-form').addEventListener('reset', function () {
        selectedId = '';
        message.textContent = '';
        setTimeout(showVolunteerDetails, 0);
        render();
    });
    render();
}

initEventsPage();
