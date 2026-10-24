'use strict';

/* data.js - project data shared by several pages. Loaded before main.js and the page scripts. */

// Concerts from the Events page (month is 1-12; the year is calculated in JavaScript).
const EVENTS = [
    { id: 'valentine', title: "Valentine's Day Acoustic Set", month: 2, day: 14, place: 'Main Atrium Lounge', style: 'Romantic Acoustic & Vocal Duets', term: 'Spring', electricAllowed: false },
    { id: 'aitu-run', title: 'AITU Run Sports Festival', month: 4, day: 3, place: 'Campus Outdoor Square', style: 'High-Energy Rock, Brass & Percussion', term: 'Spring', electricAllowed: true },
    { id: 'acoustic-night', title: 'Acoustic Night', month: 5, day: 18, place: 'Room C1.1.142 & Terrace', style: 'Unplugged Indie, Saxophone & Jazz', term: 'Spring', electricAllowed: false },
    { id: 'bye-bye-party', title: 'Bye Bye Party (Year Finale)', month: 6, day: 12, place: 'Main Assembly Hall', style: 'All Club Ensembles Showcase', term: 'Spring', electricAllowed: true },
    { id: 'halloween', title: 'Halloween Rock Concert', month: 10, day: 31, place: 'Main Assembly Hall', style: 'Costumed Alternative Rock & Metal', term: 'Autumn', electricAllowed: true },
    { id: 'new-year', title: 'New Year Gala Concert', month: 12, day: 29, place: 'Main Atrium Stage', style: 'Holiday Big Band & Pop Covers', term: 'Autumn', electricAllowed: true }
];

// Weekly rehearsal allocation of Room C1.1.142 (weekday: 0 = Sunday ... 6 = Saturday).
const REHEARSAL_SCHEDULE = [
    { weekday: 1, dayName: 'Monday', start: '17:00', end: '19:00', band: 'AITU Acoustic Band', genre: 'Indie Folk' },
    { weekday: 3, dayName: 'Wednesday', start: '18:30', end: '20:30', band: 'Overdrive Collective', genre: 'Alternative Rock' },
    { weekday: 5, dayName: 'Friday', start: '16:00', end: '18:00', band: 'Astana IT Jazz Project', genre: 'Bossa Nova & Swing' }
];

// Club equipment (ids match the options of the equipment request form).
const EQUIPMENT = [
    { id: 'acoustic-guitar', name: 'Yamaha F310', type: 'Acoustic guitar', group: 'Guitars', quantity: 2, use: 'Rehearsal, songwriting' },
    { id: 'electric-guitar', name: 'Fender Squier Stratocaster', type: 'Electric guitar', group: 'Guitars', quantity: 1, use: 'Rehearsal, live performance' },
    { id: 'keyboard', name: 'Yamaha PSR-E373', type: 'Digital keyboard', group: 'Keys', quantity: 1, use: 'Accompaniment, rehearsal' },
    { id: 'drum-kit', name: '5-piece drum kit with cymbals', type: 'Drum kit', group: 'Drums', quantity: 1, use: 'Rehearsal, live performance' },
    { id: 'microphone', name: 'Shure SM58', type: 'Microphone', group: 'Audio', quantity: 2, use: 'Vocals, live performance' },
    { id: 'mixer', name: 'Behringer Xenyx Q802USB', type: 'Mixer', group: 'Audio', quantity: 1, use: 'Live sound, recording' },
    { id: 'pa-speaker', name: 'Yamaha DBR12', type: 'PA speaker', group: 'Audio', quantity: 2, use: 'Live performance' }
];

// Workshops (ids match the workshop select; needsBring is checked in the registration form).
const WORKSHOPS = [
    { id: 'vocal-control', weekday: 3, dayName: 'Wed', time: '16:00', topic: 'Vocal Control & Diaphragmatic Breathing', instructor: 'Адильбек С.', room: 'Room C1.1.142', seats: 12, needsBring: '' },
    { id: 'guitar-effects', weekday: 4, dayName: 'Thu', time: '17:30', topic: 'Guitar Effect Chain & Pedalboard Wiring', instructor: 'Абразаков Рамиль', room: 'Room C1.1.142', seats: 10, needsBring: 'electric' },
    { id: 'mixer-calibration', weekday: 5, dayName: 'Fri', time: '15:00', topic: 'Live Digital Mixer Calibration (Behringer XR18)', instructor: 'Абразаков Рамиль', room: 'Room C1.1.142', seats: 8, needsBring: '' },
    { id: 'rhythm-section', weekday: 6, dayName: 'Sat', time: '14:00', topic: 'Rhythm Section Synchronization for Bands', instructor: 'Айварұлы Ақназар', room: 'Main Atrium', seats: 15, needsBring: '' }
];

