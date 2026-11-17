'use strict';

/* equipment.js - inventory (search, filter, sort, totals) and the equipment reservation form. */

function initEquipmentPage() {
    const table = byId('equipment-table');
    if (table === null) {
        return;
    }
    const body = table.tBodies[0];
    const MIN_MINUTES = 30; // shortest reservation
    const reservations = []; // demonstration reservations, kept only until the page is reloaded
    let selectedId = '';

    function findItem(id) {
        return EQUIPMENT.find(function (item) {
            return item.id === id;
        });
    }

    /* ----- Equipment list of the form: the same data as the inventory table ----- */
    EQUIPMENT.forEach(function (item) {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name + ' (' + item.type + ')';
        byId('reservation-item').append(option);
    });

    /* ----- Controls above the table ----- */
    const groupOptions = [['all', 'All groups']];
    const groups = [];
    EQUIPMENT.forEach(function (item) {
        if (!groups.includes(item.group)) {
            groups.push(item.group);
            groupOptions.push([item.group, item.group]);
        }
    });
    const searchInput = createSearchInput('equipment-search', 'Name, type or use');
    const groupSelect = createSelect('equipment-group', groupOptions);
    const sortSelect = createSelect('equipment-sort', [['name', 'Name A–Z'], ['quantity', 'Most units first']]);
    const resetButton = createButton('Reset filters', 'btn btn-outline-secondary w-100', 'equipment-reset');
    const resetColumn = document.createElement('div');
    resetColumn.className = 'col-12 col-md-2';
    resetColumn.append(resetButton);
    const controls = document.createElement('div');
    controls.className = 'row g-2 align-items-end mb-2';
    controls.append(
        createField(searchInput, 'Search equipment:', 'col-12 col-md-4'),
        createField(groupSelect, 'Group:', 'col-6 col-md-3'),
        createField(sortSelect, 'Sort by:', 'col-6 col-md-3'),
        resetColumn);
    const count = document.createElement('p');
    count.id = 'equipment-count';
    count.className = 'small text-muted mb-1';
    count.setAttribute('aria-live', 'polite');
    const message = document.createElement('p');
    message.id = 'equipment-message';
    message.className = 'small fw-semibold mb-2';
    message.setAttribute('aria-live', 'polite');
    table.parentElement.before(controls, count, message);

    /* ----- Table ----- */
    function getVisibleItems() {
        const query = searchInput.value.trim().toLowerCase();
        const list = EQUIPMENT.filter(function (item) {
            const text = (item.name + ' ' + item.type + ' ' + item.use).toLowerCase();
            return text.includes(query) && (groupSelect.value === 'all' || item.group === groupSelect.value);
        });
        list.sort(function (a, b) {
            if (sortSelect.value === 'quantity') {
                return b.quantity - a.quantity || a.name.localeCompare(b.name);
            }
            return a.name.localeCompare(b.name);
        });
        return list;
    }

    function totalUnits(list) {
        return list.reduce(function (sum, item) {
            return sum + item.quantity;
        }, 0);
    }

    function countReservations(itemId) {
        return reservations.filter(function (reservation) {
            return reservation.itemId === itemId;
        }).length;
    }

    // One function builds every row of the inventory.
    function createItemRow(item) {
        const row = document.createElement('tr');
        if (item.id === selectedId) {
            row.classList.add('selected');
        }
        const nameCell = document.createElement('td');
        const button = createButton('Reserve this item', 'btn btn-outline-primary btn-sm d-block mt-2');
        button.dataset.itemId = item.id;
        nameCell.append(item.name, button);
        const reserved = countReservations(item.id);
        if (reserved > 0) {
            const note = document.createElement('small');
            note.className = 'd-block text-success';
            note.textContent = reserved + (reserved === 1 ? ' reservation' : ' reservations') + ' made in this session';
            nameCell.append(note);
        }
        row.append(nameCell, makeCell(item.type), makeCell(String(item.quantity)), makeCell(item.use));
        return row;
    }

    function render() {
        const visible = getVisibleItems();
        body.replaceChildren();
        visible.forEach(function (item) {
            body.append(createItemRow(item));
        });
        if (visible.length === 0) {
            const row = document.createElement('tr');
            const cell = makeCell('No equipment matches your search. Use “Reset filters” to see all ' + EQUIPMENT.length + ' items.');
            cell.colSpan = 4;
            row.append(cell);
            body.append(row);
        }
        count.textContent = 'Showing ' + visible.length + ' of ' + EQUIPMENT.length + ' items (' +
            totalUnits(visible) + ' of ' + totalUnits(EQUIPMENT) + ' units).';
    }

    function selectItem(id) {
        selectedId = id;
        const item = findItem(id);
        const select = byId('reservation-item');
        select.value = id;
        clearFieldError(select);
        message.textContent = item === undefined ? '' : 'Selected: ' + item.name + '. The reservation form below is filled in.';
        render();
    }

    body.addEventListener('click', function (event) {
        const button = event.target.closest('button[data-item-id]');
        if (button === null) {
            return;
        }
        selectItem(button.dataset.itemId);
        byId('equipment-reservation').scrollIntoView({ behavior: 'smooth' });
    });
    searchInput.addEventListener('input', render);
    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            searchInput.value = '';
            render();
        }
    });
    groupSelect.addEventListener('change', render);
    sortSelect.addEventListener('change', render);
    resetButton.addEventListener('click', function () {
        searchInput.value = '';
        groupSelect.value = 'all';
        sortSelect.value = 'name';
        render();
    });
    byId('reservation-item').addEventListener('change', function () {
        selectItem(byId('reservation-item').value);
    });

    /* ----- Reservation form ----- */
    byId('reservation-date').min = formatDateInput(addDays(getToday(), 1));

    function validate() {
        const errors = [];
        addIf(errors, 'reservation-name', nameProblem(getValue('reservation-name')));
        addIf(errors, 'reservation-email', emailProblem(getValue('reservation-email'), true));

        const item = findItem(getValue('reservation-item'));
        addIf(errors, 'reservation-item', item === undefined ? 'Choose the equipment.' : '');

        const dateText = getValue('reservation-date');
        const dateError = dateProblem(dateText, addDays(getToday(), 1), 'Reserve at least one day ahead: choose tomorrow or later.');
        const startError = timeProblem(getValue('reservation-start'), 'start');
        const endError = timeProblem(getValue('reservation-end'), 'end');
        addIf(errors, 'reservation-date', dateError);
        addIf(errors, 'reservation-start', startError);
        addIf(errors, 'reservation-end', endError);

        // Rules that combine fields: the times must make sense and the item must be free in that window.
        if (startError === '' && endError === '') {
            const start = toMinutes(getValue('reservation-start'));
            const end = toMinutes(getValue('reservation-end'));
            if (end <= start) {
                addIf(errors, 'reservation-end', 'The end time must be later than the start time.');
            } else if (end - start < MIN_MINUTES) {
                addIf(errors, 'reservation-end', 'A reservation lasts at least ' + MIN_MINUTES + ' minutes.');
            } else if (item !== undefined && dateError === '') {
                const date = parseDateInput(dateText);
                const concert = EVENTS.find(function (event) {
                    return event.month === date.getMonth() + 1 && event.day === date.getDate();
                });
                const overlapping = reservations.filter(function (reservation) {
                    return reservation.itemId === item.id && reservation.date === dateText &&
                        start < reservation.end && reservation.start < end;
                }).length;
                if (item.group === 'Audio' && concert !== undefined) {
                    addIf(errors, 'reservation-item', 'Audio equipment is needed for ' + concert.title + ' on that date. Choose another day.');
                } else if (overlapping >= item.quantity) {
                    addIf(errors, 'reservation-item', 'No unit of ' + item.name + ' is free on ' + formatDateLong(date) +
                        ' at that time (all ' + item.quantity + ' already reserved).');
                }
            }
        }

        addIf(errors, 'reservation-purpose', textProblem(getValue('reservation-purpose'), 10, 400, 'Purpose of the reservation'));
        if (!byId('reservation-agree').checked) {
            addIf(errors, 'reservation-agree', 'You must agree to return shared equipment after use.');
        }
        return errors;
    }

    function buildSummary() {
        const item = findItem(getValue('reservation-item'));
        const start = toMinutes(getValue('reservation-start'));
        const end = toMinutes(getValue('reservation-end'));
        reservations.push({ itemId: item.id, date: getValue('reservation-date'), start: start, end: end });
        render();
        return {
            title: 'Demonstration reservation request prepared',
            lines: [
                ['Name', getValue('reservation-name')],
                ['Email', getValue('reservation-email')],
                ['Equipment', item.name + ' (' + item.type + ')'],
                ['Date', formatDateLong(parseDateInput(getValue('reservation-date')))],
                ['Time', getValue('reservation-start') + '–' + getValue('reservation-end') + ' (' + ((end - start) / 60) + ' h)'],
                ['Purpose', getValue('reservation-purpose')],
                ['Demo reference', makeReference('GEAR')]
            ],
            note: 'The unit is counted as reserved only in this browser tab until you reload the page.'
        };
    }

    setupForm('equipment-reservation-form', validate, buildSummary);
    byId('equipment-reservation-form').addEventListener('reset', function () {
        selectedId = '';
        message.textContent = '';
        render();
    });
    render();
}

initEquipmentPage();
