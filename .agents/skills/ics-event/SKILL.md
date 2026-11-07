---
name: ics-event
description: Generate verified iCal and Google Calendar event links.
---

# Calendar integration for site events

Use for a specified `content/events/` file, or the latest edited event when no path is given. Read its title/date/slug, organizer URL, location and prose times. Do not modify the event page or add public files unless requested.

## Verify inputs first

1. Check the organizer's actual date and start/end times. Interpret local event times with `America/Los_Angeles`, using a timezone-aware tool so DST is handled. Do not derive the offset from the host clock or guess placeholder hours.
2. If start/end time is missing, ask for it. An all-day event is acceptable only when the source/user establishes that; use DATE values with an exclusive next-day DTEND. Ambiguous/nonexistent DST local times need source clarification.
3. Convert verified timed events to UTC using a tool. Use the same UTC interval for both calendar formats; confirm end is after start, including overnight events.

## iCalendar contract

Produce `public/events/<slug>.ics` when writing is requested; otherwise state that proposed path and return the content. Timed events use this shape, replacing every bracketed placeholder with verified values:

```text
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Newcastle LGBTQ Voice//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:[stable unique event identifier]@newcastle.lgbt
DTSTAMP:[generation time YYYYMMDDTHHMMSSZ]
DTSTART:[verified UTC YYYYMMDDTHHMMSSZ]
DTEND:[verified UTC YYYYMMDDTHHMMSSZ]
SUMMARY:[escaped title]
DESCRIPTION:[escaped plain-text event description]
LOCATION:[escaped location]
URL:[organizer or registration URL]
END:VEVENT
END:VCALENDAR
```

- Use CRLF line endings, including after END:VCALENDAR.
- DTSTAMP is required; obtain the actual generation time with a tool. Preserve UID across revisions of the same event.
- UTC `Z` values avoid incomplete TZID/VTIMEZONE definitions. Do not mix floating local times with UTC. For an authorized all-day event, use `DTSTART;VALUE=DATE` and exclusive `DTEND;VALUE=DATE`, without `Z`.
- Escape backslashes, newlines, commas and semicolons in TEXT fields (`SUMMARY`, `DESCRIPTION`, `LOCATION`). URL is a URI, not a TEXT field; encode it appropriately rather than applying TEXT escaping.
- Fold content lines at no more than 75 UTF-8 octets, without splitting a code point, using CRLF plus one leading space on continuation lines. The continuation space counts toward its line's octet budget.

Reference: [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545.html), sections 3.1, 3.3.11 and 3.6.1.

## Google Calendar URL

Build with a URL encoder, not manual string replacement:

```text
https://calendar.google.com/calendar/render?action=TEMPLATE&text=<title>&dates=<UTC-start>/<UTC-end>&details=<description>&location=<location>&ctz=America%2FLos_Angeles
```

Timed `dates` values are `YYYYMMDDTHHMMSSZ`; all-day values are dates with exclusive end. Encode every query value. Never rely on the recipient's default calendar timezone to interpret floating Newcastle times.

## Verification and report

Before distributing, parse the generated ICS with an available calendar parser, verify required properties/CRLF/UTF-8 folding and round-trip its interval to Pacific time. Decode the Google URL and compare its interval/title/location against the same source inputs. Do not install a parser without permission. If a real parser/import check cannot run, label that gap; string formatting alone is not a successful calendar import.

Report the verified Pacific interval, actual artifact path (or content-only status), Google URL and checks performed. Offer relative Markdown links only if page integration was requested; keep the normal event body concise. This skill's guidance edit does not itself prove calendar-client import compatibility.
