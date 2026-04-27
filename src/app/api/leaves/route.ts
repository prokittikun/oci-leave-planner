import { NextResponse } from 'next/server';

const ICS_URL = 'https://sara.oci.ltd/api/v1/public/leave-request/ics-calendar';

interface ParsedEvent {
  id: string;
  summary: string;
  startDate: string;
  endDate: string;
  description?: string;
}

function parseICSManual(icsText: string): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const eventBlocks = icsText.split('BEGIN:VEVENT');

  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i].split('END:VEVENT')[0];
    if (!block) continue;

    const lines = block.split(/\r?\n/);
    let summary = '';
    let dtstart = '';
    let dtend = '';
    let uid = '';
    let description = '';

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('SUMMARY:')) {
        summary = trimmed.substring('SUMMARY:'.length).trim();
      } else if (trimmed.startsWith('DTSTART')) {
        // Handle both DTSTART;VALUE=DATE:20260101 and DTSTART:20260101T090000Z
        const colonIdx = trimmed.indexOf(':');
        if (colonIdx !== -1) {
          dtstart = trimmed.substring(colonIdx + 1).trim();
        }
      } else if (trimmed.startsWith('DTEND')) {
        const colonIdx = trimmed.indexOf(':');
        if (colonIdx !== -1) {
          dtend = trimmed.substring(colonIdx + 1).trim();
        }
      } else if (trimmed.startsWith('UID:')) {
        uid = trimmed.substring('UID:'.length).trim();
      } else if (trimmed.startsWith('DESCRIPTION:')) {
        description = trimmed.substring('DESCRIPTION:'.length).trim();
      }
    }

    if (summary && dtstart) {
      const startDate = parseICSDate(dtstart);
      const endDate = dtend ? parseICSDate(dtend) : startDate;

      events.push({
        id: uid || `event-${i}`,
        summary,
        startDate,
        endDate,
        description: description || undefined,
      });
    }
  }

  return events;
}

function parseICSDate(dateStr: string): string {
  // Handle VALUE=DATE format: 20260101
  if (dateStr.length === 8) {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  }

  // Handle datetime format: 20260101T090000Z or 20260101T090000
  if (dateStr.length >= 15) {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  }

  return dateStr;
}

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(ICS_URL, {
      signal: controller.signal,
      headers: {
        'Accept': 'text/calendar',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch ICS: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const icsText = await response.text();
    const events = parseICSManual(icsText);

    return NextResponse.json({
      events,
      fetchedAt: new Date().toISOString(),
      count: events.length,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout — ICS calendar server took too long' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: `Failed to fetch employee leaves: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
