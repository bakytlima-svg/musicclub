'use strict';

/* bands.js - upcoming performances list on the Student Bands page. */

function createPerformanceItem(event) {
    const item = document.createElement('li');
    item.className = 'list-group-item';
    const link = document.createElement('a');
    link.href = 'events.html#events-schedule';
    link.textContent = 'see the full concert calendar';
    item.append(event.title + ' — ' + MONTH_NAMES[event.month - 1] + ' ' + event.day + ', ' + event.place +
        ' (' + describeDays(daysUntil(event.date)) + ') · ', link);
    return item;
}

function showUpcomingPerformances() {
    const performances = document.querySelector('#performances ol');
    if (performances === null) {
        return;
    }
    performances.replaceChildren();
    getUpcomingEvents().slice(0, 3).forEach(function (event) {
        performances.append(createPerformanceItem(event));
    });
}

showUpcomingPerformances();
