# JavaScript Checklist - AITU Music Club

Files: `js/data.js`, `js/main.js`, `js/index.js`, `js/about.js`, `js/events.js`, `js/equipment.js`, `js/bands.js`, `js/workshops.js`, `js/audition-form.js` (line numbers refer to the final versions).

| Requirement | File and line |
|---|---|
| js folder, `main.js` for shared code, page files, `defer` in every script tag | `js/` + `<script src="js/..." defer>` at the end of every page |
| `'use strict'` in every file | `js/data.js:1`, `js/main.js:1`, `js/index.js:1`, `js/about.js:1`, `js/events.js:1`, `js/equipment.js:1`, `js/bands.js:1`, `js/workshops.js:1`, `js/audition-form.js:1` |
| `const` by default, `let` only for changing values | `js/events.js:12`, `js/about.js:69`, `js/main.js:145` |
| No `var`, `==`, `!=`, inline events, `document.write()` | checked with search in all files: none found |
| Array of 6+ objects, 4+ properties each | `js/data.js:6`, `js/data.js:23`, `js/data.js:48`, `js/data.js:60` |
| Loop / traversal | `js/audition-form.js:19`, `js/about.js:69`, `js/equipment.js:23` |
| Filter / find / transform / total | `js/events.js:49` (filter), `js/main.js:165` (transform), `js/equipment.js:70` (total), `js/workshops.js:20` (find) |
| 4+ reusable functions with parameters and return values | `js/main.js:143`, `js/main.js:235`, `js/main.js:246`, `js/main.js:263`, `js/main.js:293` |
| One function calls another | `js/main.js:164` calls `getNextOccurrence`; `js/main.js:202` calls `isFullName` |
| Arithmetic | `js/main.js:122`, `js/about.js:134`, `js/equipment.js:71` |
| if/else, `===` and `!==` in project logic | `js/main.js:383`, `js/events.js:184`, `js/audition-form.js:66` |
| Logical operators `&&` and `||` | `js/audition-form.js:66`, `js/events.js:193`, `js/workshops.js:182` |
| `Math.random()` (reference number, example audition slot) | `js/main.js:294`, `js/audition-form.js:81` |
| Repeated cards/rows from one function | `js/index.js:41`, `js/events.js:62`, `js/equipment.js:76`, `js/workshops.js:63`, `js/main.js:454` |
| `textContent` / text nodes for user text, never `innerHTML` | `js/main.js:353` (summary uses `append` with text), `js/main.js:307` |
| Search / filter / sort with count, no-results state and reset | events: `js/events.js:47`; equipment: `js/equipment.js:54`; bands: `js/bands.js:45`; workshops: `js/workshops.js:54`; schedule: `js/index.js:70`; site search: `js/main.js:472` |
| Calculation / selection flow | booking duration, free windows and live summary: `js/about.js:67`, `js/about.js:126`; units total: `js/equipment.js:69`; seats left: `js/workshops.js:193` |
| `addEventListener` with 3+ event types | submit `js/main.js:410`, click `js/main.js:543`, input `js/main.js:436`, change `js/main.js:437`, keydown `js/main.js:538`, reset `js/main.js:438` |
| Create / remove elements with DOM methods | `js/main.js:37` (create), `js/main.js:333` (remove), `js/index.js:72` |
| `classList` for hidden / active / selected / error / success | hidden `js/main.js:343`, active `js/index.js:47`, selected `js/events.js:66`, error `js/main.js:318`, success `js/main.js:426` |
| Form flow: input, field-level validation, invalid/valid state, confirmation | `js/main.js:383` (shared by all six forms) |
| 4+ validated fields; trimmed text; email/phone; number/date/selection; rule that combines fields | audition: `js/audition-form.js:50`; booking: `js/about.js:163`; performer: `js/events.js:154`; equipment: `js/equipment.js:144`; band: `js/bands.js:97`; workshop: `js/workshops.js:162` |
| Specific errors beside fields, first invalid field focused, outdated errors cleared, no `alert()` | `js/main.js:307`, `js/main.js:431`, `js/main.js:327` |
| Success summary + 'no data is sent / nothing real is created' | `js/main.js:8`, `js/main.js:353` |
| Booking: reject past dates and conflicting values; live summary | `js/about.js:28`, `js/about.js:163`, `js/about.js:120` |
| Catalogue / list controls for the selected item (next action) | `js/events.js:105`, `js/equipment.js:106`, `js/workshops.js:115` |
| Site-wide feature (search + next concert notice) | `js/main.js:497`, `js/main.js:554` |

## Not applicable

- Cart/order: the club sells nothing; no payment or order is created.
- Login/registration and passwords: the site has no such pages.
- Reviews/comments: the site has no review section.

## Final checks (fill in before submission)

- [ ] Console has no errors on all 8 pages
- [ ] Tested at 375 px, 768 px and desktop width
- [ ] HTML and CSS validators pass
- [ ] Tags `assignment-4` and `assignment-5` created, `midterm` tag unchanged
- [ ] At least 4 commits per student across 3 days
- [ ] AI log updated
