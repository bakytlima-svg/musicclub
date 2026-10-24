# AITU Music Club - Assignments 4 and 5 (JavaScript)

Website of the Astana IT University Music Club (Room C1.1.142). This stage adds JavaScript only: variables, arrays, loops and functions (Assignment 4), then DOM, events and form validation (Assignment 5). All forms are front-end demonstrations: **no data is sent to a server and no real booking, payment or order is created.**

## Functionality Plan

Replace `[name]` with the student who is responsible for the page.

| Page | Visitor goal | Planned function | Expected result | Responsible |
|---|---|---|---|---|
| All pages | Find the right page quickly | Site search in the header (`main.js`) | List of matching pages, result count, no-results message, Clear button, Esc key | team |
| All pages | Know when the next concert is | Next concert notice (`main.js`) | Concert name, date, days left, link to the calendar | team |
| Home | See when the room is busy | Weekday filter for the rehearsal timetable (`index.js`) | Filtered rows, today highlighted, empty state with link to booking | [name] |
| Home, Auditions | Apply for an audition | Application form with validation and instrument hint (`audition-form.js`) | Field errors, then a summary and a demo reference | [name] |
| About | Reserve the room for a rehearsal | Free-slot finder + live summary + booking form (`about.js`) | Clickable free 2-hour windows, live availability, summary on success | [name] |
| Events | Choose a concert and apply to perform | Search / term filter / sort of the timetable + stage application form (`events.js`) | Row selected, form filled in, rules for deadline, date, category | [name] |
| Studio & Gear | Find equipment, request or report it | Inventory search / group filter / sort with unit totals + request form (`equipment.js`) | Filtered table, form filled in, availability check per date | [name] |
| Student Bands | Find a band, show interest | Band finder + upcoming performances + interest form (`bands.js`) | Cards shown/hidden with count and empty state; closest band in the summary | [name] |
| Workshops | Pick a workshop and reserve a seat | Timetable search / day filter with seat counter + registration form (`workshops.js`) | Next session date, seats left, duplicate and "bring" rules | [name] |
| Colophon | (information page) | Shared features only | - | team |

## Files

- `js/data.js` - arrays of project data (concerts, rehearsal slots, equipment, workshops, bands, instruments, pages)
- `js/main.js` - shared helpers (dates, validation rules, form feedback, `setupForm`) and the two site-wide features
- `js/index.js`, `js/about.js`, `js/events.js`, `js/equipment.js`, `js/bands.js`, `js/workshops.js` - one file per page
- `js/audition-form.js` - audition form (used by `index.html` and `auditions.html`)
- `JS-CHECKLIST.md` - requirements with exact files and line numbers

## HTML/CSS freeze: changes against the `midterm` tag

- **HTML:** only `<script src="js/..." defer>` lines were added before the Bootstrap script in every page. No interface element was added, removed or rewritten.
- **CSS (essential correction, no points claimed):** the teacher allowed our group one change of the page background design. Only `css/base.css` was changed: the `body` background (soft gradients and a faint pattern of notes), the hero panel, and a block of colour details at the end of the file (navigation hover, headings, cards, tables, notes, footer). `css/site.css` is unchanged.
- All new elements (controls, hints, live summary, error messages) are created with DOM methods; states are changed only through `classList` with the classes prepared at midterm (`hidden`, `active`, `selected`, `error`, `success`). No `element.style`.

## Rules used in the demonstration (please confirm with the club)

- Concert applications are closed 14 days before the show (from the Events workflow text).
- A rehearsal lasts 1 to 3 hours, must be booked 24 hours ahead and cannot overlap the weekly timetable.
- Audio equipment cannot be booked on a concert day; a unit cannot be requested twice for the same date.
- Workshop seat numbers are example capacities (8-15), not real data.
- Reference numbers (`DEMO-...`) and the example audition time are random and only show how a confirmation will look.

## Known content notes (HTML is frozen, so not changed)

- `index.html` lists different instruments in "Studio Gear Inventory" than `equipment.html`.
- `bands.html` calls NEON PULSE a five-member group but names six members; the phone link in its note differs from the footer phone.
- `colophon.html` still says that no custom scripts are used.

## AI log

Add your own entry here (what was generated, what you changed, how you checked it).
