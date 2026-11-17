'use strict';

$(function () {
    setupBandFinder();
    setupGlossary();

    function setupBandFinder() {
        const $row = $('#bands .row').first();
        if ($row.length === 0) {
            return;
        }

        function makeField(labelText, $control, columnClass) {
            const $label = $('<label>', { 'for': $control.attr('id'), 'class': 'form-label fw-semibold mb-1', text: labelText });
            return $('<div>', { 'class': columnClass }).append($label, $control);
        }

        const $search = $('<input>', {
            type: 'search',
            id: 'bands-search',
            'class': 'form-control',
            placeholder: 'Band, genre or member name',
            autocomplete: 'off'
        });
        const $genre = $('<select>', { id: 'bands-genre', 'class': 'form-select' });
        $('<option>', { value: 'all', text: 'All genres' }).appendTo($genre);
        $.each(BANDS, function (index, band) {
            $('<option>', { value: band.genreKey, text: band.genre }).appendTo($genre);
        });
        const $resetButton = $('<button>', { type: 'button', id: 'bands-reset', 'class': 'btn btn-outline-secondary w-100', text: 'Reset' });

        const $controls = $('<div>', { 'class': 'row g-2 align-items-end mb-2' }).append(
            makeField('Find a band:', $search, 'col-12 col-md-6'),
            makeField('Genre:', $genre, 'col-12 col-md-3'),
            $('<div>', { 'class': 'col-12 col-md-3' }).append($resetButton));
        const $count = $('<p>', { id: 'bands-count', 'class': 'small text-muted mb-3', 'aria-live': 'polite' });
        const $emptyMessage = $('<div>', { id: 'bands-empty', 'class': 'hidden alert alert-info mt-3' })
            .text('No student group matches your search. Press “Reset” to see all groups, or write to the club by email to start a new one.');

        $row.before($controls, $count);
        $row.after($emptyMessage);

        function bandMatches(band, query, genre) {
            const text = (band.name + ' ' + band.genre + ' ' + band.members.join(' ')).toLowerCase();
            return text.includes(query) && (genre === 'all' || band.genreKey === genre);
        }

        function toggleEmptyMessage(nothingFound) {
            $emptyMessage.stop(true, true);
            if (nothingFound && $emptyMessage.hasClass('hidden')) {
                $emptyMessage.removeClass('hidden').hide().slideDown(200);
            } else if (!nothingFound && !$emptyMessage.hasClass('hidden')) {
                $emptyMessage.slideUp(200, function () {
                    $(this).addClass('hidden').removeAttr('style');
                });
            }
        }

        function showBands() {
            const query = $search.val().trim().toLowerCase();
            const genre = $genre.val();
            $.each(BANDS, function (index, band) {
                const matches = bandMatches(band, query, genre);
                $('#' + band.id).parent().toggleClass('hidden', !matches);
            });
            const shown = $row.children(':not(.hidden)').length;
            $count.text('Showing ' + shown + ' of ' + BANDS.length + ' student groups.');
            toggleEmptyMessage(shown === 0);
        }

        $search.on('input', showBands);
        $search.on('keydown', function (event) {
            if (event.key === 'Escape') {
                $(this).val('');
                showBands();
            }
        });
        $genre.on('change', showBands);
        $resetButton.on('click', function () {
            $search.val('');
            $genre.val('all');
            showBands();
        });

        showBands();
    }

    function setupGlossary() {
        const $questions = $('.music-terms dt, #terminology .card-title');
        if ($questions.length === 0) {
            return;
        }

        function findAnswer($question) {
            if ($question.is('dt')) {
                return $question.next('dd');
            }
            return $question.siblings('.card-text');
        }

        $questions.each(function () {
            $(this).attr({ role: 'button', tabindex: '0', 'aria-expanded': 'false' }).addClass('text-primary');
            findAnswer($(this)).hide();
        });

        function toggleAnswer($question) {
            const isOpen = $question.attr('aria-expanded') === 'true';
            $question.attr('aria-expanded', isOpen ? 'false' : 'true');
            findAnswer($question).stop(true, true).slideToggle(250);
        }

        $('main').on('click', '[role="button"][aria-expanded]', function () {
            toggleAnswer($(this));
        });

        $('main').on('keydown', '[role="button"][aria-expanded]', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleAnswer($(this));
            }
        });
    }
});
