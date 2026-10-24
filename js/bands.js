'use strict';

/* bands.js - band finder, upcoming performances list and the band interest form. */

function initBandsPage() {
    const form = byId('band-interest-form');
    const row = document.querySelector('#bands .row');
    if (form === null || row === null) {
        return;
    }

    /* ----- Band finder: search by name, genre or member + genre filter ----- */
    const searchInput = createSearchInput('bands-search', 'Band, genre or member name');
    const genreOptions = [['all', 'All genres']];
    BANDS.forEach(function (band) {
        genreOptions.push([band.genreKey, band.genre]);
    });
    const genreSelect = createSelect('bands-genre', genreOptions);
    const resetButton = createButton('Reset', 'btn btn-outline-secondary w-100', 'bands-reset');
    const resetColumn = document.createElement('div');
    resetColumn.className = 'col-12 col-md-3';
    resetColumn.append(resetButton);
    const controls = document.createElement('div');
    controls.className = 'row g-2 align-items-end mb-2';
    controls.append(
        createField(searchInput, 'Find a band:', 'col-12 col-md-6'),
        createField(genreSelect, 'Genre:', 'col-12 col-md-3'),
        resetColumn);
    const count = document.createElement('p');
    count.id = 'bands-count';
    count.className = 'small text-muted mb-3';
    count.setAttribute('aria-live', 'polite');
    const emptyBox = document.createElement('div');
    emptyBox.id = 'bands-empty';
    emptyBox.className = 'hidden alert alert-info mt-3';
    emptyBox.textContent = 'No student group matches your search. Use “Reset” to see all groups, or send us the interest form below to start a new one.';
    row.before(controls, count);
    row.after(emptyBox);

    function matchesBand(band, query, genre) {
        const text = (band.name + ' ' + band.genre + ' ' + band.members.join(' ')).toLowerCase();
        return text.includes(query) && (genre === 'all' || band.genreKey === genre);
    }

    function renderBands() {
        const query = searchInput.value.trim().toLowerCase();
        let shown = 0;
        BANDS.forEach(function (band) {
            const column = byId(band.id).closest('.col-12');
            const visible = matchesBand(band, query, genreSelect.value);
            column.classList.toggle('hidden', !visible);
            if (visible) {
                shown++;
            }
        });
        emptyBox.classList.toggle('hidden', shown > 0);
        count.textContent = 'Showing ' + shown + ' of ' + BANDS.length + ' student groups.';
    }

    searchInput.addEventListener('input', renderBands);
    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            searchInput.value = '';
            renderBands();
        }
    });
    genreSelect.addEventListener('change', renderBands);
    resetButton.addEventListener('click', function () {
        searchInput.value = '';
        genreSelect.value = 'all';
        renderBands();
    });

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
    renderBands();
}

initBandsPage();
