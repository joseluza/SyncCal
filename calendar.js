let calendar;

function initializeEmptyCalendar() {
    var calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }
    });
    calendar.render();
}

function loadCalendarEvents() {
    if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
        return;
    }
    
    calendar.removeAllEvents();
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
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeEmptyCalendar();
});
