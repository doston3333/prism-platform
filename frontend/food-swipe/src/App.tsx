import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AnimatePresence,
  PanInfo,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import {
  ChevronDown,
  Heart,
  History,
  MapPin,
  Star,
  X,
} from 'lucide-react';

const FOOD_DATA = [
  {
    id: '1',
    title: 'Smash Burger Deluxe',
    price: 9.9,
    location: 'Downtown — 1.2 km',
    rating: 4.7,
    ratingsCount: 382,
    img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1600&auto=format&fit=crop',
    ingredients: ['Beef patty', 'Cheddar', 'Brioche bun', 'House sauce', 'Pickles'],
  },
  {
    id: '2',
    title: 'Spicy Ramen Tonkotsu',
    price: 12.5,
    location: 'Nihon St — 2.8 km',
    rating: 4.6,
    ratingsCount: 241,
    img: 'https://images.unsplash.com/photo-1604908812771-8f57e16278b0?q=80&w=1600&auto=format&fit=crop',
    ingredients: ['Pork broth', 'Chashu', 'Ajitama egg', 'Nori', 'Chili oil'],
  },
  {
    id: '3',
    title: 'Vegan Buddha Bowl',
    price: 8.4,
    location: 'Green Ave — 0.9 km',
    rating: 4.5,
    ratingsCount: 129,
    img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1600&auto=format&fit=crop',
    ingredients: ['Quinoa', 'Roasted chickpeas', 'Avocado', 'Tahini', 'Veg mix'],
  },
  {
    id: '4',
    title: 'Margherita Pizza',
    price: 10.0,
    location: 'Roma Sq — 3.4 km',
    rating: 4.8,
    ratingsCount: 764,
    img: 'https://images.unsplash.com/photo-1548365328-9f547fb0951d?q=80&w=1600&auto=format&fit=crop',
    ingredients: ['San Marzano', 'Mozzarella', 'Basil', 'Olive oil', 'Sea salt'],
  },
  {
    id: '5',
    title: 'Chicken Shawarma Wrap',
    price: 6.9,
    location: 'Bazaar Rd — 1.7 km',
    rating: 4.4,
    ratingsCount: 203,
    img: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67b2?q=80&w=1600&auto=format&fit=crop',
    ingredients: ['Marinated chicken', 'Garlic sauce', 'Pickles', 'Tomato', 'Pita'],
  },
] as const;

type Food = (typeof FOOD_DATA)[number];
type SwipeAction = 'like' | 'nope';

interface HistoryEntry {
  id: string;
  title: string;
  action: SwipeAction;
}

const SWIPE_THRESHOLD = 140;

const actionLabel: Record<SwipeAction, string> = {
  like: 'Liked',
  nope: 'Skipped',
};

