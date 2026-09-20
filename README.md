# Astana IT University Music Club — Web Technologies Assignment 1

Official semantic HTML website for the Astana IT University Music Club (`@aitu_music`), developed for the *Introduction to Web Technologies* course.

---

## 📌 Project Overview
* **Organization:** Astana IT University Music Club
* **Physical Location:** Astana IT University, EXPO Business Center, Block C1, Room C1.1.142, Astana, Kazakhstan
* **Operating Hours:** Monday – Sunday, 09:00 – 22:00
* **Instagram:** [@aitu_music](https://www.instagram.com/aitu_music)
* **Club President:** Айварұлы Ақназар

---

## 👥 Team Members & Work Distribution
This project is built by a team of three students, totaling 8 interconnected semantic HTML pages:
This project is a website for the Astana IT University Music Club.

The website provides information about the club, its members, musical
departments, rehearsal space, events, equipment, auditions, and other
club activities.

The project was originally created for Assignment 1 and is being extended
for Assignment 2 with CSS styling and layout techniques.
| Student Name | Assigned Pages | Key Page Features |
| :--- | :--- | :--- |
| **Бактиярова Мерейлим** (Student 1) | `about.html`<br>`events.html` | Studio history & executive board, automated booking CLI showcase, annual concert schedule table, live performer signup form. |
| **Баимбет Ерұлан** (Student 2) | `equipment.html`<br>`bands.html` | Technical studio hardware inventory table, active university bands catalogue, reservation inquiry form. |
| **Сарсенбай Жансая** (Student 3) | `auditions.html`<br>`workshops.html` | Audition candidate registration form, sound engineering and instrumental workshops table. |
| **Shared / Team Files** | `index.html`<br>`colophon.html` | Portal landing page with global navigation, site colophon detailing Git workflow and markup architecture. |

---

## 🗂 Repository Structure
```text
musicclub/
│
├── index.html
├── about.html
├── auditions.html
├── bands.html
├── colophon.html
├── equipment.html
├── events.html
│
├── css/
│   ├── base.css
│   └── student.css
│
├── images/
│
├── css-checklist.md
├── ai-log.txt
└── README.md

CSS Organization
The project uses two stylesheets.
base.css
base.css contains shared styles used across the website.
It includes:
colour palette
typography
header
navigation
main content
footer
common selectors
Flexbox navigation
shared Grid layout
positioning examples
common image styles
accessibility states
student.css
student.css contains personal styles for the student's pages.
It includes:
About page layout
Flexbox department cards
Grid structure
floating image
clear property
relative and absolute positioning
contact section
form styling
specificity experiment
Each page must load:
css/base.css
css/student.css
in that order.
CSS Techniques Demonstrated
The assignment demonstrates the following CSS selectors:
Type selectors
Class selectors
ID selectors
Descendant selectors
Child selectors
Adjacent sibling selectors
Grouping selectors
Attribute selectors
Universal selector
:hover
:focus
:first-child
::before
::after
Layout Techniques
Flexbox
Flexbox is used for:
navigation
content blocks
department cards
centered form/contact controls
The project demonstrates:
display: flex
flex-direction
flex-wrap
justify-content
align-items
gap
flex grow/shrink behaviour
Grid
CSS Grid is used for structured page content where both rows and columns
are useful.
The project demonstrates:
display: grid
grid-template-columns
repeat()
fr
minmax()
gap
items spanning multiple columns
items spanning multiple rows
Positioning
The project demonstrates:
position: static
position: relative
position: absolute
position: fixed
Relative positioning is used to create a containing block for an
absolutely positioned generated caption.
Fixed positioning is used for the site footer.
Float and Clear
A page image demonstrates:
float: left;
The following content uses:
clear: both;
This prevents the content from wrapping around the floated image.
Typography
Two font families with fallbacks are used.
Body text:
Arial, Helvetica, sans-serif
Headings:
Georgia, "Times New Roman", serif
The project also deliberately sets:
font size
font weight
line height
letter spacing
Colour Palette
The website uses a limited five-colour palette:
Colour	Purpose
#111827	Dark background and strong text
#7C3AED	Purple accent, borders, and navigation
rgb(255, 255, 255)	Light backgrounds and text
rgba(255, 255, 255, 0.7)	Transparent content background
gold	Highlights and focus indicators
Accessibility
The project includes:
descriptive image alt attributes
keyboard focus styling
meaningful headings
semantic HTML elements
labelled form controls
navigation links
accessible link focus indicators
Validation
Before final submission:
CSS should be checked using the W3C CSS Validator.
HTML should be checked using the W3C HTML Validator.
Broken links and images should be checked manually.
The GitHub Pages website should be opened and tested.
Assignment Evidence
The final repository should contain:
CSS files
CSS checklist
hand-drawn page sketches
photographs/screenshots of sketches
before-CSS screenshots
after-CSS screenshots
AI log
README
Git history with the required commits
Author
Мерейлим Ерулан Жансая
AITU Music Club
