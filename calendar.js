let calendar;

function initializeEmptyCalendar() {
    var calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        dateClick: function(info) {
            showEventForm(info.dateStr);
        }
    });
    calendar.render();
}

function loadCalendarEvents() {
    if (accessToken === null) {
        console.log('No access token available');
        return;
    }

    gapi.client.setToken({ access_token: accessToken });
    gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': new Date().toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 100,
        'orderBy': 'startTime'
    }).then((response) => {
        var events = response.result.items.map(event => {
            return {
                title: event.summary,
                start: event.start.dateTime || event.start.date,
                end: event.end.dateTime || event.end.date,
                description: event.description
            };
        });
        calendar.addEventSource(events);
    }).catch((error) => {
        console.error('Error fetching calendar events:', error);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeEmptyCalendar();
    loadCalendarEvents();
});

function showEventForm(dateStr) {
    const form = document.getElementById('event-form');
    form.style.display = 'block';
    document.getElementById('event-start').value = dateStr + "T00:00";
    document.getElementById('event-end').value = dateStr + "T23:59";
}
