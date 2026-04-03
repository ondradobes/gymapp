import { Link } from 'react-router';
import type { TrainingDay, DayOfWeek } from '../types';

const TRAINING_DAYS: TrainingDay[] = [
  { id: 'monday', name: 'Pondělí', focus: 'Nohy' },
  { id: 'wednesday', name: 'Středa', focus: 'Hruď & Ramena' },
  { id: 'friday', name: 'Pátek', focus: 'Záda, Biceps & Triceps' },
];

function getTodayDayId(): DayOfWeek | null {
  const day = new Date().getDay(); // 0=Sun, 1=Mon, 3=Wed, 5=Fri
  if (day === 1) return 'monday';
  if (day === 3) return 'wednesday';
  if (day === 5) return 'friday';
  return null;
}

export default function Home() {
  const todayId = getTodayDayId();

  return (
    <div className="min-h-svh bg-[#0f0f0f] flex flex-col">
      <header className="px-5 pt-10 pb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">GymLog</h1>
        <p className="text-zinc-400 text-sm mt-1">Vyber dnešní trénink</p>
      </header>

      <main className="flex-1 px-5 pb-10 flex flex-col gap-3">
        {TRAINING_DAYS.map((day) => {
          const isToday = day.id === todayId;
          return (
            <Link
              key={day.id}
              to={`/day/${day.id}`}
              className={`
                block rounded-2xl p-5 border transition-all active:scale-[0.98]
                ${isToday
                  ? 'bg-violet-600 border-violet-500 shadow-lg shadow-violet-900/40'
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${isToday ? 'text-violet-200' : 'text-zinc-500'}`}>
                    {day.name}
                    {isToday && <span className="ml-2 text-violet-200">· Dnes</span>}
                  </p>
                  <p className={`text-xl font-bold ${isToday ? 'text-white' : 'text-zinc-100'}`}>
                    {day.focus}
                  </p>
                </div>
                <svg className={`w-5 h-5 ${isToday ? 'text-violet-200' : 'text-zinc-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          );
        })}

        <Link
          to="/history"
          className="block rounded-2xl p-4 border border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 transition-all active:scale-[0.98] mt-2"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-zinc-300 font-medium">Historie tréninků</span>
          </div>
        </Link>
      </main>
    </div>
  );
}
