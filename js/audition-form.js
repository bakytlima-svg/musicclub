'use strict';

/* audition-form.js - audition application form. The same form exists on index.html and auditions.html. */

function initAuditionForm() {
    const form = byId('audition-application-form');
    if (form === null) {
        return;
    }

    const ROLE_LABELS = {
        vocalist: 'Vocalist',
        instrumentalist: 'Instrumentalist',
        technician: 'Sound engineer / stage hand'
    };

    // Tryouts run from 15:00 to 20:00: one example slot every 30 minutes.
    const slots = [];
    for (let hour = 15; hour < 20; hour++) {
        slots.push(hour + ':00', hour + ':30');
    }

    const instrumentSelect = byId('instrument-type');
    byId('preferred-date').min = formatDateInput(addDays(getToday(), 1));

    function findInstrument(value) {
        return AUDITION_INSTRUMENTS.find(function (item) {
            return item.value === value;
        });
    }

    // Hint under the instrument select: section and what to prepare.
    const hint = document.createElement('div');
    hint.id = 'instrument-hint';
    hint.className = 'form-text hidden';
    hint.setAttribute('aria-live', 'polite');
    instrumentSelect.after(hint);

    function showInstrumentHint() {
        const item = findInstrument(instrumentSelect.value);
        if (item === undefined) {
            hint.classList.add('hidden');
            hint.textContent = '';
            return;
        }
        hint.textContent = 'Section: ' + item.section + '. ' + item.tip;
        hint.classList.remove('hidden');
    }

    function validate() {
        const errors = [];
        addIf(errors, 'candidate-name', nameProblem(getValue('candidate-name')));
        addIf(errors, 'candidate-email', emailProblem(getValue('candidate-email'), true));
        addIf(errors, 'candidate-phone', phoneProblem(getValue('candidate-phone')));
        addIf(errors, 'years-experience', numberProblem(getValue('years-experience'), 0, 20, 'Years of experience'));
        addIf(errors, 'preferred-date', dateProblem(getValue('preferred-date'), addDays(getToday(), 1),
            'Choose a future date: auditions can be requested from tomorrow.'));

        const role = getChecked('primary_role');
        addIf(errors, 'role-vocalist', choiceProblem(role, 'Choose your primary performance direction.'));

        // The instrument must fit the chosen role (rule that combines two fields).
        const instrument = findInstrument(instrumentSelect.value);
        if (instrument === undefined) {
            addIf(errors, 'instrument-type', 'Choose your primary instrument.');
        } else if (role !== '' && instrument.role !== role) {
            addIf(errors, 'instrument-type', '"' + instrument.label + '" does not match the role "' +
                ROLE_LABELS[role] + '". Change the role or the instrument.');
        }

        addIf(errors, 'repertoire-notes', textProblem(getValue('repertoire-notes'), 20, 500, 'Genres and prepared pieces'));
        if (!byId('rules-agree').checked) {
            addIf(errors, 'rules-agree', 'You must agree to the room rules to apply.');
        }
        return errors;
    }

    function buildSummary() {
        const years = Number(getValue('years-experience'));
        const instrument = findInstrument(instrumentSelect.value);
        const slot = slots[Math.floor(Math.random() * slots.length)];
        return {
            title: 'Demonstration application prepared',
            lines: [
                ['Name', getValue('candidate-name')],
                ['Email', getValue('candidate-email')],
                ['Phone', formatPhone(getValue('candidate-phone'))],
                ['Experience', years + (years === 1 ? ' year' : ' years')],
                ['Preferred date', formatDateLong(parseDateInput(getValue('preferred-date')))],
                ['Role', ROLE_LABELS[getChecked('primary_role')]],
                ['Instrument', instrument.label + ' (' + instrument.section + ')'],
                ['Example time slot', slot + ', Room C1.1.142'],
                ['Demo reference', makeReference('AUD')]
            ],
            note: 'The time slot is only an example of how a confirmation will look.'
        };
    }

    setupForm('audition-application-form', validate, buildSummary);
    instrumentSelect.addEventListener('change', showInstrumentHint);
    form.addEventListener('reset', function () {
        setTimeout(showInstrumentHint, 0);
    });
}

initAuditionForm();
