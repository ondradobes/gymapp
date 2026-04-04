import type { DayOfWeek } from '../types';

export interface LibraryExercise {
  id: string;
  name: string;
  englishName: string;
  imageUrl: string | null;
  primaryMuscle: string;
  description: string;
  tips: string[];
}

const LEGS: LibraryExercise[] = [
  {
    id: 'squat',
    name: 'Dřep s činkou',
    englishName: 'Barbell Back Squat',
    imageUrl: '/exercises/squat.png',
    primaryMuscle: 'Kvadricepsy · Hýžďové svaly',
    description:
      'Král cviků pro dolní část těla. Činka leží na horní části trapézů, chodidla na šířku ramen nebo mírně více. Pohyb jde do sedu — kyčle klesají rovnoměrně dolů, kolena sledují směr špiček.',
    tips: [
      'Kolena neklesají dovnitř — tlač je aktivně ven',
      'Záda rovně, hrudník nahoru po celou dobu pohybu',
      'Jdi minimálně do paralely (stehna rovnoběžně s podlahou)',
      'Váha rovnoměrně rozložená na celém chodidle',
    ],
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    englishName: 'Leg Press',
    imageUrl: '/exercises/leg-press.png',
    primaryMuscle: 'Kvadricepsy · Hýžďové svaly',
    description:
      'Izolovaný cvik na nohách bez zátěže na páteři. Chodidla jsou na platformě na šířku ramen. Pohyb spočívá v řízeném spouštění a vytlačení váhy.',
    tips: [
      'Nikdy nezamykej kolena v horní poloze',
      'Záda a hýždě jsou neustále přitisknuty k sedačce',
      'Vyšší postavení chodidel = více hýžďových svalů',
      'Nižší postavení = více kvadricepsů',
    ],
  },
  {
    id: 'romanian-deadlift',
    name: 'Rumunský mrtvý tah',
    englishName: 'Romanian Deadlift',
    imageUrl: '/exercises/romanian-deadlift.png',
    primaryMuscle: 'Zadní stehna · Hýžďové svaly',
    description:
      'Výborný cvik pro zadní řetězec. Činka klouže těsně podél nohou dolů, kyčle jdou dozadu (ne dolů), záda zůstávají rovná. Pocit tahu v zadních stehnech signalizuje správnou techniku.',
    tips: [
      'Pohyb vychází z kyčlí — ne z kolen',
      'Činka se dotkne přibližně úrovně středu lýtek — nepokládej ji na zem',
      'Udržuj neutrální zakřivení páteře po celou dobu',
      'Mírně pokrčená kolena — nezamykej je',
    ],
  },
  {
    id: 'lunge',
    name: 'Výpad',
    englishName: 'Lunge',
    imageUrl: '/exercises/lunge.png',
    primaryMuscle: 'Kvadricepsy · Hýžďové svaly',
    description:
      'Unilaterální cvik, který odstraňuje svalové dysbalance. Krok vpřed, obě kolena se ohnou do 90°. Přední koleno nepřekračuje špičku.',
    tips: [
      'Trup zůstává vzpřímený — nenakláněj se dopředu',
      'Zadní koleno se přibližuje, ale nedotýká se podlahy',
      'Dlouhý krok = více hýžďových svalů',
      'Kratší krok = více kvadricepsů',
    ],
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension',
    englishName: 'Leg extension',
    imageUrl: '/exercises/leg-extension.png',
    primaryMuscle: 'Kvadricepsy',
    description:
      'Izolační cvik výhradně na kvadricepsy. Prováděj pomalým tempem, plně stáhni kvadriceps nahoře a řízeně spouštěj dolů.',
    tips: [
      'Nepomáhej trupem ani hýžděmi — cvik je čistě na koleni',
      'Drž nahoře 1 sekundu pro maximální kontrakci',
      'Používej nižší váhu a soustřeď se na techniku',
    ],
  },
  {
    id: 'leg-curl',
    name: 'Leg Curl',
    englishName: 'Leg curl',
    imageUrl: '/exercises/leg-curl.png',
    primaryMuscle: 'Zadní stehna (hamstringy)',
    description:
      'Izolační cvik pro hamstringy. Prováděj vleže nebo vsedě. Plný rozsah pohybu — od plného natažení po maximální pokrčení.',
    tips: [
      'Neodtrhávej boky od podložky u ležatého provedení',
      'Řízeně spouštěj váhu — negativní fáze je stejně důležitá',
      'Soustřeď se na kontrakci hamstringu, ne jen na pohyb nohy',
    ],
  },
  {
    id: 'calf-raise',
    name: 'Výpony (Calf Raise)',
    englishName: 'Calf raise',
    imageUrl: '/exercises/calf-raise.png',
    primaryMuscle: 'Lýtkové svaly (Gastrocnemius)',
    description:
      'Cvik pro lýtka. Stoj na špičkách s plným rozsahem — od maximálního dorsálního flexi dolů po maximální plantární flexi (výpon) nahoře.',
    tips: [
      'Plný rozsah pohybu je klíčový — nechoď jen napůl',
      'Drž nahoře 1–2 sekundy pro maximální kontrakci',
      'Pomalé tempo v negativní fázi (3–4 sekundy dolů)',
    ],
  },
  {
    id: 'goblet-squat',
    name: 'Goblet Dřep',
    englishName: 'Goblet squat',
    imageUrl: '/exercises/goblet-squat.png',
    primaryMuscle: 'Kvadricepsy · Hýžďové svaly · Core',
    description:
      'Skvělá varianta dřepu s kettlebellem nebo jednoručkou drženou před hrudníkem. Díky přední zátěži přirozeně udržuje trup vzpřímený a je ideální pro nácvik techniky.',
    tips: [
      'Drž závaží těsně u hrudníku po celou dobu',
      'Lokty míří dolů mezi kolena v dolní poloze',
      'Ideální pro rozcvičení nebo výukové účely',
    ],
  },
];

