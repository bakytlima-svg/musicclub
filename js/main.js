'use strict';

/* main.js - shared helpers and site-wide features. Loaded on every page after data.js. */

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEMO_NOTICE = 'This is a front-end demonstration: no data is sent to a server and no real booking, payment or order is created.';

/* ---------- Small DOM helpers ---------- */

function byId(id) {
    return document.getElementById(id);
}

function getValue(id) {
    return $('#' + id).val().trim();
}

// Value of the selected radio button of a group ('' when nothing is chosen).
function getChecked(name) {
    return $('input[name="' + name + '"]:checked').val() || '';
}

function getCheckedLabel(name) {
    const $radio = $('input[name="' + name + '"]:checked');
    return $radio.length === 0 ? '' : $('label[for="' + $radio.attr('id') + '"]').text().trim();
}

function getSelectedText(id) {
    return $('#' + id + ' option:selected').text();
}

function jqButton(text, className, id) {
    const $button = $('<button>', { type: 'button', 'class': className, text: text });
    return id ? $button.attr('id', id) : $button;
}

function jqSearch(id, placeholder) {
    return $('<input>', { type: 'search', id: id, 'class': 'form-control', placeholder: placeholder, autocomplete: 'off' });
}

// options: array of [value, label] pairs
function jqSelect(id, options) {
    const $select = $('<select>', { id: id, 'class': 'form-select' });
    $.each(options, function (index, pair) {
        $('<option>', { value: pair[0], text: pair[1] }).appendTo($select);
    });
    return $select;
}

function jqField($control, labelText, columnClass) {
    const $label = $('<label>', { 'for': $control.attr('id'), 'class': 'form-label fw-semibold mb-1', text: labelText });
    return $('<div>').addClass(columnClass).append($label, $control);
}

function makeCell(text) {
    const cell = document.createElement('td');
    cell.textContent = text;
    return cell;
}

function createButton(text, className, id) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = text;
    if (id) {
        button.id = id;
    }
    return button;
}

function createSearchInput(id, placeholder) {
    const input = document.createElement('input');
    input.type = 'search';
    input.id = id;
    input.className = 'form-control';
    input.placeholder = placeholder;
    input.autocomplete = 'off';
    return input;
}

// options: array of [value, label] pairs
function createSelect(id, options) {
    const select = document.createElement('select');
    select.id = id;
    select.className = 'form-select';
    options.forEach(function (pair) {
        const option = document.createElement('option');
        option.value = pair[0];
        option.textContent = pair[1];
        select.append(option);
    });
    return select;
}

// Wraps a control and its label in one column of a Bootstrap row.
function createField(control, labelText, columnClass) {
    const column = document.createElement('div');
    column.className = columnClass;
    const label = document.createElement('label');
    label.htmlFor = control.id;
    label.className = 'form-label fw-semibold mb-1';
    label.textContent = labelText;
    column.append(label, control);
    return column;
}

/* ---------- Dates and times ---------- */

function getToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function addDays(date, amount) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + amount);
    return copy;
}

// '2026-10-31' -> Date at local midnight (null when the text is not a date)
function parseDateInput(text) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        return null;
    }
    const date = new Date(text + 'T00:00:00');
    return Number.isNaN(date.getTime()) ? null : date;
}

// Date -> '2026-10-31' (the format of <input type="date">)
function formatDateInput(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return date.getFullYear() + '-' + month + '-' + day;
}

function formatDateLong(date) {
    return WEEKDAY_NAMES[date.getDay()] + ', ' + date.getDate() + ' ' + MONTH_NAMES[date.getMonth()] + ' ' + date.getFullYear();
}

function daysUntil(date) {
    return Math.round((date - getToday()) / MS_PER_DAY);
}

function describeDays(days) {
    if (days === 0) {
        return 'today';
    }
    if (days === 1) {
        return 'tomorrow';
    }
    return 'in ' + days + ' days';
}

// '17:30' -> 1050 minutes after midnight
function toMinutes(time) {
    const parts = time.split(':');
    return Number(parts[0]) * 60 + Number(parts[1]);
}

// Next date (today or later) of a yearly event such as "October 31".
function getNextOccurrence(month, day) {
    const today = getToday();
    let date = new Date(today.getFullYear(), month - 1, day);
    if (date < today) {
        date = new Date(today.getFullYear() + 1, month - 1, day);
    }
    return date;
}

