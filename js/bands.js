'use strict';

/* bands.js - band finder, upcoming performances list and the band interest form. */

function initBandsPage() {
    const $row = $('#bands .row').first();
    if ($('#band-interest-form').length === 0 || $row.length === 0) {
        return;
    }

    // jQuery version: $(...) with .toggleClass, .closest and .on replaces querySelector, classList.toggle and addEventListener.
    // It is a little shorter and the filter reads better, but the page-building code is not much clearer than the plain helpers.
    const $search = jqSearch('bands-search', 'Band, genre or member name');
    const genreOptions = [['all', 'All genres']];
    $.each(BANDS, function (index, band) {
        genreOptions.push([band.genreKey, band.genre]);
    });
    const $genre = jqSelect('bands-genre', genreOptions);
    const $reset = jqButton('Reset', 'btn btn-outline-secondary w-100', 'bands-reset');
    const $count = $('<p>', { id: 'bands-count', 'class': 'small text-muted mb-3', 'aria-live': 'polite' });
    const $empty = $('<div>', { id: 'bands-empty', 'class': 'hidden alert alert-info mt-3' })
        .html('No student group matches your search. Use <strong>Reset</strong> to see all groups, or send us the interest form below to start a new one.');
    const $controls = $('<div>', { 'class': 'row g-2 align-items-end mb-2' }).append(
        jqField($search, 'Find a band:', 'col-12 col-md-6'),
        jqField($genre, 'Genre:', 'col-12 col-md-3'),
        $('<div>', { 'class': 'col-12 col-md-3' }).append($reset));
    $row.before($controls, $count).after($empty);

    function matchesBand(band, query, genre) {
        const text = (band.name + ' ' + band.genre + ' ' + band.members.join(' ')).toLowerCase();
        return text.includes(query) && (genre === 'all' || band.genreKey === genre);
    }

    function toggleEmpty(isEmpty) {
        $empty.stop(true, true);
        if (isEmpty && $empty.hasClass('hidden')) {
            $empty.removeClass('hidden').hide().slideDown(200);
        } else if (!isEmpty && !$empty.hasClass('hidden')) {
            $empty.slideUp(200, function () {
                $(this).addClass('hidden').removeAttr('style');
            });
        }
    }

    function renderBands() {
        const query = $search.val().trim().toLowerCase();
        let shown = 0;
        $.each(BANDS, function (index, band) {
            const visible = matchesBand(band, query, $genre.val());
            $('#' + band.id).closest('.col-12').toggleClass('hidden', !visible);
            if (visible) {
                shown++;
            }
        });
        toggleEmpty(shown === 0);
        $count.text('Showing ' + shown + ' of ' + BANDS.length + ' student groups.');
    }

    $search.on('input', renderBands).on('keydown', function (event) {
        if (event.key === 'Escape') {
            $(this).val('');
            renderBands();
        }
    });
    $genre.on('change', renderBands);
    $reset.on('click', function () {
        $search.val('');
        $genre.val('all');
        renderBands();
    });

    const $performances = $('#performances ol').empty();
    $.each(getUpcomingEvents().slice(0, 3), function (index, event) {
        const text = event.title + ' — ' + MONTH_NAMES[event.month - 1] + ' ' + event.day + ', ' + event.place +
            ' (' + describeDays(daysUntil(event.date)) + ') · ';
        // $('<li>') creates the item -> .text() fills it with the concert -> .append() adds the link -> .appendTo() puts it into the list
        $('<li>', { 'class': 'list-group-item' }).text(text).append($('<a>', { href: 'events.html#events-schedule', text: 'see the full concert calendar' })).appendTo($performances);
    });

    /* ----- Interest form ----- */
    $('#preferred-date').attr('min', formatDateInput(addDays(getToday(), 1)));

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
        if (!$('#club-rules').prop('checked')) {
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

$(function () {
    initBandsPage();
});
