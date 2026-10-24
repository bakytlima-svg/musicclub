'use strict';

/* equipment.js - inventory (search, filter, sort, totals) and the equipment request form. */

function initEquipmentPage() {
    const table = byId('equipment-table');
    if (table === null) {
        return;
    }
    const body = table.tBodies[0];
    const bookings = []; // demonstration reservations, kept only until the page is reloaded
    let selectedId = '';

    function findItem(id) {
        return EQUIPMENT.find(function (item) {
            return item.id === id;
        });
    }

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

    // One function builds every row of the inventory.
    function createItemRow(item) {
        const row = document.createElement('tr');
        if (item.id === selectedId) {
            row.classList.add('selected');
        }
        const nameCell = document.createElement('td');
        const button = createButton('Request this item', 'btn btn-outline-primary btn-sm d-block mt-2');
        button.dataset.itemId = item.id;
        nameCell.append(item.name, button);
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
        const select = byId('request-item');
        select.value = id;
        clearFieldError(select);
        message.textContent = item === undefined ? '' : 'Selected: ' + item.name + '. The request form below is filled in.';
        render();
    }

    body.addEventListener('click', function (event) {
        const button = event.target.closest('button[data-item-id]');
        if (button === null) {
            return;
        }
        selectItem(button.dataset.itemId);
        byId('equipment-request').scrollIntoView({ behavior: 'smooth' });
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
    byId('request-item').addEventListener('change', function () {
        selectItem(byId('request-item').value);
    });

    /* ----- Request form ----- */
    function validate() {
        const errors = [];
        const type = getChecked('request_type');
        addIf(errors, 'request-type-book', choiceProblem(type, 'Choose the type of request.'));
        addIf(errors, 'request-name', nameProblem(getValue('request-name')));
        addIf(errors, 'request-email', emailProblem(getValue('request-email'), true));

        const item = findItem(getValue('request-item'));
        const dateText = getValue('request-date');
        const date = parseDateInput(dateText);
        let dateError = '';
        if (type === 'book') {
            dateError = dateProblem(dateText, addDays(getToday(), 1), 'Book at least one day ahead: choose tomorrow or later.');
        } else if (type === 'report') {
            dateError = dateProblem(dateText, new Date(2000, 0, 1), '');
            if (dateError === '' && date > getToday()) {
                dateError = 'Enter the day the problem happened (today or earlier).';
            }
        } else {
            dateError = dateProblem(dateText, new Date(2000, 0, 1), '');
        }
        addIf(errors, 'request-date', dateError);

        // Availability of the chosen item on the chosen date (booking requests only).
        if (item === undefined) {
            addIf(errors, 'request-item', 'Choose the equipment.');
        } else if (type === 'book' && dateError === '') {
            const concert = EVENTS.find(function (event) {
                return event.month === date.getMonth() + 1 && event.day === date.getDate();
            });
            const used = bookings.filter(function (booking) {
                return booking.itemId === item.id && booking.date === dateText;
            }).length;
            if (item.group === 'Audio' && concert !== undefined) {
                addIf(errors, 'request-item', 'Audio equipment is needed for ' + concert.title + ' on that date. Choose another day.');
            } else if (used >= item.quantity) {
                addIf(errors, 'request-item', 'No unit of ' + item.name + ' is left on ' + formatDateLong(date) +
                    ' (all ' + item.quantity + ' already requested).');
            }
        }

        addIf(errors, 'request-details-text', textProblem(getValue('request-details-text'), 10, 400, 'Details'));
        if (!byId('request-agree').checked) {
            addIf(errors, 'request-agree', 'You must agree to return shared equipment after use.');
        }
        return errors;
    }

    function buildSummary() {
        const item = findItem(getValue('request-item'));
        const type = getChecked('request_type');
        if (type === 'book') {
            bookings.push({ itemId: item.id, date: getValue('request-date') });
        }
        return {
            title: type === 'book' ? 'Demonstration booking request prepared' : 'Demonstration malfunction report prepared',
            lines: [
                ['Request type', getCheckedLabel('request_type')],
                ['Name', getValue('request-name')],
                ['Email', getValue('request-email')],
                ['Equipment', item.name + ' (' + item.type + ')'],
                [type === 'book' ? 'Date of use' : 'Date of the problem', formatDateLong(parseDateInput(getValue('request-date')))],
                ['Details', getValue('request-details-text')],
                ['Demo reference', makeReference(type === 'book' ? 'GEAR' : 'FIX')]
            ],
            note: type === 'book'
                ? 'The unit is counted as requested only in this browser tab until you reload the page.'
                : 'No repair was ordered: the report is shown only as a demonstration.'
        };
    }

    setupForm('equipment-request-form', validate, buildSummary);
    byId('equipment-request-form').addEventListener('reset', function () {
        selectedId = '';
        message.textContent = '';
        render();
    });
    render();
}

initEquipmentPage();
