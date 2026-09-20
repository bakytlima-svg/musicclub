# CSS Assignment Checklist

Student: Мерейлим Ерулан Жансая
Project: AITU Music Club
Branch: main

---

## 1. Stylesheets

- [x] css/base.css
- [x] css/student.css
- [x] Every page uses base.css before student.css
- [x] Personal stylesheet contains student-specific styles

---

## 2. Required CSS Selectors

| Requirement | Selector | File | Student |
|---|---|---|---|
| Type selector | `body` | base.css | Мерейлим Ерулан Жансая |
| Class selector | `.recruitment-section` | base.css | Мерейлим Ерулан Жансая |
| ID selector | `#schedule-table` | student.css | Мерейлим Ерулан Жансая |
| Descendant selector | `main p` | base.css | Мерейлим Ерулан Жансая |
| Child selector | `nav > ul` | base.css | Мерейлим Ерулан Жансая |
| Adjacent sibling | `nav h2 + ul` | base.css | Мерейлим Ерулан Жансая |
| Grouping selector | `h1, h2, h3` | base.css | Мерейлим Ерулан Жансая |
| Attribute selector | `a[href]` | base.css | Мерейлим Ерулан Жансая |
| Universal selector | `*` | base.css | Мерейлим Ерулан Жансая |
| `:hover` | `nav a:hover` | base.css | Мерейлим Ерулан Жансая |
| `:focus` | `nav a:focus` | base.css | Мерейлим Ерулан Жансая |
| `:first-child` | `nav li:first-child` | base.css | Мерейлим Ерулан Жансая |
| `::before` | `nav li::before` | base.css | Мерейлим Ерулан Жансая |
| `::after` | `.rehearsal-photo::after` | base.css | Мерейлим Ерулан Жансая |

Line numbers will be added after the final stylesheet version is saved.

---

## 3. Classes and IDs

- [x] At least 8 meaningful classes are used.
- [x] Classes describe their purpose.
- [x] At least 2 IDs are used on the page.
- [x] IDs are unique.
- [x] `#club-profile` is used as a unique jump destination.
- [x] `#leadership-board` is used as a unique jump destination.
- [x] `#schedule-table` is used for the unique schedule section.
- [x] IDs are not unnecessarily reused.

---

## 4. Colour Palette

Maximum five distinct colours:

1. `#111827` — main dark colour.
2. `#7C3AED` — purple accent and borders.
3. `rgb(255, 255, 255)` — light background/text.
4. `rgba(255, 255, 255, 0.7)` — transparent content background.
5. `gold` — highlight and focus colour.

- [x] Hex colour used.
- [x] RGB colour used.
- [x] RGBA colour used.
- [x] Named colour used.
- [x] Palette is limited to five distinct colours.

---

## 5. Typography

- [x] First font family has full fallback:
      `Arial, Helvetica, sans-serif`
- [x] Second font family has full fallback:
      `Georgia, "Times New Roman", serif`
- [x] `font-size` deliberately set.
- [x] `font-weight` deliberately set.
- [x] `line-height` deliberately set.
- [x] `letter-spacing` deliberately set.

---

## 6. Box Model

- [x] `box-sizing: border-box`
- [x] margin used.
- [x] padding used.
- [x] border used.
- [x] Margin collapse explained in a CSS comment.

---

## 7. Alignment

- [x] `text-align: center` used.
- [x] Auto margins used for centering.
- [x] Flexbox used for centering.
- [x] Each technique is documented with a comment.

---

## 8. Flexbox

### Navigation

- [x] Navigation uses `display: flex`.
- [x] Navigation is a row.
- [x] `justify-content` used.
- [x] `align-items` used.
- [x] `gap` used.

### Content

- [x] Additional content block uses Flexbox.
- [x] `flex-wrap` used.
- [x] `flex-direction` used.
- [x] `flex-grow` used through flex shorthand.
- [x] `flex-shrink` used through flex shorthand.
- [x] Flexbox purpose explained in a comment.

---

## 9. Grid

- [x] Grid used on student page.
- [x] `grid-template-columns` used.
- [x] `fr` units used.
- [x] `repeat()` used.
- [x] `gap` used.
- [x] `minmax()` used.
- [x] Grid item spans multiple columns.
- [x] Grid item spans multiple rows.
- [x] Comment explains why Grid is suitable.

---

## 10. Positioning

- [x] `position: static`
- [x] `position: relative`
- [x] `position: absolute`
- [x] `position: fixed`

### Purpose

- Static keeps an element in normal document flow.
- Relative creates a containing block.
- Absolute positions the generated caption relative to the containing block.
- Fixed keeps the footer attached to the screen.

---

## 11. Float and Clear

- [x] Image uses `float: left`.
- [x] Image is inside its own paragraph.
- [x] `clear: both` is used.
- [x] Comment explains what `clear` prevents.

---

## 12. Pseudo-classes and Pseudo-elements

- [x] `:hover`
- [x] `:focus`
- [x] `:first-child`
- [x] `::before`
- [x] `::after`

---

## 13. Cascade Demonstration

- [x] One internal `<style>` block will be used.
- [x] One inline `style` attribute will be used.
- [x] External CSS is used for the main styling.
- [x] Cascade demonstration is documented.

---

## 14. Specificity Experiment

- [x] Class selector `.special-text` created.
- [x] ID selector `#schedule-table` created.
- [x] Specificity difference explained.
- [x] More-specific selector wins.
- [x] Final conflict resolved without `!important`.
- [x] No unnecessary `!important` used.

---

## 15. Required Comments

- [x] Less obvious selectors are commented.
- [x] Grid purpose is commented.
- [x] Flexbox purpose is commented.
- [x] Positioning purpose is commented.
- [x] Float purpose is commented.
- [x] Clear purpose is commented.
- [x] Margin collapse is commented.
- [x] Specificity experiment is commented.

---

## 16. Final Validation

- [ ] CSS Validator: 0 errors.
- [ ] HTML Validator: passes.
- [ ] All pages open correctly.
- [ ] Navigation links work.
- [ ] Images display correctly.
- [ ] No broken CSS paths.
- [ ] No broken HTML paths.

---

## 17. Assignment Evidence

- [ ] Before-CSS hand-drawn sketch for page 1.
- [ ] Before-CSS hand-drawn sketch for page 2.
- [ ] Sketches signed and dated.
- [ ] Photos of sketches added to repository.
- [ ] Before screenshots added.
- [ ] After screenshots added.
- [ ] AI log updated.
- [ ] README updated.

---

## 18. Git Commits

Required development history:

- [ ] Commit 1
- [ ] Commit 2
- [ ] Commit 3
- [ ] Commit 4

If working individually:

- [ ] At least 6 commits across at least 3 days.

---

## 19. Final Submission

- [ ] All required HTML files included.
- [ ] `css/base.css` included.
- [ ] `css/student.css` included.
- [ ] CSS checklist included.
- [ ] Sketches included.
- [ ] Screenshots included.
- [ ] AI log included.
- [ ] README included.
- [ ] Validators checked.
- [ ] GitHub Pages checked.
- [ ] Final `index.html` completed once at the end.