const CHEST_SHOULDERS: LibraryExercise[] = [
  {
    id: 'bench-press',
    name: 'Bench Press',
    englishName: 'Bench press',
    imageUrl: '/exercises/bench-press.png',
    primaryMuscle: 'Prsní svaly · Přední část deltoidů · Tricepsy',
    description:
      'Základní cvik pro prsní svaly. Lehni na lavici, lopatky stažené a stlačené dolů, chodidla pevně na zemi. Činka klesá řízeně na spodní část prsou.',
    tips: [
      'Lopatky stáhni a tlač je do lavice — nestabilní ramena = zranění',
      'Činka klesá na spodní část prsou (ne na krk)',
      'Lokty 45–75° od těla — ne zcela rozpaženě',
      'Celá chodidla na zemi, bez nadměrného oblouku v bederní páteři',
    ],
  },
  {
    id: 'incline-bench-press',
    name: 'Nakloněný Bench Press',
    englishName: 'Incline bench press',
    imageUrl: '/exercises/incline-bench-press.png',
    primaryMuscle: 'Horní část prsních svalů · Přední deltoid',
    description:
      'Varianta bench pressu na nakloněné lavici (30–45°). Cílí primárně na horní část prsního svalu a přední deltoid.',
    tips: [
      'Úhel lavice 30–45° — víc než 45° přenáší zátěž příliš na ramena',
      'Stejná technika jako klasický bench press',
      'Činka klesá na horní část prsou',
    ],
  },
  {
    id: 'dips',
    name: 'Dipy',
    englishName: 'Dip (exercise)',
    imageUrl: '/exercises/dips.png',
    primaryMuscle: 'Dolní část prsních svalů · Tricepsy',
    description:
      'Výborný cvik pro dolní část prsních svalů (při předklonu) nebo tricepsy (při vzpřímení). Těžký, ale velmi efektivní.',
    tips: [
      'Nakloněním trupu dopředu zapojíš více prsních svalů',
      'Vzpřímený trup = více tricepsů',
      'Jdi dolů dokud ramena nejsou pod úrovní loktů',
      'Postupně přidávej závaží pomocí opasku',
    ],
  },
  {
    id: 'overhead-press',
    name: 'Tlak nad hlavou (OHP)',
    englishName: 'Overhead press',
    imageUrl: '/exercises/overhead-press.png',
    primaryMuscle: 'Deltoidní svaly · Tricepsy · Trapézy',
    description:
      'Základní cvik pro ramena. Činka se tlačí přímo nad hlavou ze startovní pozice před tělem u klíční kosti. Celé tělo je aktivní — ne jen ramena.',
    tips: [
      'Napni hýždě a core — zabraňuje nadměrnému oblouku v bedrech',
      'Činka jde nahoru v přímé linii — hlava se mírně ustoupí, pak vrátí',
      'Lokty mírně před tyčí na startu — ne plně pod ní',
      'Plné natažení loktů nahoře',
    ],
  },
  {
    id: 'lateral-raise',
    name: 'Laterální zdvihy',
    englishName: 'Lateral raise',
    imageUrl: '/exercises/lateral-raise.png',
    primaryMuscle: 'Střední část deltoidů',
    description:
      'Izolační cvik pro střední část deltoidového svalu — klíčový pro vizuálně širší ramena. Prováděj s nižší vahou a důrazem na kontrakci.',
    tips: [
      'Mírně pokrčené lokty po celou dobu — nechoď do plna natažení',
      'Pohyb vychází z ramen, ne z trapézů',
      'V horní poloze palec mírně dolů (jako při přelévání plechovky)',
      'Nepomáhej tělem — malé váhy, čistá technika',
    ],
  },
  {
    id: 'front-raise',
    name: 'Přední zdvihy',
    englishName: 'Front raise',
    imageUrl: '/exercises/front-raise.png',
    primaryMuscle: 'Přední část deltoidů',
    description:
      'Izolační cvik pro přední část deltoidů. Prováděj střídavě nebo obouruč, buď s činkami nebo s tyčí.',
    tips: [
      'Pohyb jen do výšky ramen — nepřekračuj horizontální polohu',
      'Kontrolovaný pohyb dolů — neházej závaží',
      'Přední deltoid je obvykle přetrénovaný z bench pressu — přidávej opatrně',
    ],
  },
  {
    id: 'cable-fly',
    name: 'Peck Deck / Motýlek',
    englishName: 'Fly (exercise)',
    imageUrl: '/exercises/cable-fly.png',
    primaryMuscle: 'Prsní svaly (střed)',
    description:
      'Izolační cvik pro prsní svaly, zdůrazňující střední část. Lze provádět na stroji (peck deck) nebo s kladkami pro konstantní napětí.',
    tips: [
      'Lehce pokrčené lokty po celou dobu — pevná poloha, bez dalšího pokrčování',
      'Pohyb jako objetí stromu — oblouk, ne přímá linie',
      'V centrální poloze maximálně stáhni prsní svaly',
    ],
  },
  {
    id: 'arnold-press',
    name: 'Arnold Press',
    englishName: 'Arnold press',
    imageUrl: '/exercises/arnold-press.png',
    primaryMuscle: 'Deltoidní svaly (všechny tři části)',
    description:
      'Varianta tlaku nad hlavou s rotací zápěstí pojmenovaná po Arnoldu Schwarzeneggerovi. Zapojuje všechny tři části deltoidového svalu díky rotačnímu pohybu.',
    tips: [
      'Start: dlaně k tělu (jako na vrcholu bicepsového zdvihu)',
      'Při tlaku nahoru rotuj dlaně ven',
      'Pomalé tempo pro maximum zapojení svalů',
    ],
  },
];

