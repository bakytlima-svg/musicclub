# AITU Music Club — endterm

Same repository and the same pages as the midterm. No HTML or CSS was written by hand after the `midterm` tag, except two script tags (jQuery and `js/jquery-features.js`) at the end of every page.

## Plain JavaScript and jQuery are kept apart

| Feature | Type | File | Written by |
|---|---|---|---|
| Data arrays (concerts, rehearsals, equipment, workshops, bands, instruments, pages) | plain JS | `js/data.js` | |
| Shared helpers, dates, validation rules, form feedback, next-concert notice | plain JS | `js/main.js` | |
| Rehearsal timetable and next rehearsal | plain JS | `js/index.js` | |
| Studio booking (free windows, live summary) | plain JS | `js/about.js` | |
| Concert timetable, performer form, lineup status | plain JS | `js/events.js` | |
| Equipment inventory and request form | plain JS | `js/equipment.js` | |
| Workshop timetable, registration form, my registrations | plain JS | `js/workshops.js` | |
| Band interest form, upcoming performances | plain JS | `js/bands.js` | |
| Audition application form | plain JS | `js/audition-form.js` | |
| Site search | jQuery | `js/jquery-features.js` | |
| Band finder and "I want to join" buttons | jQuery | `js/jquery-features.js` | |
| Terms that open and close (home page, workshops page) | jQuery | `js/jquery-features.js` | |

Both parts read the same arrays from `data.js`; the jQuery file calls no plain-JS function and the plain files use no jQuery.

## What was added since each feature was last defended

- Form validation (all six forms): a field is checked as soon as the visitor leaves it, not only on submit.
- Site search: arrow keys move through the results, Enter opens the chosen page.
- Band finder: each group card has a button that fills in the genre of the interest form, scrolls to it and says what was chosen.
- Terms (home and workshops pages): the definitions are answers that open on click or Enter and close again.
- Workshops: a "My workshop registrations" list with a Cancel button that gives the seat back, and a message when the list is empty.
- Events: the lineup status badge is calculated from the concert list (how many concerts still accept applications).
- Home page: the next rehearsal is calculated from the weekly schedule.
- Equipment: rows show how many units of an item were requested in this session.

## Checks before submitting

Console without errors on all 8 pages, 375 px / 768 px / desktop, HTML and CSS validators, tag `endterm`, at least four commits per student on three different days, AI log updated.
