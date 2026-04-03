import { Link } from 'react-router';
import type { TrainingDay, DayOfWeek } from '../types';

const QUOTES = [
  { text: 'Bolest je dočasná. Vzdát se je navždy.', author: 'Lance Armstrong' },
  { text: 'Tvoje tělo zvládne skoro cokoliv. Musíš přesvědčit svou mysl.', author: null },
  { text: 'Nesrovnávej se s ostatními. Srovnávej se s tím, kým jsi byl včera.', author: null },
  { text: 'Pokrok, ne dokonalost.', author: null },
  { text: 'Pokud to nedáš dnes, zítra to bude těžší.', author: null },
  { text: 'Úspěch není dán talentem. Je dán tréninkem, každý den.', author: null },
  { text: 'Nejlepší trénink je ten, který jsi skutečně odcvičil.', author: null },
  { text: 'Každý rep tě posouvá o krok dál.', author: null },
  { text: 'Silná mysl buduje silné tělo.', author: null },
  { text: 'Dnes je den, který ti tvé budoucí já poděkuje.', author: null },
  { text: 'Jediný špatný trénink je ten, který jsi vynechal.', author: null },
  { text: 'Limity jsou jen v hlavě.', author: null },
  { text: 'Výsledky přicházejí k těm, kteří to nevzdají.', author: null },
  { text: 'Buď silnější než svá výmluva.', author: null },
  { text: 'Každý velký výkon začal rozhodnutím zkusit to.', author: null },
  { text: 'Disciplína poráží motivaci každý den.', author: null },
  { text: 'Tvrdá práce bije talent, když talent nepracuje tvrdě.', author: 'Tim Notke' },
  { text: 'Jdi dál, dokud to nebude hotové.', author: null },
  { text: 'Záleží na tom, co děláš, když tě to nebaví.', author: null },
  { text: 'Neexistuje zkratka na místo, kam stojí za to jít.', author: null },
  { text: 'Váha na čince nelže.', author: null },
  { text: 'Malý pokrok je stále pokrok.', author: null },
  { text: 'Trénuj, jako by závisely na tom tvoje výsledky. Závisejí.', author: null },
  { text: 'Každý den je šance stát se lepším.', author: null },
  { text: 'Čím víc potu v tréninku, tím méně krve v boji.', author: 'Patton' },
  { text: 'Tvoje omezení jsou jen ve tvé mysli.', author: null },
  { text: 'Síla neroste v komfortní zóně.', author: null },
  { text: 'Nevzdávej se. Začátek je vždy nejtěžší.', author: null },
  { text: 'Úsilí, které vkládáš dnes, je investice do zítřka.', author: null },
  { text: 'Nemusíš být nejlepší. Stačí být lepší než včera.', author: null },
];

function getDailyQuote() {
  const now = new Date();
  // Day-of-year index → stejný citát celý den, jiný každý den
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return QUOTES[dayOfYear % QUOTES.length];
}

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
  const quote = getDailyQuote();

  return (
    <div className="min-h-svh bg-[#0f0f0f] flex flex-col">
      <header className="px-5 pt-10 pb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">GymLog</h1>
        <p className="text-zinc-400 text-sm mt-1">Vyber dnešní trénink</p>
      </header>

      {/* Denní citát */}
      <div className="mx-5 mb-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 px-5 py-4">
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Citát dne</p>
        <p className="text-zinc-200 text-sm leading-relaxed font-medium">„{quote.text}"</p>
        {quote.author && (
          <p className="text-zinc-500 text-xs mt-1.5">— {quote.author}</p>
        )}
      </div>

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