const BACK_ARMS: LibraryExercise[] = [
  {
    id: 'deadlift',
    name: 'Mrtvý tah',
    englishName: 'Deadlift',
    imageUrl: '/exercises/deadlift.png',
    primaryMuscle: 'Celý zadní řetězec · Záda · Hýžďové svaly',
    description:
      'Nejkomplexnější silový cvik. Tyč leží na zemi, úchop těsně za stehny, záda rovná, kyčle dolů, lopatky nad tyčí. Zdvíhej jako bys tlačil zem od sebe.',
    tips: [
      'Záda rovná od startu do konce — zaoblení je nejčastější chyba',
      'Tyč těsně u těla po celou dobu pohybu',
      'Kyčle a ramena jdou nahoru stejnou rychlostí — kyčle nesmí jet nahoru dřív',
      'Napni core před každým opakováním — Valsalvův manévr',
    ],
  },
  {
    id: 'bent-over-row',
    name: 'Veslování s tyčí',
    englishName: 'Bent-over row',
    imageUrl: '/exercises/bent-over-row.png',
    primaryMuscle: 'Střední záda (Rhomboids) · Latissimus · Bicepsy',
    description:
      'Základní cvik pro celá záda. Předklon přibližně 45°, tyč se táhne k spodní části břicha. Lopatky se aktivně stahují k sobě v horní poloze.',
    tips: [
      'Předklon drž pevný — nehoupej trupem pro pomoc',
      'Táhni loketní klouby dozadu a nahoru, ne jen ruce',
      'V horní poloze drž 1 sekundu a maximálně stáhni lopatky',
      'Hlava v neutrální poloze — nedívej se nahoru',
    ],
  },
  {
    id: 'lat-pulldown',
    name: 'Přítahy horní kladky',
    englishName: 'Lat pulldown',
    imageUrl: '/exercises/lat-pulldown.png',
    primaryMuscle: 'Latissimus dorsi · Bicepsy',
    description:
      'Výborný cvik pro latissimus dorsi — záda do tvaru V. Táhni hrazdu k horní části hrudníku, loktky jdou přímo dolů k bokům.',
    tips: [
      'Mírný záklon trupu (asi 10–15°) — ne extrémní',
      'Táhni loketní klouby dolů a k bokům — ne jen ruce k sobě',
      'Nepomáhej trupem — pohyb vychází ze zad',
      'Plné natažení nahoře pro maximální rozsah pohybu',
    ],
  },
  {
    id: 'pull-up',
    name: 'Shyby',
    englishName: 'Pull-up',
    imageUrl: '/exercises/pull-up.png',
    primaryMuscle: 'Latissimus dorsi · Bicepsy · Zadní deltoid',
    description:
      'Jeden z nejlepších cviků pro záda. Nadhmat = více latissimu, podhmat = více bicepsů. Cíl: brada nad hrazdu.',
    tips: [
      'Nezamitkuj — kompletní rozsah pohybu od plného zavěšení',
      'Stáhni lopatky před začátkem pohybu',
      'Lokty táhni k bokům, ne dozadu',
      'Přidej závaží, jakmile zvládneš 3×10 s vlastní vahou',
    ],
  },
  {
    id: 'cable-row',
    name: 'Veslování na kladce',
    englishName: 'Cable row',
    imageUrl: '/exercises/cable-row.png',
    primaryMuscle: 'Střední záda · Rhomboids · Bicepsy',
    description:
      'Vsedě na kladce, táhni rukojeti k břichu. Konstantní napětí po celou dobu pohybu — výhoda oproti volným vahám.',
    tips: [
      'Trup mírně dozadu v horní poloze — pak zpět na start',
      'Lopatky k sobě v horní poloze, drž 1 sekundu',
      'Plné natažení vpřed pro maximální rozsah',
    ],
  },
  {
    id: 'bicep-curl',
    name: 'Bicepsový zdvih',
    englishName: 'Biceps curl',
    imageUrl: '/exercises/bicep-curl.png',
    primaryMuscle: 'Bicepsy',
    description:
      'Izolační cvik pro bicepsy. Lze provádět s tyčí, jednoručkami nebo na kladce. Plný rozsah pohybu je klíčový.',
    tips: [
      'Lokte zůstávají u těla — nepohybují se dopředu/dozadu',
      'V horní poloze maximálně stáhni biceps',
      'Řízeně spouštěj dolů — negativní fáze je stejně důležitá',
      'Nezamykej lokty úplně dole',
    ],
  },
  {
    id: 'hammer-curl',
    name: 'Kladivový zdvih',
    englishName: 'Hammer curl',
    imageUrl: '/exercises/hammer-curl.png',
    primaryMuscle: 'Brachialis · Bicepsy · Předloktí',
    description:
      'Varianta bicepsového zdvihu s neutrálním úchopem (palce nahoru). Více zapojuje brachialis a předloktí, což přispívá k celkovému objemu paže.',
    tips: [
      'Palce míří nahoru — neutrální úchop po celou dobu',
      'Stejná technika jako klasický curl',
      'Lze provádět střídavě nebo obouruč',
    ],
  },
  {
    id: 'tricep-pushdown',
    name: 'Tricepsový pushdown',
    englishName: 'Pushdown (exercise)',
    imageUrl: '/exercises/tricep-pushdown.png',
    primaryMuscle: 'Tricepsy (všechny tři hlavy)',
    description:
      'Nejpopulárnější izolační cvik pro tricepsy. Na kladce s lanem nebo přímou/V-tyčí. Lokte zůstávají pevně u těla.',
    tips: [
      'Lokte pevně u těla — nepohybují se',
      'Plné natažení dole = maximální kontrakce tricepsu',
      'Řízeně zpět nahoru — kontroluj negativní fázi',
      'Lano = větší rozsah pohybu a rotace zápěstí',
    ],
  },
  {
    id: 'skull-crusher',
    name: 'Francouzský tlak (Skull Crusher)',
    englishName: 'Skull crusher',
    imageUrl: '/exercises/skull-crusher.png',
    primaryMuscle: 'Tricepsy (dlouhá hlava)',
    description:
      'Efektivní cvik pro dlouhou hlavu tricepsu. Prováděj na lavici — tyč nebo jednoručky se spouští k čelu nebo za hlavu.',
    tips: [
      'Lokte míří ke stropu — nepohybují se do stran',
      'Pohyb jen v loketním kloubu — ramena se nepohybují',
      'Za hlavou varianta = větší rozsah a zapojení dlouhé hlavy',
    ],
  },
];

export const EXERCISE_LIBRARY: Record<DayOfWeek, LibraryExercise[]> = {
  monday: LEGS,
  wednesday: CHEST_SHOULDERS,
  friday: BACK_ARMS,
};
