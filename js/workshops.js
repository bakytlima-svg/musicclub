'use strict';

/* workshops.js - workshop timetable (search, filter, seats) and the seat registration form. */

function initWorkshopsPage() {
    const table = byId('workshops-table');
    if (table === null) {
        return;
    }
    const body = table.tBodies[0];
    const NOTES_LIMIT = 200;
    const seatsLeft = {};     // seats left per workshop (demonstration, reset on reload)
    const registered = [];    // { email, id } of demonstration registrations
    let selectedId = '';
    WORKSHOPS.forEach(function (workshop) {
        seatsLeft[workshop.id] = workshop.seats;
    });

    function findWorkshop(id) {
        return WORKSHOPS.find(function (workshop) {
            return workshop.id === id;
        });
    }

    function formatSession(workshop) {
        const date = getNextWeekdayDate(workshop.weekday, workshop.time);
        return formatDateLong(date) + ', ' + workshop.time;
    }

    /* ----- Controls above the table ----- */
    const dayOptions = [['all', 'All days']];
    WORKSHOPS.forEach(function (workshop) {
        dayOptions.push([workshop.dayName, workshop.dayName]);
    });
    const searchInput = createSearchInput('workshops-search', 'Topic or instructor');
    const daySelect = createSelect('workshops-day', dayOptions);
    const resetButton = createButton('Reset', 'btn btn-outline-secondary w-100', 'workshops-reset');
    const resetColumn = document.createElement('div');
    resetColumn.className = 'col-12 col-md-3';
    resetColumn.append(resetButton);
    const controls = document.createElement('div');
    controls.className = 'row g-2 align-items-end mb-2';
    controls.append(
        createField(searchInput, 'Search workshops:', 'col-12 col-md-6'),
        createField(daySelect, 'Day:', 'col-12 col-md-3'),
        resetColumn);
    const count = document.createElement('p');
    count.id = 'workshops-count';
    count.className = 'small text-muted mb-2';
    count.setAttribute('aria-live', 'polite');
    table.parentElement.before(controls, count);

    /* ----- Table ----- */
    function getVisibleWorkshops() {
        const query = searchInput.value.trim().toLowerCase();
        return WORKSHOPS.filter(function (workshop) {
            const text = (workshop.topic + ' ' + workshop.instructor).toLowerCase();
            return text.includes(query) && (daySelect.value === 'all' || workshop.dayName === daySelect.value);
        });
    }

    // One function builds every row of the timetable.
    function createWorkshopRow(workshop) {
        const row = document.createElement('tr');
        if (workshop.id === selectedId) {
            row.classList.add('selected');
        }
        const timeCell = document.createElement('th');
        timeCell.scope = 'row';
        const next = document.createElement('small');
        next.className = 'd-block text-muted fw-normal';
        next.textContent = 'Next: ' + formatSession(workshop);
        timeCell.append(workshop.dayName + ', ' + workshop.time, next);

        const actionCell = document.createElement('td');
        const left = seatsLeft[workshop.id];
        if (left > 0) {
            const link = document.createElement('a');
            link.className = 'btn btn-outline-primary btn-sm';
            link.href = '#workshop-registration';
            link.textContent = 'Register';
            link.dataset.workshop = workshop.id;
            actionCell.append(link);
        } else {
            const full = document.createElement('span');
            full.className = 'badge bg-secondary';
            full.textContent = 'Full';
            actionCell.append(full);
        }
        const seats = document.createElement('small');
        seats.className = 'd-block text-muted';
        seats.textContent = left + (left === 1 ? ' seat left' : ' seats left');
        actionCell.append(seats);

        row.append(timeCell, makeCell(workshop.topic), makeCell(workshop.instructor), makeCell(workshop.room), actionCell);
        return row;
    }

    function render() {
        const visible = getVisibleWorkshops();
        body.replaceChildren();
        visible.forEach(function (workshop) {
            body.append(createWorkshopRow(workshop));
        });
        if (visible.length === 0) {
            const row = document.createElement('tr');
            const cell = makeCell('No workshop matches your search. Use “Reset” to see all ' + WORKSHOPS.length + ' workshops.');
            cell.colSpan = 5;
            row.append(cell);
            body.append(row);
        }
        count.textContent = 'Showing ' + visible.length + ' of ' + WORKSHOPS.length + ' workshops.';
    }

    function chooseWorkshop(id) {
        selectedId = id;
        const select = byId('workshop-choice');
        select.value = id;
        clearFieldError(select);
        render();
    }

    body.addEventListener('click', function (event) {
        const link = event.target.closest('a[data-workshop]');
        if (link === null) {
            return;
        }
        chooseWorkshop(link.dataset.workshop);
        byId('workshop-choice').focus();
    });
    searchInput.addEventListener('input', render);
    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            searchInput.value = '';
            render();
        }
    });
    daySelect.addEventListener('change', render);
    resetButton.addEventListener('click', function () {
        searchInput.value = '';
        daySelect.value = 'all';
        render();
    });
    byId('workshop-choice').addEventListener('change', function () {
        chooseWorkshop(byId('workshop-choice').value);
    });

    /* ----- Character counter for the notes field ----- */
    const notes = byId('workshop-notes');
    const counter = document.createElement('div');
    counter.id = 'workshop-notes-counter';
    counter.className = 'form-text';
    notes.after(counter);

    function updateCounter() {
        counter.textContent = notes.value.length + ' / ' + NOTES_LIMIT + ' characters';
        counter.classList.toggle('text-danger', notes.value.length > NOTES_LIMIT);
    }
    notes.addEventListener('input', updateCounter);

    /* ----- Registration form ----- */
    function validate() {
        const errors = [];
        addIf(errors, 'workshop-name', nameProblem(getValue('workshop-name')));
        addIf(errors, 'workshop-email', emailProblem(getValue('workshop-email'), true));

        const workshop = findWorkshop(getValue('workshop-choice'));
        const bring = getValue('workshop-bring');
        if (workshop === undefined) {
            addIf(errors, 'workshop-choice', 'Choose a workshop.');
        } else if (seatsLeft[workshop.id] === 0) {
            addIf(errors, 'workshop-choice', 'This workshop is full. Choose another one.');
        } else if (registered.some(function (item) {
            return item.email === getValue('workshop-email').toLowerCase() && item.id === workshop.id;
        })) {
            addIf(errors, 'workshop-choice', 'This email is already registered for this workshop.');
        }

        addIf(errors, 'level-beginner', choiceProblem(getChecked('workshop_level'), 'Choose your level.'));
        addIf(errors, 'workshop-bring', choiceProblem(bring, 'Tell us what you will bring.'));
        // Rule that combines two fields: some workshops need your own instrument.
        if (workshop !== undefined && bring !== '' && workshop.needsBring !== '' && bring !== workshop.needsBring) {
            addIf(errors, 'workshop-bring', 'For "' + workshop.topic + '" bring your electric instrument and a 6.35mm jack cable.');
        }
        if (notes.value.length > NOTES_LIMIT) {
            addIf(errors, 'workshop-notes', 'Write at most ' + NOTES_LIMIT + ' characters (now ' + notes.value.length + ').');
        }
        return errors;
    }

    function buildSummary() {
        const workshop = findWorkshop(getValue('workshop-choice'));
        seatsLeft[workshop.id] = seatsLeft[workshop.id] - 1;
        registered.push({ email: getValue('workshop-email').toLowerCase(), id: workshop.id });
        render();
        const lines = [
            ['Name', getValue('workshop-name')],
            ['Email', getValue('workshop-email')],
            ['Workshop', workshop.topic],
            ['Next session', formatSession(workshop) + ', ' + workshop.room],
            ['Instructor', workshop.instructor],
            ['Level', getCheckedLabel('workshop_level')],
            ['You bring', getSelectedText('workshop-bring')],
            ['Seats left after this request', String(seatsLeft[workshop.id])]
        ];
        if (getValue('workshop-notes') !== '') {
            lines.push(['Notes for the instructor', getValue('workshop-notes')]);
        }
        lines.push(['Demo reference', makeReference('WS')]);
        return {
            title: 'Demonstration seat request prepared',
            lines: lines,
            note: 'The seat counter changes only in this browser tab and returns to normal when you reload the page.'
        };
    }

    setupForm('workshop-registration-form', validate, buildSummary);
    byId('workshop-registration-form').addEventListener('reset', function () {
        selectedId = '';
        setTimeout(updateCounter, 0);
        render();
    });
    updateCounter();
    render();
}

initWorkshopsPage();