// Student bands (id = id of the card on the Student Bands page; genreKey = value of the genre select).
const BANDS = [
    { id: 'band-neon-pulse', name: 'NEON PULSE', genre: 'K-pop', genreKey: 'k-pop', members: ['Arujan', 'Jibek', 'Yerasyl', 'Dinmuhammed', 'Arsen', 'Vlad'] },
    { id: 'band-moldik', name: 'MOLDIK', genre: 'Lyrics', genreKey: 'other', members: ['Yersultan', 'Meruert', 'Dankibek', 'Asem', 'Sherkhan'] }
];

// Instruments of the audition form (role is the radio value the instrument belongs to).
const AUDITION_INSTRUMENTS = [
    { value: 'electric-guitar', label: 'Electric Guitar', section: 'Melodic & Lead Instruments', role: 'instrumentalist', tip: 'Prepare one 3-minute solo piece; the committee also listens to your teamwork in the group rhythm exercise.' },
    { value: 'bass-guitar', label: 'Bass Guitar', section: 'Rhythm and Bass Section', role: 'instrumentalist', tip: 'Prepare a 3-minute piece and be ready for the 5-minute group rhythm exercise: rhythm stability matters most.' },
    { value: 'drums', label: 'Drums / Percussion', section: 'Rhythm and Bass Section', role: 'instrumentalist', tip: 'Prepare a 3-minute piece and be ready for the 5-minute group rhythm exercise: rhythm stability matters most.' },
    { value: 'keyboards', label: 'Piano / Synthesizer', section: 'Melodic & Lead Instruments', role: 'instrumentalist', tip: 'Prepare one 3-minute solo piece; the committee also listens to your teamwork in the group rhythm exercise.' },
    { value: 'saxophone', label: 'Saxophone / Brass', section: 'Melodic & Lead Instruments', role: 'instrumentalist', tip: 'Prepare one 3-minute solo piece; the committee also listens to your pitch control.' },
    { value: 'violin', label: 'Violin / Strings', section: 'Melodic & Lead Instruments', role: 'instrumentalist', tip: 'Prepare one 3-minute solo piece; the committee also listens to your pitch control.' },
    { value: 'vocal', label: 'Vocal Solo', section: 'Vocal Department', role: 'vocalist', tip: 'Arrive 15 minutes early to warm up your voice; pitch control and stage confidence are evaluated.' },
    { value: 'none', label: 'No instrument (sound engineering)', section: 'Technical Support', role: 'technician', tip: 'Describe your sound or stage experience in the notes field below.' }
];

// Pages of the site, used by the site-wide search.
const SITE_PAGES = [
    { title: 'Home', url: 'index.html', description: 'Club overview, weekly rehearsal schedule and audition form.', keywords: 'home club overview rehearsal schedule timetable audition application membership room' },
    { title: 'About Club', url: 'about.html', description: 'History, leadership and the rehearsal slot booking form.', keywords: 'about history leadership president departments committee booking book rehearsal slot reserve' },
    { title: 'Events & Gigs', url: 'events.html', description: 'Concert calendar and performer registration.', keywords: 'events gigs concerts halloween new year acoustic night calendar performer stage registration' },
    { title: 'Studio & Gear', url: 'equipment.html', description: 'Instruments, audio equipment and the equipment request form.', keywords: 'studio gear equipment instruments guitar keyboard drums microphone mixer speaker inventory request malfunction' },
    { title: 'Student Bands', url: 'bands.html', description: 'Student groups, genres and the band interest form.', keywords: 'bands groups genres k-pop neon pulse moldik performances interest join' },
    { title: 'Workshops', url: 'workshops.html', description: 'Masterclass timetable and workshop seat registration.', keywords: 'workshops masterclass vocal guitar mixer rhythm lessons seat registration' },
    { title: 'Auditions', url: 'auditions.html', description: 'How auditions work and the candidate application form.', keywords: 'auditions tryouts join recruitment candidate application instrument' },
    { title: 'Colophon', url: 'colophon.html', description: 'How the site was built: tools, Git routine and validation.', keywords: 'colophon git validation tools html css technical' }
];
