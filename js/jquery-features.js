'use strict';

$(function () {
    setupSiteSearch();
    setupBandFinder();
    setupBandJoinButtons();
    setupGlossary();

    function setupSiteSearch() {
        const $nav = $('#main-navigation');
        if ($nav.length === 0) {
            return;
        }

        const $label = $('<label>', { 'for': 'site-search-input', 'class': 'visually-hidden', text: 'Search the site' });
        const $input = $('<input>', {
            type: 'search',
            id: 'site-search-input',
            'class': 'form-control',
            placeholder: 'Search the site: audition, equipment, workshop...',
            autocomplete: 'off'
        });
        const $searchButton = $('<button>', { type: 'submit', 'class': 'btn btn-primary', text: 'Search' });
        const $clearButton = $('<button>', { type: 'button', 'class': 'btn btn-outline-secondary', text: 'Clear' });
        const $group = $('<div>', { 'class': 'input-group' }).append($input, $searchButton, $clearButton);
        const $results = $('<div>', { id: 'site-search-results', 'class': 'hidden mt-2', 'aria-live': 'polite' });
        const $form = $('<form>', { id: 'site-search-form', 'class': 'mt-3', role: 'search' });
        $form.append($label, $group, $results).insertAfter($nav);

        const currentFile = location.pathname.split('/').pop() || 'index.html';

        function pageMatches(page, words) {
            const text = (page.title + ' ' + page.description + ' ' + page.keywords).toLowerCase();
            return words.every(function (word) {
                return text.includes(word);
            });
        }

        function showResults(query) {
            $results.stop(true, true).empty();
            if (query === '') {
                $results.addClass('hidden');
                return;
            }

            const words = query.toLowerCase().split(/\s+/);
            const matches = $.grep(SITE_PAGES, function (page) {
                return pageMatches(page, words);
            });

            const $message = $('<p>', { 'class': 'small mb-2' }).appendTo($results);
            if (matches.length === 0) {
                $message.text('No pages found for “' + query + '”. Try “audition”, “equipment” or “workshop”.');
            } else {
                $message.text(matches.length + (matches.length === 1 ? ' page found' : ' pages found') + '. Use the arrow keys and Enter to open one.');
                const $list = $('<div>', { 'class': 'list-group' }).appendTo($results);
                $.each(matches, function (index, page) {
                    const $link = $('<a>', { href: page.url, 'class': 'list-group-item list-group-item-action' });
                    $('<strong>').text(page.title).appendTo($link);
                    $('<span>', { 'class': 'd-block small', text: page.description }).appendTo($link);
                    if (page.url === currentFile) {
                        $link.addClass('active').attr('aria-current', 'page');
                    }
                    $list.append($link);
                });
            }

            if ($results.hasClass('hidden')) {
                $results.removeClass('hidden').hide().fadeIn(150);
            }
        }

        function clearSearch() {
            $input.val('');
            showResults('');
            $input.trigger('focus');
        }

        function moveSelection(step) {
            const $links = $results.find('a');
            if ($links.length === 0) {
                return;
            }
            let index = $links.index($links.filter('.list-group-item-primary')) + step;
            if (index < 0) {
                index = $links.length - 1;
            }
            if (index >= $links.length) {
                index = 0;
            }
            $links.removeClass('list-group-item-primary').eq(index).addClass('list-group-item-primary');
        }

        $input.on('input', function () {
            showResults($(this).val().trim());
        });

        $input.on('keydown', function (event) {
            if (event.key === 'Escape') {
                clearSearch();
            }
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                moveSelection(event.key === 'ArrowDown' ? 1 : -1);
            }
        });

        $clearButton.on('click', clearSearch);

        $form.on('submit', function (event) {
            event.preventDefault();
            const $links = $results.find('a');
            let $target = $links.filter('.list-group-item-primary').first();
            if ($target.length === 0) {
                $target = $links.first();
            }
            if ($target.length === 0) {
                return;
            }
            if ($target.hasClass('active')) {
                clearSearch();
            } else {
                window.location.href = $target.attr('href');
            }
        });

        $results.on('click', 'a.active', function (event) {
            event.preventDefault();
            clearSearch();
        });
    }

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
            .text('No student group matches your search. Press “Reset” to see all groups, or send us the interest form below to start a new one.');

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

    function setupBandJoinButtons() {
        const $cards = $('#bands article');
        if ($cards.length === 0) {
            return;
        }

        $cards.each(function () {
            const $button = $('<button>', {
                type: 'button',
                'class': 'btn btn-outline-primary btn-sm join-band mt-3',
                text: 'I want to join this group'
            });
            $(this).find('.card-body').append($button);
        });

        function showJoinNote(band) {
            $('#band-join-note').remove();
            $('<div>', {
                id: 'band-join-note',
                'class': 'alert alert-info',
                text: 'You chose ' + band.name + ': the genre in the form below is already set to ' + band.genre + '. Fill in the rest and send the form.'
            }).hide().insertBefore('#band-interest-form').fadeIn(300);
        }

        $('#bands').on('click', 'button.join-band', function () {
            const bandId = $(this).closest('article').attr('id');
            const band = $.grep(BANDS, function (item) {
                return item.id === bandId;
            })[0];
            if (band === undefined) {
                return;
            }
            $('#genre').val(band.genreKey);
            showJoinNote(band);
            $('html, body').animate({ scrollTop: $('#registration').offset().top - 20 }, 400, function () {
                $('#student-name').trigger('focus');
            });
        });

        $('#band-interest-form').on('reset', function () {
            $('#band-join-note').remove();
        });
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
