/**
 * Returns the next upcoming Philippine cultural holiday / OFW-relevant event
 * relative to today's date. Used for the Dashboard banner.
 */

const HOLIDAYS = [
  // Format: month (0-indexed), day, emoji, en label, taglish label, daysWindow (show up to N days before)
  { month: 0, day: 1,  emoji: "🎆", en: "New Year's Day",         tl: "Bagong Taon",            window: 3 },
  { month: 1, day: 14, emoji: "💕", en: "Valentine's Day",        tl: "Araw ng mga Puso",       window: 5 },
  { month: 2, day: 8,  emoji: "👩", en: "International Women's Day",tl: "Araw ng Kababaihan",    window: 3 },
  { month: 3, day: 9,  emoji: "🕊️", en: "Araw ng Kagitingan",     tl: "Araw ng Kagitingan",     window: 5 },
  { month: 4, day: 1,  emoji: "⚒️", en: "Labor Day",              tl: "Araw ng mga Manggagawa", window: 5 },
  { month: 4, day: 12, emoji: "🇵🇭", en: "Independence Day",       tl: "Araw ng Kalayaan",       window: 7 },
  { month: 5, day: 12, emoji: "🇵🇭", en: "Independence Day",       tl: "Araw ng Kalayaan",       window: 7 },
  { month: 6, day: 4,  emoji: "🦅", en: "Philippine-American Friendship Day", tl: "Araw ng Pagkakaibigan", window: 3 },
  { month: 7, day: 21, emoji: "🌻", en: "Ninoy Aquino Day",        tl: "Araw ni Ninoy",          window: 3 },
  { month: 8, day: 1,  emoji: "👨‍👩‍👧", en: "Buwan ng Wika",          tl: "Buwan ng Wika",          window: 7 },
  { month: 9, day: 31, emoji: "🎃", en: "Halloween",               tl: "Halloween",              window: 5 },
  { month: 10, day: 1, emoji: "🙏", en: "All Saints' Day",         tl: "Undás",                  window: 5 },
  { month: 10, day: 2, emoji: "🕯️", en: "All Souls' Day",          tl: "Araw ng mga Patay",      window: 3 },
  { month: 10, day: 30,emoji: "🦸", en: "Bonifacio Day",           tl: "Araw ni Bonifacio",      window: 3 },
  { month: 11, day: 25,emoji: "🎄", en: "Christmas Day",           tl: "Pasko",                  window: 14 },
  { month: 11, day: 31,emoji: "🎆", en: "New Year's Eve",          tl: "Bisperas ng Bagong Taon",window: 5 },
  // Easter (approximate — Palm Sunday / Holy Week area, mid-April)
  { month: 3, day: 13, emoji: "🙏", en: "Semana Santa",            tl: "Mahal na Araw",          window: 10 },
  // OFW-specific
  { month: 11, day: 18,emoji: "🛫", en: "OFW Homecoming Season",   tl: "Uwian ng OFW",           window: 20 },
  { month: 4, day: 5,  emoji: "🌸", en: "Mother's Day",            tl: "Araw ng mga Ina",        window: 7 },
  { month: 5, day: 16, emoji: "👨", en: "Father's Day",            tl: "Araw ng mga Ama",        window: 7 },
];

export function getUpcomingHoliday() {
  const now = new Date();
  const today = { month: now.getMonth(), day: now.getDate() };
  const todayNum = now.getMonth() * 100 + now.getDate();

  // Sort by closeness to today
  const upcoming = HOLIDAYS
    .map(h => {
      const hNum = h.month * 100 + h.day;
      let diff = hNum - todayNum;
      // Wrap to next year if already past
      if (diff < 0) diff += 12 * 100;
      return { ...h, diff };
    })
    .filter(h => h.diff <= h.window * 3 && h.diff >= 0)
    .sort((a, b) => a.diff - b.diff);

  return upcoming[0] || null;
}