// Next date and time of a weekly event (weekday 0-6, time '16:00').
function getNextWeekdayDate(weekday, time) {
    const date = getToday();
    date.setDate(date.getDate() + ((weekday - date.getDay() + 7) % 7));
    date.setMinutes(toMinutes(time));
    if (date < new Date()) {
        date.setDate(date.getDate() + 7);
    }
    return date;
}

// All concerts with the date of their next occurrence, soonest first.
function getUpcomingEvents() {
    const list = EVENTS.map(function (event) {
        return { ...event, date: getNextOccurrence(event.month, event.day) };
    });
    list.sort(function (a, b) {
        return a.date - b.date;
    });
    return list;
}

/* ---------- Validation rules ----------
   Every "...Problem" function returns an error message, or '' when the value is fine. */

function isFullName(text) {
    return text.length >= 5 && /^[\p{L}'’.-]+(\s+[\p{L}'’.-]+)+$/u.test(text);
}

function isEmail(text) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
}

function normalizePhone(text) {
    let digits = text.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('8')) {
        digits = '7' + digits.slice(1);
    }
    return digits;
}

function isKzPhone(text) {
    return /^[+\d\s()-]+$/.test(text) && /^77\d{9}$/.test(normalizePhone(text));
}

function formatPhone(text) {
    const d = normalizePhone(text);
    return '+7 ' + d.slice(1, 4) + ' ' + d.slice(4, 7) + ' ' + d.slice(7, 9) + ' ' + d.slice(9, 11);
}

function nameProblem(value) {
    if (value === '') {
        return 'Full name is required.';
    }
    if (!isFullName(value)) {
        return 'Enter your name and surname (letters only, at least two words).';
    }
    return '';
}

function emailProblem(value, aituOnly) {
    if (value === '') {
        return 'Email is required.';
    }
    if (!isEmail(value)) {
        return 'Enter a valid email address, for example student@astanait.edu.kz.';
    }
    if (aituOnly && !value.toLowerCase().endsWith('@astanait.edu.kz')) {
        return 'Use your AITU student email (it ends with @astanait.edu.kz).';
    }
    return '';
}

function phoneProblem(value) {
    if (value === '') {
        return 'Phone number is required.';
    }
    if (!isKzPhone(value)) {
        return 'Enter a Kazakhstan number such as +7 777 123 45 67.';
    }
    return '';
}

function numberProblem(value, min, max, label) {
    if (value === '') {
        return label + ' is required.';
    }
    const number = Number(value);
    if (!Number.isInteger(number) || number < min || number > max) {
        return label + ' must be a whole number from ' + min + ' to ' + max + '.';
    }
    return '';
}

function textProblem(value, min, max, label) {
    if (value === '') {
        return label + ' is required.';
    }
    if (value.length < min) {
        return 'Write at least ' + min + ' characters (now ' + value.length + ').';
    }
    if (value.length > max) {
        return 'Write at most ' + max + ' characters (now ' + value.length + ').';
    }
    return '';
}

function choiceProblem(value, message) {
    return value === '' ? message : '';
}

function dateProblem(value, earliest, tooEarlyMessage) {
    if (value === '') {
        return 'Choose a date.';
    }
    const date = parseDateInput(value);
    if (date === null) {
        return 'Enter a valid date.';
    }
    return date < earliest ? tooEarlyMessage : '';
}

function timeProblem(value, label) {
    if (value === '') {
        return 'Choose the ' + label + ' time.';
    }
    const minutes = toMinutes(value);
    if (minutes < 9 * 60 || minutes > 22 * 60) {
        return 'The room is open from 09:00 to 22:00.';
    }
    return '';
}

// Adds an error for a field to the list when the message is not empty.
function addIf(errors, fieldId, message) {
    if (message !== '') {
        errors.push({ field: $('#' + fieldId), message: message });
    }
}

// Temporary reference for the demonstration confirmation (not a real booking number).
function makeReference(prefix) {
    return 'DEMO-' + prefix + '-' + Math.floor(1000 + Math.random() * 9000);
}

/* ---------- Form feedback ---------- */

// jQuery version: .hasClass/.addClass/.attr/.on replace classList, setAttribute and addEventListener loops.
// It is shorter, and the chains read well, but the code still needs a comment to be understood at first sight.

