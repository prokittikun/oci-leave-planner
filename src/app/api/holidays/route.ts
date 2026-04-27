import { NextResponse } from 'next/server';
import Holidays from 'date-holidays';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

    if (isNaN(year) || year < 2000 || year > 2100) {
      return NextResponse.json(
        { error: 'Invalid year parameter' },
        { status: 400 }
      );
    }

    const hd = new Holidays('TH');
    const holidays = hd.getHolidays(year);

    const formatted = holidays
      .filter((h) => h.type === 'public')
      .map((h) => ({
        date: h.date.split(' ')[0], // Get just the date part (YYYY-MM-DD)
        name: h.name,
        type: h.type,
      }));

    return NextResponse.json({
      year,
      holidays: formatted,
      count: formatted.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch holidays: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
