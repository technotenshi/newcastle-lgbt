---
name: ics-event
description: Generate an iCal (.ics) file content and Google Calendar URL for an event from content/events/
---

Generate calendar integration for a Newcastle LGBTQ+ site event. Read the specified event file (or the most recently created/edited event file) and output:

1. A complete `.ics` file (iCal format) the user can save and link as a download
2. A Google Calendar "Add to Calendar" URL
3. The HTML snippet to embed both options in the event page body or in the component

## How to use

The user invokes `/ics-event [optional: path to event file]`. If no path is given, use the most recently edited file in `content/events/`.

## Step-by-step

1. **Read the event file** — extract from frontmatter and body:
   - `title` — event name
   - `date` — YYYY-MM-DD format
   - Start time and end time — parse from prose in the body (e.g. "from 7:00–8:30 PM")
   - Location — parse from prose in the body
   - Description — the event body text (strip markdown formatting)
   - URL — the `link.target` field from frontmatter

2. **Handle missing time** — if start/end time is not found in the body, use placeholder times (6:00 PM – 8:00 PM) and note the assumption so the user can correct it.

3. **Generate the iCal content** — format:

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Newcastle LGBTQ Voice//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:[slug]@newcastle.lgbt
DTSTART;TZID=America/Los_Angeles:[YYYYMMDDTHHMMSS]
DTEND;TZID=America/Los_Angeles:[YYYYMMDDTHHMMSS]
SUMMARY:[title]
DESCRIPTION:[description — wrap at 75 chars, escape commas and semicolons with backslash]
LOCATION:[location]
URL:[link.target]
END:VEVENT
END:VCALENDAR
```

   - Timezone: always `America/Los_Angeles` (Newcastle, WA)
   - Line folding: iCal spec requires lines >75 chars to be folded with CRLF + single space
   - Escape `,` and `;` in DESCRIPTION and LOCATION with `\`

4. **Generate the Google Calendar URL**:

```
https://calendar.google.com/calendar/render?action=TEMPLATE&text=[URL-encoded title]&dates=[YYYYMMDDTHHMMSS]/[YYYYMMDDTHHMMSS]&details=[URL-encoded description]&location=[URL-encoded location]
```

   - Dates format for Google: `YYYYMMDDTHHMMSS` (no timezone suffix — Google infers from user's calendar)
   - URL-encode all parameter values

5. **Output the suggested file path**: `public/events/[slug].ics`
   Note: files in `public/` are served as-is by Nuxt static build. The user should save the `.ics` there.

## Output format

````
### iCal file
**Save as:** `public/events/[slug].ics`

```
[complete .ics content]
```

---

### Google Calendar URL
```
[full URL]
```

---

### HTML snippet (add to event body in content/events/[filename].md)

Add to the event body after the CTA sentence:

```markdown
[Add to Google Calendar](https://calendar.google.com/...) | [Download .ics](/events/[slug].ics)
```
````

## Notes for the user

- The `.ics` file path `/events/[slug].ics` assumes the file is saved at `public/events/[slug].ics`
- The user must save the file — Claude cannot write to `public/` without being asked to
- Verify the extracted time is correct before distributing the calendar link