function App() {
  const [deck, setDeck] = useState<Food[]>(() => [...FOOD_DATA]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [activeDirection, setActiveDirection] = useState<SwipeAction | null>(null);

  const topCard = deck[0];
  const nextCards = useMemo(() => deck.slice(1, 3), [deck]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacity = useMotionValue(1);
  const rotate = useTransform(x, [-240, 0, 240], [-12, 0, 12]);
  const likeOpacity = useTransform(x, [80, 180], [0, 1]);
  const nopeOpacity = useTransform(x, [-180, -80], [1, 0]);

  const resetMotionValues = useCallback(() => {
    animate(x, 0, { type: 'spring', stiffness: 260, damping: 22 });
    animate(y, 0, { duration: 0.25, ease: 'easeOut' });
    animate(opacity, 1, { duration: 0.2 });
  }, [opacity, x, y]);

  const moveCardToEnd = useCallback((card: Food) => {
    setDeck((prev) => {
      const index = prev.findIndex((item) => item.id === card.id);
      if (index === -1) {
        return prev;
      }
      const updated = [...prev];
      const [current] = updated.splice(index, 1);
      updated.push(current);
      return updated;
    });
  }, []);

  const pushHistory = useCallback((card: Food, action: SwipeAction) => {
    setHistory((prev) => {
      const entry = { id: card.id, title: card.title, action };
      const next = [entry, ...prev];
      return next.slice(0, 10);
    });
  }, []);

  const completeSwipe = useCallback(
    (direction: SwipeAction, card: Food) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setActiveDirection(direction);

      const animations = [
        animate(x, direction === 'like' ? 520 : -520, {
          type: 'spring',
          stiffness: 240,
          damping: 22,
        }),
        animate(y, 30, { duration: 0.35, ease: 'easeOut' }),
        animate(opacity, 0, { duration: 0.3, ease: 'easeOut' }),
      ];

      Promise.all(animations.map((ctrl) => ctrl.finished)).then(() => {
        moveCardToEnd(card);
        pushHistory(card, direction);
        setExpanded(false);
        x.set(0);
        y.set(0);
        opacity.set(1);
        setIsAnimating(false);
        setActiveDirection(null);
      });
    },
    [isAnimating, moveCardToEnd, opacity, pushHistory, x, y]
  );

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!topCard) return;
      if (info.offset.x >= SWIPE_THRESHOLD) {
        completeSwipe('like', topCard);
        return;
      }
      if (info.offset.x <= -SWIPE_THRESHOLD) {
        completeSwipe('nope', topCard);
        return;
      }
      resetMotionValues();
    },
    [completeSwipe, resetMotionValues, topCard]
  );

  const handleButtonSwipe = useCallback(
    (direction: SwipeAction) => {
      if (!topCard || isAnimating) return;
      completeSwipe(direction, topCard);
    },
    [completeSwipe, isAnimating, topCard]
  );

  useEffect(() => {
    const unsubscribe = x.on('change', (latest) => {
      if (isAnimating) return;
      if (latest > 40) {
        setActiveDirection('like');
      } else if (latest < -40) {
        setActiveDirection('nope');
      } else {
        setActiveDirection(null);
      }
    });
    return () => unsubscribe();
  }, [isAnimating, x]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (!topCard || isAnimating) return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        completeSwipe('like', topCard);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        completeSwipe('nope', topCard);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [completeSwipe, isAnimating, topCard]);

  useEffect(() => {
    setExpanded(false);
  }, [topCard?.id]);

  const handleToggleIngredients = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handleOrder = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    window.alert('Payment page is not deployed yet. This is a placeholder.');
  }, []);

  return (
    <div className="min-h-screen pb-16 text-primary-dark">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 pt-6 sm:pt-10">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-dark/70">
            Swipe &amp; savor
          </p>
          <h1 className="mt-2 text-4xl font-extrabold text-primary-dark drop-shadow-sm sm:text-5xl">
            Food Swipe Demo
          </h1>
          <p className="mt-3 max-w-xl text-sm text-primary-dark/80">
            Swipe right to keep it, swipe left to skip it. A playful preview deck for your next food
            ordering flow.
          </p>
        </div>

        <div className="relative w-full max-w-xl">
          {nextCards.map((card, index) => (
            <div
              key={card.id}
              className="absolute inset-0 flex justify-center"
              style={{
                transform: `translateY(${(index + 1) * 18}px) scale(${1 - (index + 1) * 0.04})`,
                opacity: 1 - (index + 1) * 0.25,
              }}
            >
              <div className="h-full w-full rounded-[32px] bg-white/30 ring-2 ring-white/50" aria-hidden />
            </div>
          ))}

          <AnimatePresence initial={false}>
            {topCard && (
              <motion.div
                key={topCard.id}
                className="relative overflow-hidden rounded-[36px] bg-white shadow-card ring-4 ring-primary/60"
                style={{ x, y, rotate, opacity }}
                drag={isAnimating ? false : 'x'}
                dragElastic={0.2}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                initial={{ scale: 0.98, y: 10, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              >
                <div className="relative h-[62%] select-none">
                  <img
                    src={topCard.img}
                    alt={topCard.title}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                  <span className="absolute left-6 top-6 inline-flex items-center rounded-full bg-primary px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-dark shadow">
                    Chef&apos;s pick
                  </span>

                  <motion.div
                    className="absolute left-6 top-10 rounded-lg border-4 border-emerald-500 px-6 py-2 text-2xl font-black uppercase tracking-[0.35em] text-emerald-600 shadow-xl"
                    style={{ opacity: likeOpacity, rotate: '-12deg' }}
                  >
                    Like
                  </motion.div>
                  <motion.div
                    className="absolute right-6 top-10 rounded-lg border-4 border-rose-500 px-6 py-2 text-2xl font-black uppercase tracking-[0.35em] text-rose-500 shadow-xl"
                    style={{ opacity: nopeOpacity, rotate: '12deg' }}
                  >
                    Nope
                  </motion.div>
                </div>

                <div className="space-y-4 bg-gradient-to-t from-yellow-300 via-yellow-200 to-yellow-100 p-6 text-primary-dark">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-primary-dark">
                      {topCard.title}
                    </h2>
                    <p className="mt-1 text-sm text-primary-dark/70">Your next bite awaits.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-primary-dark">
                    <span className="rounded-full bg-white/70 px-3 py-1 text-base font-bold text-primary-dark">
                      ${topCard.price.toFixed(2)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/60 px-3 py-1 text-primary-dark">
                      <MapPin className="h-4 w-4 text-primary-dark/80" aria-hidden />
                      {topCard.location}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/60 px-3 py-1 text-primary-dark">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-500" aria-hidden />
                      {topCard.rating.toFixed(1)}
                      <span className="ml-1 text-xs font-normal text-primary-dark/60">
                        ({topCard.ratingsCount})
                      </span>
                    </span>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleToggleIngredients}
                      className="flex items-center gap-2 text-sm font-semibold text-primary-dark transition hover:text-primary-dark/70"
                    >
                      Ingredients
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                        aria-hidden
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.ul
                          key="ingredients"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="mt-3 grid grid-cols-1 gap-2 text-sm text-primary-dark/80 sm:grid-cols-2"
                        >
                          {topCard.ingredients.map((item) => (
                            <li key={item} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary-dark/50" aria-hidden />
                              {item}
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    type="button"
                    onClick={handleOrder}
                    className="w-full rounded-full bg-primary-dark px-6 py-3 text-base font-semibold text-primary-light shadow-lg shadow-primary-dark/20 transition hover:bg-black focus:outline-none focus:ring-4 focus:ring-primary/60"
                  >
                    Order for ${topCard.price.toFixed(2)}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            aria-label="Skip"
            onClick={() => handleButtonSwipe('nope')}
            className={`flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/70 bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-xl transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-rose-300 ${
              activeDirection === 'nope' ? 'scale-105 shadow-2xl' : ''
            }`}
            disabled={isAnimating}
          >
            <X className="h-8 w-8" />
          </button>
          <button
            type="button"
            aria-label="Like"
            onClick={() => handleButtonSwipe('like')}
            className={`flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/70 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-emerald-300 ${
              activeDirection === 'like' ? 'scale-105 shadow-2xl' : ''
            }`}
            disabled={isAnimating}
          >
            <Heart className="h-8 w-8 fill-white" />
          </button>
        </div>

        {history.length > 0 && (
          <div className="w-full max-w-xl">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary-dark/70">
              <History className="h-4 w-4" aria-hidden />
              Recent swipes
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((entry, index) => (
                <span
                  key={`${entry.id}-${index}`}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                    entry.action === 'like'
                      ? 'bg-emerald-500/20 text-emerald-700'
                      : 'bg-rose-500/20 text-rose-700'
                  }`}
                >
                  {entry.action === 'like' ? (
                    <Heart className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" aria-hidden />
                  ) : (
                    <X className="h-3.5 w-3.5 text-rose-600" aria-hidden />
                  )}
                  {actionLabel[entry.action]} — {entry.title}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