function getGroup($field) {
    return $field.is(':radio') ? $field.closest('form').find('input[name="' + $field.attr('name') + '"]') : $field;
}

function showFieldError(field, message) {
    const $field = $(field);
    if ($field.hasClass('error')) {
        return;
    }
    const $group = getGroup($field);
    const $last = $group.last();
    const $note = $('<div>', { 'class': 'field-error', id: $field.attr('id') + '-message', text: '⚠ ' + message });
    $group.removeClass('success').addClass('error').attr({ 'aria-invalid': 'true', 'aria-describedby': $note.attr('id') });
    $note.hide().insertAfter($last.is(':radio, :checkbox') ? $last.closest('.form-check') : $last).slideDown(150);
}

function clearFieldError(field) {
    const $field = $(field);
    if (!$field.hasClass('error')) {
        return;
    }
    $('#' + $field.attr('aria-describedby')).remove();
    getGroup($field).removeClass('error').removeAttr('aria-invalid aria-describedby');
}

function hideBox($box) {
    $box.stop(true, true).addClass('hidden').empty().removeAttr('style');
}

function showBox($box, text) {
    $box.text(text).removeClass('hidden').hide().fadeIn(200);
}

// summary = { title, lines: [[label, value], ...], note }
function showSummary($box, summary) {
    const $list = $('<ul>', { 'class': 'mb-3' });
    $.each(summary.lines, function (index, pair) {
        $('<li>').text(pair[1]).prepend($('<strong>').text(pair[0] + ': ')).appendTo($list);
    });
    $box.empty().append(
        $('<h3>', { 'class': 'h5 fw-bold', text: '✔ ' + summary.title }),
        $list,
        $('<p>', { 'class': 'mb-1', text: summary.note }),
        $('<p>', { 'class': 'mb-0 fw-semibold', text: DEMO_NOTICE }));
    $box.attr('tabindex', '-1').removeClass('hidden').hide().fadeIn(400);
    $('html, body').animate({ scrollTop: $box.offset().top - 100 }, 400, function () {
        $box.trigger('focus');
    });
}

/* Connects one form to its validation.
   validate() returns a list of { field, message }; onValid() returns the summary for the confirmation box.
   The error and confirmation boxes already exist in the HTML: <base>-error and <base>-result. */
function setupForm(formId, validate, onValid) {
    // required, type, min and max stay in the HTML as the first line of defence (they still work if this script fails).
    // A check in the browser never replaces a check on the server: the visitor can switch it off or send a request without our page.
    const $form = $('#' + formId).prop('noValidate', true);
    const $resultBox = $('#' + formId.replace('-form', '-result'));
    const $errorBox = $resultBox.siblings('.alert-danger');

    function clearAll() {
        $form.find('.field-error').remove();
        $form.find('.error, .success').removeClass('error success').removeAttr('aria-invalid aria-describedby');
        hideBox($errorBox);
        hideBox($resultBox);
    }

    $form.on('submit', function (event) {
        // without preventDefault the browser would send the form and reload the page, so no message could be shown
        event.preventDefault();
        clearAll();
        const errors = validate();
        const $fields = $form.find('input, select, textarea');
        errors.sort(function (a, b) {
            return $fields.index(a.field) - $fields.index(b.field);
        });
        $.each(errors, function (index, error) {
            showFieldError(error.field, error.message);
        });
        const $invalid = $($.map(errors, function (error) {
            return error.field.get(0);
        }));
        // find: all text-like controls -> not: drop the invalid ones -> filter: keep the filled ones -> addClass: mark them as valid
        $form.find('.form-control, .form-select').not($invalid).filter(function () {
            return $(this).val().trim() !== '';
        }).addClass('success');
        if (errors.length > 0) {
            showBox($errorBox, 'Please correct the highlighted fields and submit again.');
            errors[0].field.trigger('focus');
            return;
        }
        const summary = onValid();
        $form.trigger('reset');
        showSummary($resultBox, summary);
    });
    $form.on('input change', '.error', function () {
        clearFieldError($(this));
        if ($form.find('.field-error').length === 0) {
            hideBox($errorBox);
        }
    });
    $form.on('reset', clearAll);
    return $form;
}

/* ---------- Site-wide feature 1: page search in the header ---------- */

