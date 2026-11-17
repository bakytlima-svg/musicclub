'use strict';

/* audition-form.js - club application and audition request (the only membership form of the site). */

function initAuditionForm() {
    const form = byId('audition-application-form');
    if (form === null) {
        return;
    }

    const ROLE_LABELS = {
        vocalist: 'Vocalist',
        instrumentalist: 'Instrumentalist'
    };

    const instrumentSelect = byId('instrument-type');
    const instrumentGroup = byId('instrument-group');
    const hint = byId('audition-hint');
    byId('preferred-date').min = formatDateInput(addDays(getToday(), 1));

    // Tryouts run from 15:00 to 20:00: one time slot every 30 minutes.
    const timeSelect = byId('preferred-time');
    for (let hour = 15; hour < 20; hour++) {
        [':00', ':30'].forEach(function (minutes) {
            const option = document.createElement('option');
            option.value = hour + minutes;
            option.textContent = hour + minutes;
            timeSelect.append(option);
        });
    }

    function findInstrument(value) {
        return AUDITION_INSTRUMENTS.find(function (item) {
            return item.value === value;
        });
    }

    function showHint(text) {
        hint.textContent = text;
        hint.classList.toggle('hidden', text === '');
    }

    // A vocalist gets no instrument field; an instrumentalist gets the instrument list and a tip for the chosen one.
    function showRoleDetails() {
        const role = getChecked('primary_role');
        instrumentGroup.classList.toggle('hidden', role !== 'instrumentalist');
        if (role !== 'instrumentalist') {
            instrumentSelect.value = '';
            clearFieldError(instrumentSelect);
        }
        const item = findInstrument(instrumentSelect.value);
        if (role === 'vocalist') {
            showHint(VOCALIST_TIP);
        } else if (role === 'instrumentalist' && item !== undefined) {
            showHint('Section: ' + item.section + '. ' + item.tip);
        } else {
            showHint('');
        }
    }

    function validate() {
        const errors = [];
        addIf(errors, 'candidate-name', nameProblem(getValue('candidate-name')));
        addIf(errors, 'candidate-email', emailProblem(getValue('candidate-email'), true));
        addIf(errors, 'experience-level', choiceProblem(getValue('experience-level'), 'Choose your experience level.'));
        addIf(errors, 'preferred-date', dateProblem(getValue('preferred-date'), addDays(getToday(), 1),
            'Choose a future date: auditions can be requested from tomorrow.'));
        addIf(errors, 'preferred-time', choiceProblem(getValue('preferred-time'), 'Choose a time slot.'));

        const role = getChecked('primary_role');
        addIf(errors, 'role-vocalist', choiceProblem(role, 'Choose your performance category.'));
        if (role === 'instrumentalist') {
            addIf(errors, 'instrument-type', choiceProblem(getValue('instrument-type'), 'Choose your main instrument.'));
        }

        addIf(errors, 'repertoire-notes', textProblem(getValue('repertoire-notes'), 20, 500, 'Musical experience and prepared pieces'));
        if (!byId('rules-agree').checked) {
            addIf(errors, 'rules-agree', 'Please confirm that you understand this is an audition request.');
        }
        return errors;
    }

    function buildSummary() {
        const role = getChecked('primary_role');
        const lines = [
            ['Name', getValue('candidate-name')],
            ['Email', getValue('candidate-email')],
            ['Experience level', getSelectedText('experience-level')],
            ['Requested audition', formatDateLong(parseDateInput(getValue('preferred-date'))) + ', ' + getValue('preferred-time') + ', Room C1.1.142'],
            ['Category', ROLE_LABELS[role]]
        ];
        if (role === 'instrumentalist') {
            lines.push(['Instrument', findInstrument(instrumentSelect.value).label]);
        }
        lines.push(['Experience and prepared pieces', getValue('repertoire-notes')]);
        lines.push(['Demo reference', makeReference('AUD')]);
        return {
            title: 'Audition request prepared (not a membership)',
            lines: lines,
            note: 'This is a request for an audition only. You do not become a club member by sending it: ' +
                'you join after you have performed at the audition and the committee has accepted you. ' +
                'In the real workflow the time slot is confirmed by email.'
        };
    }

    setupForm('audition-application-form', validate, buildSummary);
    form.querySelectorAll('input[name="primary_role"]').forEach(function (radio) {
        radio.addEventListener('change', showRoleDetails);
    });
    instrumentSelect.addEventListener('change', showRoleDetails);
    form.addEventListener('reset', function () {
        setTimeout(showRoleDetails, 0);
    });
}

initAuditionForm();
