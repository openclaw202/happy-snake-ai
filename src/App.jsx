import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trophy, Star, Heart, Cloud, Sun } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];

function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const gameLoopRef = useRef();

  // Assets URLs (Fixed & Locked)
  const BG_IMAGE_URL = "https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&w=1200&q=80";
  const FOOD_IMAGE_URL = "https://cdn-icons-png.flaticon.com/512/590/590685.png";
  const DRAGON_HEAD_URL = "https://cdn-icons-png.flaticon.com/512/19025/19025078.png";
  const DRAGON_BODY_URL = "https://cdn-icons-png.flaticon.com/512/15676/15676704.png";

  const generateFood = useCallback((currentSnake) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isOnSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const getAiDirection = useCallback((head, currentFood, currentSnake) => {
    const diffX = currentFood.x - head.x;
    const diffY = currentFood.y - head.y;
    let nextDir = { x: 0, y: 0 };

    if (diffX !== 0) {
      nextDir = { x: diffX > 0 ? 1 : -1, y: 0 };
    } else if (diffY !== 0) {
      nextDir = { x: 0, y: diffY > 0 ? 1 : -1 };
    }

    const nextHead = { x: head.x + nextDir.x, y: head.y + nextDir.y };
    const willCollide = nextHead.x < 0 || nextHead.x >= GRID_SIZE || 
                        nextHead.y < 0 || nextHead.y >= GRID_SIZE ||
                        currentSnake.some(s => s.x === nextHead.x && s.y === nextHead.y);

    if (willCollide) {
      const options = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
      for (const opt of options) {
        const testHead = { x: head.x + opt.x, y: head.y + opt.y };
        if (testHead.x >= 0 && testHead.x < GRID_SIZE && testHead.y >= 0 && testHead.y < GRID_SIZE &&
            !currentSnake.some(s => s.x === testHead.x && s.y === testHead.y)) {
          return opt;
        }
      }
    }
    return nextDir;
  }, []);

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const aiDir = getAiDirection(head, food, prevSnake);
      const newHead = { x: head.x + aiDir.x, y: head.y + aiDir.y };

      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE ||
          prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setScore(0);
        return INITIAL_SNAKE;
      }

      const newSnake = [newHead, ...prevSnake];
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => {
          const newScore = s + 10;
          if (newScore > highScore) setHighScore(newScore);
          return newScore;
        });
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }
      return newSnake;
    });
  }, [food, generateFood, getAiDirection, highScore]);

  useEffect(() => {
    gameLoopRef.current = setInterval(moveSnake, 120);
    return () => clearInterval(gameLoopRef.current);
  }, [moveSnake]);

  return (
    <div className="min-h-screen bg-[#F0F9FF] flex flex-col items-center justify-center font-sans p-6 relative overflow-hidden">
      {/* Professional Cartoon Background Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30 transition-opacity duration-1000"
        style={{ backgroundImage: `url(${BG_IMAGE_URL})` }}
      />
      
      {/* Animated Cartoon Elements */}
      <Cloud className="absolute top-12 left-10 text-white opacity-60 animate-bounce w-20 h-20 z-1" />
      <Sun className="absolute top-8 right-12 text-yellow-400 w-24 h-24 animate-pulse z-1 drop-shadow-xl" />
      
      <div className="relative z-10 w-full max-w-xl">
        {/* Simple & Clean Header */}
        <div className="flex items-center justify-between mb-8 bg-white/90 p-6 rounded-[3rem] border-[6px] border-white shadow-[0_20px_50px_rgba(186,230,253,0.5)] backdrop-blur-md">
          <div className="flex items-center gap-5">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-[1.5rem] shadow-lg shadow-blue-500/30 ring-4 ring-blue-100">
              <Star className="text-white fill-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-blue-700 tracking-tight leading-none mb-1">Happy Dragon</h1>
              <p className="text-blue-400 font-bold text-xs tracking-widest uppercase">AI Playground</p>
            </div>
          </div>
          
          <div className="bg-blue-50 px-6 py-2 rounded-2xl border-2 border-blue-100 flex flex-col items-center justify-center min-w-[80px]">
            <span className="text-2xl font-black text-blue-600 leading-none">{score}</span>
            <span className="text-[8px] text-blue-300 font-black uppercase tracking-widest mt-1">Score</span>
          </div>
        </div>

        {/* Professional Game Board */}
        <div className="aspect-square w-full bg-white/60 rounded-[5rem] border-[16px] border-white shadow-[0_30px_60px_rgba(186,230,253,0.6)] relative overflow-hidden ring-[15px] ring-blue-50/50 backdrop-blur-sm">
          {/* Subtle Grid */}
          <div className="absolute inset-0 grid grid-cols-20 grid-rows-20 opacity-[0.03] pointer-events-none">
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
              <div key={i} className="border-[1px] border-blue-900" />
            ))}
          </div>

          {/* Dragon Snake Sprites */}
          {snake.map((segment, i) => (
            <div 
              key={i}
              className={`absolute flex items-center justify-center ${i === 0 ? 'z-20' : 'z-10'}`}
              style={{
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
                left: `${(segment.x * 100) / GRID_SIZE}%`,
                top: `${(segment.y * 100) / GRID_SIZE}%`,
                transform: `scale(${i === 0 ? 1.5 : 1.2})`,
                transition: 'all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
            >
               <img 
                 src={i === 0 ? DRAGON_HEAD_URL : DRAGON_BODY_URL} 
                 alt={i === 0 ? "Dragon Head" : "Dragon Body"} 
                 className={`w-full h-full object-contain ${i === 0 ? 'drop-shadow-xl' : 'drop-shadow-sm'}`}
               />
            </div>
          ))}

          {/* Strawberry Food */}
          <div 
            className="absolute flex items-center justify-center z-30"
            style={{
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
              left: `${(food.x * 100) / GRID_SIZE}%`,
              top: `${(food.y * 100) / GRID_SIZE}%`,
            }}
          >
            <img 
              src={FOOD_IMAGE_URL} 
              alt="Strawberry" 
              className="w-[120%] h-[120%] object-contain animate-bounce drop-shadow-xl"
            />
          </div>
        </div>

        {/* Clean Footer Info */}
        <div className="mt-10 flex flex-col items-center gap-6">
           <div className="bg-white px-10 py-4 rounded-full border-4 border-white shadow-xl shadow-blue-200/40 flex items-center gap-4 transition-transform hover:scale-105 cursor-default">
             <Trophy size={24} className="text-yellow-500" />
             <div className="flex flex-col">
               <span className="text-[10px] text-blue-200 font-black uppercase tracking-widest leading-none">Best Session</span>
               <span className="text-xl font-black text-blue-600 leading-tight">{highScore}</span>
             </div>
           </div>
           
           <div className="flex items-center gap-2 text-blue-300 font-bold bg-white/40 px-6 py-2 rounded-full border-2 border-white backdrop-blur-sm">
             <Heart size={14} className="text-rose-400 fill-rose-400" />
             <span className="text-xs uppercase tracking-widest">Built for Abdelrahman</span>
           </div>
        </div>
      </div>
    </div>
  );
}

export default App;