function findPages(query) {
    const words = query.toLowerCase().split(/\s+/);
    return SITE_PAGES.filter(function (page) {
        const text = (page.title + ' ' + page.description + ' ' + page.keywords).toLowerCase();
        return words.every(function (word) {
            return text.includes(word);
        });
    });
}

// jQuery version: $('<a>', {...}), .append, .appendTo, .fadeIn and .on replace createElement, append, classList and addEventListener.
// The result is about the same length, clearer to read, and the delegated click handler is new.
function createSearchItem(page) {
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    const $link = $('<a>', { href: page.url, 'class': 'list-group-item list-group-item-action' });
    if (page.url === currentPage) {
        $link.addClass('active').attr('aria-current', 'page');
    }
    return $link.append($('<strong>').text(page.title), $('<span>', { 'class': 'd-block small', text: page.description }));
}

function renderSearchResults($box, query) {
    $box.empty();
    if (query === '') {
        $box.stop(true, true).addClass('hidden').removeAttr('style');
        return 0;
    }
    const matches = findPages(query);
    const $count = $('<p>', { 'class': 'small mb-2' }).appendTo($box);
    if (matches.length === 0) {
        $count.text('No pages found for “' + query + '”. Try “audition”, “equipment” or “workshop”.');
    } else {
        $count.text(matches.length + (matches.length === 1 ? ' page found' : ' pages found'));
        const $list = $('<div>', { 'class': 'list-group' }).appendTo($box);
        $.each(matches, function (index, page) {
            createSearchItem(page).appendTo($list);
        });
    }
    if ($box.hasClass('hidden')) {
        $box.removeClass('hidden').hide().fadeIn(150);
    }
    return matches.length;
}

function setupSiteSearch() {
    const $nav = $('#main-navigation');
    if ($nav.length === 0) {
        return;
    }
    const $input = jqSearch('site-search-input', 'Search the site: audition, equipment, workshop...');
    const $clear = jqButton('Clear', 'btn btn-outline-secondary');
    const $results = $('<div>', { id: 'site-search-results', 'class': 'hidden mt-2', 'aria-live': 'polite' });
    const $form = $('<form>', { id: 'site-search-form', 'class': 'mt-3', role: 'search' }).append(
        $('<label>', { 'for': 'site-search-input', 'class': 'visually-hidden', text: 'Search the site' }),
        $('<div>', { 'class': 'input-group' }).append($input, $('<button>', { type: 'submit', 'class': 'btn btn-primary', text: 'Search' }), $clear),
        $results).insertAfter($nav);

    function update() {
        return renderSearchResults($results, $input.val().trim());
    }
    function clear() {
        $input.val('');
        update();
        $input.trigger('focus');
    }

    $input.on('input', update).on('keydown', function (event) {
        if (event.key === 'Escape') {
            clear();
        }
    });
    $clear.on('click', clear);
    $form.on('submit', function (event) {
        event.preventDefault();
        if (update() > 0) {
            $results.find('a').first().trigger('focus');
        }
    });
    // Delegated: the links are rebuilt on every keystroke, so a handler bound directly to the links would find none when it is attached
    // and would never run for the new ones; the parent exists from the start and catches clicks from links created later.
    $results.on('click', 'a.active', function (event) {
        // the page is already open: without preventDefault the browser would reload it instead of just closing the results
        event.preventDefault();
        clear();
    });
}

/* ---------- Site-wide feature 2: next concert notice at the top of every page ---------- */

function showNextConcert() {
    const main = document.querySelector('main');
    if (main === null) {
        return;
    }
    const next = getUpcomingEvents()[0];
    const banner = document.createElement('div');
    banner.className = 'alert alert-warning d-flex flex-wrap align-items-center gap-2';
    const text = document.createElement('span');
    text.textContent = '♪ Next concert: ' + next.title + ', ' + MONTH_NAMES[next.month - 1] + ' ' + next.day +
        ' (' + describeDays(daysUntil(next.date)) + '), ' + next.place + '.';
    const link = document.createElement('a');
    link.className = 'alert-link';
    link.href = 'events.html#events-schedule';
    link.textContent = 'See all concerts';
    banner.append(text, link);
    main.prepend(banner);
}

// jQuery 3.7.1 (the full build: the slim one has no effects) is loaded from the CDN before this file,
// and $(function () {...}) is the short form of $(document).ready: it waits until the page is built.
$(function () {
    setupSiteSearch();
    showNextConcert();
});
