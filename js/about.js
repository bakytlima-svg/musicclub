'use strict';

/* about.js - studio booking: free-slot finder, live summary and form validation. */

function initBookingPage() {
    const form = byId('studio-booking-form');
    if (form === null) {
        return;
    }

    const MIN_LENGTH = 60;  // minutes
    const MAX_LENGTH = 180; // minutes
    const sessionBookings = []; // demonstration reservations, kept only until the page is reloaded
    const dateInput = byId('booking-date');
    const startInput = byId('booking-start');
    const endInput = byId('booking-end');
    dateInput.min = formatDateInput(addDays(getToday(), 1));

    function hoursText(minutes) {
        return (minutes / 60) + ' h';
    }

    function padHour(hour) {
        return String(hour).padStart(2, '0') + ':00';
    }

    // Returns a text describing the conflict, or null when the window is free.
    function findConflict(dateText, startMin, endMin) {
        const date = parseDateInput(dateText);
        if (date === null) {
            return null;
        }
        const weekly = REHEARSAL_SCHEDULE.find(function (slot) {
            return slot.weekday === date.getDay() && startMin < toMinutes(slot.end) && toMinutes(slot.start) < endMin;
        });
        if (weekly !== undefined) {
            return 'the weekly slot of ' + weekly.band + ' (' + weekly.start + '–' + weekly.end + ')';
        }
        const earlier = sessionBookings.find(function (item) {
            return item.date === dateText && startMin < item.end && item.start < endMin;
        });
        if (earlier !== undefined) {
            return 'your earlier demonstration request for ' + earlier.band;
        }
        return null;
    }

    function isTooSoon(dateText, startText) {
        return new Date(dateText + 'T' + startText) - new Date() < MS_PER_DAY;
    }

    /* ----- Free-slot finder ----- */
    const finderList = document.createElement('div');
    finderList.id = 'free-slots-list';
    finderList.className = 'd-flex flex-wrap gap-2';
    const finderMessage = document.createElement('p');
    finderMessage.className = 'small text-muted mb-0 mt-2';
    finderMessage.setAttribute('aria-live', 'polite');
    const finderTitle = document.createElement('p');
    finderTitle.className = 'fw-semibold mb-2';
    finderTitle.textContent = 'Free 2-hour windows on the chosen date:';
    const finder = document.createElement('div');
    finder.id = 'free-slots';
    finder.className = 'mb-4';
    finder.append(finderTitle, finderList, finderMessage);

    function getFreeWindows(dateText) {
        const windows = [];
        for (let hour = 9; hour + 2 <= 22; hour += 2) {
            const start = padHour(hour);
            const end = padHour(hour + 2);
            if (!isTooSoon(dateText, start) && findConflict(dateText, hour * 60, (hour + 2) * 60) === null) {
                windows.push({ start: start, end: end });
            }
        }
        return windows;
    }

    function createWindowButton(slot) {
        const button = createButton(slot.start + ' – ' + slot.end, 'btn btn-outline-primary btn-sm');
        button.dataset.start = slot.start;
        button.dataset.end = slot.end;
        if (slot.start === startInput.value && slot.end === endInput.value) {
            button.classList.add('active');
        }
        return button;
    }

    function renderFreeWindows() {
        finderList.replaceChildren();
        if (parseDateInput(dateInput.value) === null) {
            finderMessage.textContent = 'Pick a date to see the free windows.';
            return;
        }
        const windows = getFreeWindows(dateInput.value);
        if (windows.length === 0) {
            finderMessage.textContent = 'No free 2-hour window on this date (slots must be booked 24 hours ahead). Try another day.';
            return;
        }
        finderMessage.textContent = windows.length + ' free window(s). Click one to fill in the start and end time.';
        windows.forEach(function (slot) {
            finderList.append(createWindowButton(slot));
        });
    }

    finderList.addEventListener('click', function (event) {
        const button = event.target.closest('button');
        if (button === null) {
            return;
        }
        startInput.value = button.dataset.start;
        endInput.value = button.dataset.end;
        clearFieldError(startInput);
        clearFieldError(endInput);
        renderFreeWindows();
        updateSummary();
    });

    /* ----- Live summary ----- */
    const summary = document.createElement('div');
    summary.id = 'booking-live-summary';
    summary.className = 'alert alert-secondary mb-4';
    summary.setAttribute('aria-live', 'polite');
    byId('booking-rules').closest('.form-check').before(finder, summary);

    function updateSummary() {
        const date = parseDateInput(dateInput.value);
        summary.replaceChildren();
        summary.classList.remove('error', 'success');
        if (date === null || startInput.value === '' || endInput.value === '') {
            summary.textContent = 'Choose a date and the start and end time to see a live summary of your request.';
            return;
        }
        const length = toMinutes(endInput.value) - toMinutes(startInput.value);
        const parts = [formatDateLong(date), startInput.value + '–' + endInput.value];
        if (length > 0) {
            parts.push(hoursText(length));
        }
        if (getValue('booking-members') !== '') {
            parts.push(getValue('booking-members') + ' musician(s)');
        }
        if (getValue('booking-genre') !== '') {
            parts.push(getSelectedText('booking-genre'));
        }
        const line = document.createElement('div');
        line.textContent = 'Your request: ' + parts.join(' · ');
        const status = document.createElement('strong');
        const conflict = length > 0 ? findConflict(dateInput.value, toMinutes(startInput.value), toMinutes(endInput.value)) : null;
        if (length <= 0) {
            status.textContent = '✖ The end time must be later than the start time.';
            summary.classList.add('error');
        } else if (conflict !== null) {
            status.textContent = '✖ Not available: the room is taken by ' + conflict + '.';
            summary.classList.add('error');
        } else {
            status.textContent = '✔ This window looks free.';
            summary.classList.add('success');
        }
        summary.append(line, status);
    }

    /* ----- Validation ----- */
    function validate() {
        const errors = [];
        addIf(errors, 'booking-name', nameProblem(getValue('booking-name')));
        addIf(errors, 'booking-email', emailProblem(getValue('booking-email'), true));
        addIf(errors, 'booking-band', textProblem(getValue('booking-band'), 2, 40, 'Band or ensemble name'));
        addIf(errors, 'booking-members', numberProblem(getValue('booking-members'), 1, 15, 'Number of musicians'));
        addIf(errors, 'booking-genre', choiceProblem(getValue('booking-genre'), 'Choose a genre focus.'));

        const dateText = getValue('booking-date');
        const startText = getValue('booking-start');
        const endText = getValue('booking-end');
        const dateError = dateProblem(dateText, getToday(), 'The date cannot be in the past.');
        const startError = timeProblem(startText, 'start');
        const endError = timeProblem(endText, 'end');
        addIf(errors, 'booking-date', dateError);
        addIf(errors, 'booking-start', startError);
        addIf(errors, 'booking-end', endError);

        if (startError === '' && endError === '') {
            const length = toMinutes(endText) - toMinutes(startText);
            if (length <= 0) {
                addIf(errors, 'booking-end', 'The end time must be later than the start time.');
            } else if (length < MIN_LENGTH || length > MAX_LENGTH) {
                addIf(errors, 'booking-end', 'A session lasts from 1 to 3 hours (yours: ' + hoursText(length) + ').');
            } else if (dateError === '') {
                if (isTooSoon(dateText, startText)) {
                    addIf(errors, 'booking-date', 'Slots must be reserved at least 24 hours in advance.');
                } else {
                    const conflict = findConflict(dateText, toMinutes(startText), toMinutes(endText));
                    if (conflict !== null) {
                        addIf(errors, 'booking-start', 'The room is taken by ' + conflict + '. Pick another window.');
                    }
                }
            }
        }
        if (!byId('booking-rules').checked) {
            addIf(errors, 'booking-rules', 'You must agree to keep the volume under 85 dB after 20:00.');
        }
        return errors;
    }

    function confirmBooking() {
        const start = toMinutes(getValue('booking-start'));
        const end = toMinutes(getValue('booking-end'));
        sessionBookings.push({ date: getValue('booking-date'), start: start, end: end, band: getValue('booking-band') });
        const date = parseDateInput(getValue('booking-date'));
        const result = {
            title: 'Demonstration request prepared',
            lines: [
                ['Contact', getValue('booking-name') + ' (' + getValue('booking-email') + ')'],
                ['Band', getValue('booking-band')],
                ['Musicians', getValue('booking-members')],
                ['Date', formatDateLong(date)],
                ['Time', getValue('booking-start') + '–' + getValue('booking-end') + ' (' + hoursText(end - start) + '), Room C1.1.142'],
                ['Genre', getSelectedText('booking-genre')],
                ['Demo reference', makeReference('BOOK')]
            ],
            note: 'The window is held only in this browser tab for the demonstration and disappears when you reload the page.'
        };
        renderFreeWindows();
        updateSummary();
        return result;
    }

    setupForm('studio-booking-form', validate, confirmBooking);
    form.addEventListener('input', updateSummary);
    form.addEventListener('change', function () {
        renderFreeWindows();
        updateSummary();
    });
    form.addEventListener('reset', function () {
        setTimeout(function () {
            renderFreeWindows();
            updateSummary();
        }, 0);
    });
    renderFreeWindows();
    updateSummary();
}

initBookingPage();
