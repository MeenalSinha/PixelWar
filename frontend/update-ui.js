const fs = require('fs');

const pageContent = `import React from 'react';

export default function Page() {
  return (
    <div className="flex min-h-screen bg-[#fef9e7] font-['Press_Start_2P',_monospace] text-[10px]">
      
      {/* SIDEBAR */}
      <aside className="fixed h-screen w-64 left-0 border-r-4 border-black bg-[#4caf50] flex flex-col z-50">
        
        {/* LOGO AREA */}
        <div className="bg-[#0a3a40] h-20 border-b-4 border-black flex items-center justify-center p-2 text-center">
          <div className="flex flex-col">
            <h1 className="text-[#facc15] text-[16px] font-black drop-shadow-[2px_2px_0px_#000]">PIXELWAR</h1>
            <p className="text-white text-[8px] mt-1">SOVEREIGN CANVAS</p>
          </div>
        </div>

        {/* SHIELD ICON */}
        <div className="p-4 flex justify-center">
          <div className="w-24 h-24 bg-[#76bfe1] border-4 border-black shadow-[4px_4px_0_0_#000] flex items-center justify-center rounded-full overflow-hidden">
            <span className="material-symbols-outlined text-[48px] text-white drop-shadow-[2px_2px_0_#000]">security</span>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex flex-col gap-2 p-2">
          <a href="#" className="flex items-center gap-4 p-3 bg-[#facc15] text-black border-4 border-black shadow-[4px_4px_0_0_#000]">
            <span className="material-symbols-outlined">home</span>
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-4 p-3 text-black hover:bg-[#3d8c40] hover:text-white transition-colors">
            <span className="material-symbols-outlined">public</span>
            <span>World Map</span>
          </a>
          <a href="#" className="flex items-center gap-4 p-3 text-black hover:bg-[#3d8c40] hover:text-white transition-colors">
            <span className="material-symbols-outlined">assignment</span>
            <span>Missions</span>
          </a>
          <a href="#" className="flex items-center gap-4 p-3 text-black hover:bg-[#3d8c40] hover:text-white transition-colors">
            <span className="material-symbols-outlined">science</span>
            <span>Research</span>
          </a>
          <a href="#" className="flex items-center gap-4 p-3 text-black hover:bg-[#3d8c40] hover:text-white transition-colors">
            <span className="material-symbols-outlined">storefront</span>
            <span>Market</span>
          </a>
          <a href="#" className="flex items-center gap-4 p-3 text-black hover:bg-[#3d8c40] hover:text-white transition-colors relative">
            <span className="material-symbols-outlined">mail</span>
            <span>Messages</span>
            <span className="absolute top-2 left-6 bg-red-500 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-black">3</span>
          </a>
          <a href="#" className="flex items-center gap-4 p-3 text-black hover:bg-[#3d8c40] hover:text-white transition-colors">
            <span className="material-symbols-outlined">event</span>
            <span>Events</span>
          </a>
          <a href="#" className="flex items-center gap-4 p-3 text-black hover:bg-[#3d8c40] hover:text-white transition-colors mt-auto">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </a>
        </nav>
      </aside>

      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        
        {/* TOP NAV */}
        <header className="h-20 bg-[#b8e2f2] border-b-4 border-black flex justify-between items-center px-6 z-40 sticky top-0 shadow-[0_4px_0_0_rgba(0,0,0,0.1)]">
          <nav className="flex gap-8">
            <a href="#" className="flex flex-col items-center gap-1 text-[#0a3a40] opacity-100 border-b-4 border-[#0a3a40] pb-1">
              <span className="material-symbols-outlined">home</span>
              <span className="text-[10px]">HOME</span>
            </a>
            <a href="#" className="flex flex-col items-center gap-1 text-[#0a3a40] opacity-70 hover:opacity-100">
              <span className="material-symbols-outlined">public</span>
              <span className="text-[10px]">MAP</span>
            </a>
            <a href="#" className="flex flex-col items-center gap-1 text-[#0a3a40] opacity-70 hover:opacity-100">
              <span className="material-symbols-outlined">construction</span>
              <span className="text-[10px]">BUILD</span>
            </a>
            <a href="#" className="flex flex-col items-center gap-1 text-[#0a3a40] opacity-70 hover:opacity-100">
              <span className="material-symbols-outlined">fort</span>
              <span className="text-[10px]">EMPIRE</span>
            </a>
            <a href="#" className="flex flex-col items-center gap-1 text-[#0a3a40] opacity-70 hover:opacity-100">
              <span className="material-symbols-outlined">groups</span>
              <span className="text-[10px]">ALLIANCES</span>
            </a>
            <a href="#" className="flex flex-col items-center gap-1 text-[#0a3a40] opacity-70 hover:opacity-100">
              <span className="material-symbols-outlined">emoji_events</span>
              <span className="text-[10px]">RANKINGS</span>
            </a>
            <a href="#" className="flex flex-col items-center gap-1 text-[#0a3a40] opacity-70 hover:opacity-100">
              <span className="material-symbols-outlined">shopping_cart</span>
              <span className="text-[10px]">SHOP</span>
            </a>
          </nav>
          
          <div className="flex items-center gap-3 bg-[#86c5da] border-4 border-black p-2 shadow-[2px_2px_0_0_#000]">
            <div className="w-10 h-10 bg-[#0a3a40] border-2 border-black flex items-center justify-center">
              <span className="material-symbols-outlined text-white">person</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[#0a3a40] text-[10px] font-bold">CommanderX</span>
              <div className="flex gap-2 text-[8px] mt-1">
                <span className="text-[#0a3a40]">Lv. 42</span>
                <span className="text-[#facc15] drop-shadow-[1px_1px_0_#000]">🪙 12.4K</span>
              </div>
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="relative h-[250px] bg-[#76bfe1] flex flex-col items-center justify-center overflow-hidden border-b-4 border-black">
          <p className="text-[#0a3a40] text-[12px] mb-4 font-bold tracking-widest drop-shadow-[1px_1px_0_#fff]">BUILD. DEFEND. CONQUER.</p>
          <h2 className="text-[72px] text-[#facc15] font-black uppercase tracking-tighter drop-shadow-[4px_4px_0_#000] mb-2" style={{ WebkitTextStroke: '4px black' }}>
            PIXELWAR
          </h2>
          <p className="text-[#0a3a40] text-[12px] mb-6 font-bold tracking-widest drop-shadow-[1px_1px_0_#fff]">ONE WORLD. INFINITE LEGENDS.</p>
          <button className="px-8 py-4 bg-[#facc15] text-black text-[14px] font-bold border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-y-1 hover:shadow-none transition-all active:bg-[#eab308]">
            ENTER THE WORLD
          </button>
        </section>

        {/* STATS BAR */}
        <section className="bg-[#0d2b27] border-b-4 border-black">
          <div className="grid grid-cols-5 gap-0 max-w-6xl mx-auto">
            <div className="p-4 flex items-center gap-3 border-r-4 border-[#14533C]">
              <span className="material-symbols-outlined text-[#4ade80] text-[32px]">groups</span>
              <div>
                <p className="text-[#4ade80] text-[8px] uppercase mb-1">LIVE PLAYERS</p>
                <p className="text-white text-[16px]">18,543</p>
              </div>
            </div>
            <div className="p-4 flex items-center gap-3 border-r-4 border-[#14533C]">
              <span className="material-symbols-outlined text-[#4ade80] text-[32px]">public</span>
              <div>
                <p className="text-[#4ade80] text-[8px] uppercase mb-1">PIXELS CLAIMED</p>
                <p className="text-white text-[16px]">6.42B</p>
              </div>
            </div>
            <div className="p-4 flex items-center gap-3 border-r-4 border-[#14533C]">
              <span className="material-symbols-outlined text-[#4ade80] text-[32px]">shield</span>
              <div>
                <p className="text-[#4ade80] text-[8px] uppercase mb-1">ALLIANCES</p>
                <p className="text-white text-[16px]">312</p>
              </div>
            </div>
            <div className="p-4 flex items-center gap-3 border-r-4 border-[#14533C]">
              <span className="material-symbols-outlined text-[#4ade80] text-[32px]">location_city</span>
              <div>
                <p className="text-[#4ade80] text-[8px] uppercase mb-1">CITIES BUILT</p>
                <p className="text-white text-[16px]">24,891</p>
              </div>
            </div>
            <div className="p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#ef4444] text-[32px]">swords</span>
              <div>
                <p className="text-[#ef4444] text-[8px] uppercase mb-1">WARS ACTIVE</p>
                <p className="text-white text-[16px]">47</p>
              </div>
            </div>
          </div>
        </section>

        {/* MAP & RIGHT PANELS */}
        <section className="flex border-b-4 border-black h-[400px]">
          {/* MAP */}
          <div className="flex-1 bg-[#1e4e79] relative overflow-hidden flex items-center justify-center border-r-4 border-black">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <h1 className="text-white opacity-50 text-[48px] relative z-10">MAP PLACEHOLDER</h1>
            
            {/* FLOATING CONTROLS */}
            <div className="absolute left-4 top-4 flex flex-col gap-2 z-20">
              <button className="w-10 h-10 bg-[#0d2b27] border-4 border-[#14533C] text-white flex items-center justify-center shadow-[2px_2px_0_0_#000]">+</button>
              <button className="w-10 h-10 bg-[#0d2b27] border-4 border-[#14533C] text-white flex items-center justify-center shadow-[2px_2px_0_0_#000]">-</button>
              <button className="w-10 h-10 bg-[#0d2b27] border-4 border-[#14533C] text-white flex items-center justify-center shadow-[2px_2px_0_0_#000]">
                <span className="material-symbols-outlined">aspect_ratio</span>
              </button>
              <button className="w-10 h-10 bg-[#0d2b27] border-4 border-[#14533C] text-white flex items-center justify-center shadow-[2px_2px_0_0_#000]">?</button>
            </div>
          </div>

          {/* RIGHT PANELS */}
          <div className="w-80 bg-[#fef9e7] flex flex-col gap-0">
            {/* TOP EMPIRES */}
            <div className="bg-[#0d2b27] border-b-4 border-black flex-1 p-4 flex flex-col">
              <h3 className="text-[#4ade80] text-[10px] mb-4">TOP EMPIRES</h3>
              <ul className="flex flex-col gap-3 text-[8px] text-white flex-1">
                <li className="flex justify-between items-center"><span className="text-[#4ade80]">1</span> <span className="flex-1 ml-2">Emerald Empire</span> <span>68.2M</span></li>
                <li className="flex justify-between items-center"><span className="text-[#facc15]">2</span> <span className="flex-1 ml-2">Crimson Order</span> <span>55.6M</span></li>
                <li className="flex justify-between items-center"><span className="text-[#f97316]">3</span> <span className="flex-1 ml-2">Golden Dynasty</span> <span>48.1M</span></li>
                <li className="flex justify-between items-center"><span className="text-gray-400">4</span> <span className="flex-1 ml-2">Northern Alliance</span> <span>36.7M</span></li>
                <li className="flex justify-between items-center"><span className="text-gray-500">5</span> <span className="flex-1 ml-2">Shadow Rebellion</span> <span>29.3M</span></li>
              </ul>
              <button className="w-full py-2 bg-[#2db87d] text-white border-2 border-black shadow-[2px_2px_0_0_#000] text-[8px] mt-4">VIEW FULL RANKINGS</button>
            </div>
            
            {/* GLOBAL EVENT */}
            <div className="bg-[#2e1045] p-4 flex flex-col">
              <h3 className="text-[#c084fc] text-[10px] mb-3">GLOBAL EVENT</h3>
              <div className="flex gap-2 mb-3">
                <span className="material-symbols-outlined text-[#facc15] text-[24px]">local_fire_department</span>
                <div>
                  <p className="text-[#facc15] text-[10px] mb-1">METEOR SHOWER</p>
                  <p className="text-white text-[8px] leading-relaxed">A meteor shower is falling across the world!</p>
                </div>
              </div>
              <div className="text-center text-[#ef4444] text-[16px] font-bold">
                02:15:47
              </div>
            </div>
          </div>
        </section>

        {/* 4 CARDS */}
        <section className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-[#fef9e7]">
          {/* KINGDOM */}
          <article className="bg-white border-4 border-[#a3d5cc] shadow-[4px_4px_0_0_#000] flex flex-col">
            <header className="bg-[#d8f0ec] p-3 border-b-4 border-[#a3d5cc]">
              <h3 className="text-[#0d2b27] text-[10px] flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">fort</span> YOUR KINGDOM
              </h3>
            </header>
            <div className="p-4 flex-1 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 border-2 border-black"></div>
                <div>
                  <p className="text-[#0d2b27] text-[12px] mb-1">Verdantia</p>
                  <p className="text-gray-600 text-[8px]">Lv. 42</p>
                </div>
              </div>
              <div className="w-full h-4 bg-gray-200 border-2 border-black relative">
                <div className="h-full bg-[#facc15] border-r-2 border-black" style={{ width: '60%' }}></div>
                <span className="absolute inset-0 flex items-center justify-center text-[6px]">12,450 / 20,000 XP</span>
              </div>
              <div className="flex justify-between text-[8px] text-[#0d2b27]">
                <div className="text-center"><p className="mb-1 text-gray-500">Territory</p><p>12.4M px</p></div>
                <div className="text-center"><p className="mb-1 text-gray-500">Population</p><p>8,932</p></div>
                <div className="text-center"><p className="mb-1 text-gray-500">Power</p><p>68.2K</p></div>
              </div>
              <button className="mt-auto w-full py-3 bg-[#2db87d] text-white border-2 border-black shadow-[2px_2px_0_0_#000] text-[8px]">MANAGE KINGDOM</button>
            </div>
          </article>

          {/* RESOURCES */}
          <article className="bg-white border-4 border-[#a3d5cc] shadow-[4px_4px_0_0_#000] flex flex-col">
            <header className="bg-[#d8f0ec] p-3 border-b-4 border-[#a3d5cc]">
              <h3 className="text-[#0d2b27] text-[10px] flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">database</span> RESOURCES
              </h3>
            </header>
            <div className="p-4 flex-1 flex flex-col gap-2 text-[8px]">
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="text-[12px]">🪵</span> Wood</span> <span className="font-bold">12.4K</span> <span className="text-green-500">+320/h</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="text-[12px]">🪨</span> Stone</span> <span className="font-bold">8.7K</span> <span className="text-green-500">+210/h</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="text-[12px]">⛓️</span> Iron</span> <span className="font-bold">6.3K</span> <span className="text-green-500">+180/h</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="text-[12px]">🪙</span> Gold</span> <span className="font-bold">4.8K</span> <span className="text-green-500">+150/h</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="text-[12px]">🥕</span> Food</span> <span className="font-bold">11.2K</span> <span className="text-green-500">+300/h</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="text-[12px]">⚡</span> Energy</span> <span className="font-bold">9.6K</span> <span className="text-green-500">+250/h</span></div>
              <button className="mt-auto w-full py-3 bg-[#2db87d] text-white border-2 border-black shadow-[2px_2px_0_0_#000] text-[8px]">GO TO MARKET</button>
            </div>
          </article>

          {/* RESEARCH */}
          <article className="bg-white border-4 border-[#a3d5cc] shadow-[4px_4px_0_0_#000] flex flex-col">
            <header className="bg-[#d8f0ec] p-3 border-b-4 border-[#a3d5cc]">
              <h3 className="text-[#0d2b27] text-[10px] flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">science</span> CURRENT RESEARCH
              </h3>
            </header>
            <div className="p-4 flex-1 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-300 border-2 border-black"></div>
                <div className="flex-1">
                  <p className="text-[#0d2b27] text-[10px] mb-1">Industrial Age</p>
                  <p className="text-gray-600 text-[8px] mb-2">Lv. 3</p>
                  <div className="w-full h-3 bg-gray-200 border-2 border-black relative">
                    <div className="h-full bg-[#3b82f6] border-r-2 border-black" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-[8px] mb-2">Unlocks:</p>
                <div className="flex gap-2 text-[16px]">⚙️ 🏭 🚂</div>
              </div>
              <div className="text-center text-red-500 text-[8px] mt-2 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[12px]">schedule</span> 01:45:30
              </div>
              <button className="mt-auto w-full py-3 bg-[#2db87d] text-white border-2 border-black shadow-[2px_2px_0_0_#000] text-[8px]">VIEW RESEARCH</button>
            </div>
          </article>

          {/* MISSIONS */}
          <article className="bg-white border-4 border-[#a3d5cc] shadow-[4px_4px_0_0_#000] flex flex-col">
            <header className="bg-[#d8f0ec] p-3 border-b-4 border-[#a3d5cc]">
              <h3 className="text-[#0d2b27] text-[10px] flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">assignment</span> ACTIVE MISSIONS
              </h3>
            </header>
            <div className="p-4 flex-1 flex flex-col gap-4">
              
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[8px]">
                  <span className="flex items-center gap-2"><span className="text-[12px]">⚔️</span> Capture 500 Pixels</span>
                  <span>276 / 500</span>
                </div>
                <div className="w-full h-2 bg-gray-200 border-2 border-black"><div className="h-full bg-[#facc15]" style={{ width: '55%' }}></div></div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[8px]">
                  <span className="flex items-center gap-2"><span className="text-[12px]">🏰</span> Build a Level 10 City</span>
                  <span>0 / 1</span>
                </div>
                <div className="w-full h-2 bg-gray-200 border-2 border-black"><div className="h-full bg-[#facc15]" style={{ width: '0%' }}></div></div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[8px]">
                  <span className="flex items-center gap-2"><span className="text-[12px]">🏆</span> Win 3 Battles</span>
                  <span>2 / 3</span>
                </div>
                <div className="w-full h-2 bg-gray-200 border-2 border-black"><div className="h-full bg-[#facc15]" style={{ width: '66%' }}></div></div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[8px]">
                  <span className="flex items-center gap-2"><span className="text-[12px]">🔬</span> Research Industrial Age</span>
                  <span className="text-green-500">1 / 1</span>
                </div>
                <div className="w-full h-2 bg-gray-200 border-2 border-black"><div className="h-full bg-green-500" style={{ width: '100%' }}></div></div>
              </div>

              <button className="mt-auto w-full py-3 bg-[#2db87d] text-white border-2 border-black shadow-[2px_2px_0_0_#000] text-[8px]">VIEW ALL MISSIONS</button>
            </div>
          </article>
        </section>

        {/* WORLD NEWS FEED */}
        <section className="px-6 pb-6">
          <div className="bg-[#e2eff4] border-4 border-black shadow-[4px_4px_0_0_#000]">
            <header className="bg-[#0d2b27] p-3 border-b-4 border-black flex justify-between items-center">
              <h3 className="text-[#facc15] text-[10px]">WORLD NEWS FEED</h3>
              <div className="flex gap-2">
                <span className="w-2 h-2 bg-[#facc15]"></span>
                <span className="w-2 h-2 bg-[#facc15]"></span>
              </div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x-4 divide-black">
              <div className="p-4 flex gap-3 items-start">
                <div className="w-10 h-10 bg-green-500 border-2 border-black"></div>
                <div className="flex-1">
                  <p className="text-[8px] leading-relaxed"><span className="font-bold text-[#0d2b27]">Emerald Empire</span> captured a mega city!</p>
                  <p className="text-[6px] text-gray-500 mt-2">5m ago</p>
                </div>
              </div>
              <div className="p-4 flex gap-3 items-start">
                <div className="w-10 h-10 bg-red-500 border-2 border-black"></div>
                <div className="flex-1">
                  <p className="text-[8px] leading-relaxed"><span className="font-bold text-[#0d2b27]">Crimson Order</span> declared war on <span className="font-bold text-[#0d2b27]">Northern Alliance</span></p>
                  <p className="text-[6px] text-gray-500 mt-2">12m ago</p>
                </div>
              </div>
              <div className="p-4 flex gap-3 items-start">
                <div className="w-10 h-10 bg-purple-500 border-2 border-black"></div>
                <div className="flex-1">
                  <p className="text-[8px] leading-relaxed"><span className="font-bold text-[#0d2b27]">Shadow Rebellion</span> formed an alliance with <span className="font-bold text-[#0d2b27]">Sea Titans</span></p>
                  <p className="text-[6px] text-gray-500 mt-2">18m ago</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 bg-blue-500 border-2 border-black"></div>
                  <div>
                    <p className="text-[8px] leading-relaxed"><span className="font-bold text-[#0d2b27]">The Great Market</span> prices have changed!</p>
                    <p className="text-[6px] text-gray-500 mt-2">25m ago</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-[#2db87d] text-white border-2 border-black shadow-[2px_2px_0_0_#000] text-[8px]">VIEW ALL NEWS</button>
              </div>
            </div>
          </div>
        </section>

        {/* CREATE YOUR LEGACY */}
        <section className="bg-[#8cbfe6] border-y-4 border-black py-16 text-center relative overflow-hidden">
          {/* Decorative grass at bottom */}
          <div className="absolute bottom-0 w-full h-8 bg-[#4caf50] border-t-4 border-black border-dashed"></div>
          
          <h2 className="text-white text-[32px] drop-shadow-[4px_4px_0_#000] mb-4 relative z-10" style={{ WebkitTextStroke: '2px black' }}>CREATE YOUR LEGACY</h2>
          <p className="text-[#0d2b27] text-[12px] font-bold tracking-widest drop-shadow-[1px_1px_0_#fff] mb-8 relative z-10">BUILD YOUR EMPIRE, FIGHT FOR GLORY,<br/>AND WRITE YOUR NAME IN HISTORY!</p>
          <button className="px-10 py-4 bg-[#facc15] text-black text-[14px] font-bold border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-y-1 hover:shadow-none transition-all active:bg-[#eab308] relative z-10">
            PLAY NOW
          </button>

          {/* Placeholder for left Knight and right Archer */}
          <div className="absolute bottom-8 left-20 w-32 h-40 bg-gray-400 border-4 border-black z-0 flex items-center justify-center text-[10px] text-white">KNIGHT</div>
          <div className="absolute bottom-8 right-20 w-32 h-40 bg-gray-400 border-4 border-black z-0 flex items-center justify-center text-[10px] text-white">ARCHER</div>
        </section>

        {/* WHY PLAY */}
        <section className="py-16 px-6 max-w-5xl mx-auto w-full">
          <h2 className="text-center text-[#0d2b27] text-[16px] mb-12">WHY PLAY PIXELWAR?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4 items-start">
              <span className="material-symbols-outlined text-[48px] text-[#3b82f6]">public</span>
              <div>
                <h4 className="text-[#0d2b27] text-[10px] mb-2">MASSIVE PERSISTENT WORLD</h4>
                <p className="text-gray-600 text-[8px] leading-loose">A world that never resets. Your actions shape history forever.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="material-symbols-outlined text-[48px] text-[#facc15]">swords</span>
              <div>
                <h4 className="text-[#0d2b27] text-[10px] mb-2">REAL-TIME BATTLES</h4>
                <p className="text-gray-600 text-[8px] leading-loose">Every move, every attack, every pixel happens in real time.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="material-symbols-outlined text-[48px] text-green-600">location_city</span>
              <div>
                <h4 className="text-[#0d2b27] text-[10px] mb-2">BUILD & INNOVATE</h4>
                <p className="text-gray-600 text-[8px] leading-loose">From small villages to mighty civilizations. You decide.</p>
              </div>
            </div>
          </div>
        </section>

        {/* JOIN THE BATTLE */}
        <section className="bg-[#4472c4] border-y-4 border-black py-16 text-center text-white relative">
          <h2 className="text-[32px] drop-shadow-[4px_4px_0_#000] mb-4">JOIN THE BATTLE!</h2>
          <p className="text-[10px] mb-8">BE PART OF THE BIGGEST PIXEL STRATEGY GAME EVER.</p>
          <div className="flex justify-center gap-4 max-w-xl mx-auto">
            <input type="email" placeholder="Enter your email" className="flex-1 p-4 border-4 border-black text-black text-[10px] focus:outline-none focus:ring-4 focus:ring-[#facc15]" />
            <button className="px-8 py-4 bg-[#facc15] text-black text-[12px] font-bold border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-y-1 hover:shadow-none transition-all">PRE-REGISTER</button>
          </div>
          <p className="text-[8px] mt-6 opacity-80">Be the first to know when the world opens.</p>
        </section>

        {/* FOOTER */}
        <footer className="bg-[#f3c42e] p-10 flex justify-between items-start text-[#0d2b27]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 border-2 border-black flex items-center justify-center">
              <span className="material-symbols-outlined text-white">security</span>
            </div>
            <div>
              <h2 className="text-[16px] font-black drop-shadow-[2px_2px_0_#fff]">PIXELWAR</h2>
              <p className="text-[6px] mt-1">SOVEREIGN CANVAS</p>
            </div>
          </div>
          
          <div className="flex gap-16 text-[8px]">
            <div className="flex flex-col gap-3">
              <h4 className="font-bold mb-1">GAME</h4>
              <a href="#" className="hover:underline">How to Play</a>
              <a href="#" className="hover:underline">Guides</a>
              <a href="#" className="hover:underline">FAQ</a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="font-bold mb-1">COMMUNITY</h4>
              <a href="#" className="hover:underline">Discord</a>
              <a href="#" className="hover:underline">Forum</a>
              <a href="#" className="hover:underline">News</a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="font-bold mb-1">COMPANY</h4>
              <a href="#" className="hover:underline">About Us</a>
              <a href="#" className="hover:underline">Careers</a>
              <a href="#" className="hover:underline">Contact</a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="font-bold mb-1">LEGAL</h4>
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms of Service</a>
            </div>
          </div>
        </footer>
        <div className="bg-[#f3c42e] text-center text-[#0d2b27] text-[6px] pb-4">
          © 2024 PixelWar. All rights reserved.
        </div>
      </main>
    </div>
  );
}
`;

fs.writeFileSync('app/page.tsx', pageContent);
console.log('Done writing page.tsx');
