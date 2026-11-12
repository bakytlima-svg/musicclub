'use strict';

/* bands.js - band finder, upcoming performances list and the band interest form. */

function initBandsPage() {
    const form = byId('band-interest-form');
    if (form === null) {
        return;
    }

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

    /* ----- Interest form ----- */
    byId('preferred-date').min = formatDateInput(addDays(getToday(), 1));

    function validate() {
        const errors = [];
        addIf(errors, 'student-name', nameProblem(getValue('student-name')));
        addIf(errors, 'student-email', emailProblem(getValue('student-email'), false));
        if (getValue('student-phone') !== '') {
            addIf(errors, 'student-phone', phoneProblem(getValue('student-phone')));
        }
        const years = getValue('experience');
        addIf(errors, 'experience', numberProblem(years, 0, 20, 'Years of experience'));
        if (getValue('preferred-date') !== '') {
            addIf(errors, 'preferred-date', dateProblem(getValue('preferred-date'), addDays(getToday(), 1),
                'Choose a future date: auditions can be requested from tomorrow.'));
        }
        addIf(errors, 'genre', choiceProblem(getValue('genre'), 'Choose a preferred genre.'));
        addIf(errors, 'singer', choiceProblem(getChecked('role'), 'Choose your preferred role.'));

        // With some experience the visitor has to describe it (the field label asks for it).
        const message = getValue('message');
        if (Number(years) > 0 && years !== '') {
            addIf(errors, 'message', textProblem(message, 20, 500, 'Description of your musical experience'));
        } else if (message.length > 500) {
            addIf(errors, 'message', 'Write at most 500 characters (now ' + message.length + ').');
        }
        if (!byId('club-rules').checked) {
            addIf(errors, 'club-rules', 'Please confirm that this form only collects interest.');
        }
        return errors;
    }

    function buildSummary() {
        const genre = getValue('genre');
        const band = BANDS.find(function (item) {
            return item.genreKey === genre;
        });
        const years = Number(getValue('experience'));
        const lines = [
            ['Name', getValue('student-name')],
            ['Email', getValue('student-email')],
            ['Phone', getValue('student-phone') === '' ? 'not given' : formatPhone(getValue('student-phone'))],
            ['Experience', years + (years === 1 ? ' year' : ' years')],
            ['Preferred audition date', getValue('preferred-date') === '' ? 'not given' : formatDateLong(parseDateInput(getValue('preferred-date')))],
            ['Genre', getSelectedText('genre')],
            ['Role', getCheckedLabel('role')],
            ['Closest existing group', band === undefined ? 'none yet: your interest can help to start a new group' : band.name + ' (' + band.genre + ')']
        ];
        if (getValue('message') !== '') {
            lines.push(['About your experience', getValue('message')]);
        }
        lines.push(['Demo reference', makeReference('BAND')]);
        return {
            title: 'Demonstration interest form prepared',
            lines: lines,
            note: 'This form only collects interest; it does not put you into a band.'
        };
    }

    setupForm('band-interest-form', validate, buildSummary);
}

initBandsPage();
