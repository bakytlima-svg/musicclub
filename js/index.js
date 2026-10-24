'use strict';

/* index.js - home page: filter for the weekly rehearsal timetable. */

function initSchedule() {
    const table = byId('rehearsal-schedule-table');
    if (table === null) {
        return;
    }
    const body = table.tBodies[0];
    const todayWeekday = new Date().getDay();

    // Controls above the table (created with DOM methods).
    const dayOptions = [['all', 'All days']];
    [1, 2, 3, 4, 5, 6, 0].forEach(function (weekday) {
        dayOptions.push([String(weekday), WEEKDAY_NAMES[weekday]]);
    });
    const daySelect = createSelect('schedule-day', dayOptions);
    const todayButton = createButton('Show today', 'btn btn-outline-primary', 'schedule-today');
    const resetButton = createButton('Show all days', 'btn btn-outline-secondary', 'schedule-reset');
    const count = document.createElement('p');
    count.id = 'schedule-count';
    count.className = 'small text-muted mb-2';
    count.setAttribute('aria-live', 'polite');

    const controls = document.createElement('div');
    controls.className = 'd-flex flex-wrap align-items-end gap-2 mb-2';
    controls.append(createField(daySelect, 'Show weekday:', ''), todayButton, resetButton);
    table.parentElement.before(controls, count);

    function filterSchedule(day) {
        if (day === 'all') {
            return REHEARSAL_SCHEDULE;
        }
        return REHEARSAL_SCHEDULE.filter(function (slot) {
            return String(slot.weekday) === day;
        });
    }

    // One function builds every row of the table.
    function createScheduleRow(slot) {
        const row = document.createElement('tr');
        const dayCell = document.createElement('th');
        dayCell.scope = 'row';
        dayCell.textContent = slot.dayName;
        if (slot.weekday === todayWeekday) {
            row.classList.add('active');
            const badge = document.createElement('span');
            badge.className = 'badge bg-primary ms-2';
            badge.textContent = 'Today';
            dayCell.append(badge);
        }
        row.append(dayCell, makeCell(slot.start + ' – ' + slot.end), makeCell(slot.band), makeCell(slot.genre));
        return row;
    }

    // Empty state: the chosen weekday has no registered band.
    function createEmptyRow(day) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 4;
        const link = document.createElement('a');
        link.href = 'about.html#studio-booking';
        link.textContent = 'Book a rehearsal slot';
        cell.append('No registered band rehearses on ' + WEEKDAY_NAMES[Number(day)] + ', so the room is free. ', link);
        row.append(cell);
        return row;
    }

    function render(day) {
        const visible = filterSchedule(day);
        body.replaceChildren();
        visible.forEach(function (slot) {
            body.append(createScheduleRow(slot));
        });
        if (visible.length === 0) {
            body.append(createEmptyRow(day));
        }
        daySelect.value = day;
        count.textContent = 'Showing ' + visible.length + ' of ' + REHEARSAL_SCHEDULE.length + ' registered rehearsal slots.';
    }

    daySelect.addEventListener('change', function () {
        render(daySelect.value);
    });
    todayButton.addEventListener('click', function () {
        render(String(todayWeekday));
    });
    resetButton.addEventListener('click', function () {
        render('all');
    });
    render('all');
}

initSchedule();
