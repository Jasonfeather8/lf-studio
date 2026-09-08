import React from 'react';
import { Palette, Type, MousePointerClick, LayoutGrid, HeartPulse, ChevronRight, PlayCircle, Timer, Calendar } from 'lucide-react';

export default function StyleGuide() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="border-b border-surface-container dark:border-neutral-800 pb-5">
        <h1 className="text-3xl font-bold text-on-surface dark:text-white tracking-tight">
          Design System Overview
        </h1>
        <p className="text-base text-on-surface-variant dark:text-neutral-400 mt-1 max-w-2xl">
          A comprehensive guide to the LF Studio visual language. Professional, Restorative, and Tech-Forward.
        </p>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Brand & Colors */}
        <section className="md:col-span-8 bg-surface-container-lowest dark:bg-neutral-900 p-6 rounded-2xl shadow-xs border border-surface-container dark:border-neutral-800">
          <div className="flex items-center gap-2 mb-4 border-b border-surface-container dark:border-neutral-800 pb-2">
            <Palette className="text-primary w-5 h-5" />
            <h2 className="text-lg font-bold">1. Brand & Colors</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-on-surface-variant dark:text-neutral-400 mb-3">
                Primary Palette (Healing Teals & Greens)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="h-20 rounded-xl bg-primary flex items-end p-2.5 shadow-xs">
                    <span className="text-white text-[10px] font-bold bg-black/30 px-1.5 py-0.5 rounded">Primary</span>
                  </div>
                  <span className="text-xs text-on-surface-variant dark:text-neutral-400 font-mono text-center">#005146</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="h-20 rounded-xl bg-primary-container flex items-end p-2.5 shadow-xs">
                    <span className="text-white text-[10px] font-bold bg-black/30 px-1.5 py-0.5 rounded">Container</span>
                  </div>
                  <span className="text-xs text-on-surface-variant dark:text-neutral-400 font-mono text-center">#006b5d</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="h-20 rounded-xl bg-secondary flex items-end p-2.5 shadow-xs">
                    <span className="text-white text-[10px] font-bold bg-black/30 px-1.5 py-0.5 rounded">Secondary</span>
                  </div>
                  <span className="text-xs text-on-surface-variant dark:text-neutral-400 font-mono text-center">#4c6629</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="h-20 rounded-xl bg-secondary-container flex items-end p-2.5 shadow-xs">
                    <span className="text-on-secondary-container text-[10px] font-bold bg-white/50 px-1.5 py-0.5 rounded">Sec. Container</span>
                  </div>
                  <span className="text-xs text-on-surface-variant dark:text-neutral-400 font-mono text-center">#cdeda1</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-on-surface-variant dark:text-neutral-400 mb-3">
                Tonal Surfaces
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <div className="h-14 rounded-xl bg-background dark:bg-neutral-950 border border-surface-container dark:border-neutral-800 flex flex-col justify-end p-2">
                  <span className="text-[9px] font-bold">Background</span>
                </div>
                <div className="h-14 rounded-xl bg-surface border border-surface-container dark:border-neutral-800 flex flex-col justify-end p-2">
                  <span className="text-[9px] font-bold">Surface</span>
                </div>
                <div className="h-14 rounded-xl bg-surface-container-low dark:bg-neutral-900 border border-surface-container dark:border-neutral-800 flex flex-col justify-end p-2">
                  <span className="text-[9px] font-bold">Low</span>
                </div>
                <div className="h-14 rounded-xl bg-surface-container dark:bg-neutral-800 border border-surface-container dark:border-neutral-800 flex flex-col justify-end p-2">
                  <span className="text-[9px] font-bold">Container</span>
                </div>
                <div className="h-14 rounded-xl bg-surface-container-high dark:bg-neutral-700 border border-surface-container dark:border-neutral-800 flex flex-col justify-end p-2">
                  <span className="text-[9px] font-bold">High</span>
                </div>
                <div className="h-14 rounded-xl bg-surface-container-lowest dark:bg-neutral-600 border border-surface-container dark:border-neutral-800 flex flex-col justify-end p-2">
                  <span className="text-[9px] font-bold text-black dark:text-white">Lowest</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-on-surface-variant dark:text-neutral-400 mb-3">
                Brand Gradients
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="h-16 rounded-xl bg-gradient-to-r from-secondary-container to-primary flex items-center justify-center shadow-xs">
                  <span className="text-white font-bold text-sm">Primary Action Gradient</span>
                </div>
                <div className="h-16 rounded-xl bg-gradient-to-r from-[#59c3b0] to-primary flex items-center justify-center shadow-xs">
                  <span className="text-white font-bold text-sm">Wellness Restorative</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="md:col-span-4 bg-surface-container-lowest dark:bg-neutral-900 p-6 rounded-2xl shadow-xs border border-surface-container dark:border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-surface-container dark:border-neutral-800 pb-2">
              <Type className="text-primary w-5 h-5" />
              <h2 className="text-lg font-bold">2. Typography</h2>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[9px] text-outline uppercase font-bold tracking-wider block mb-0.5">Headline LG (700)</span>
                <h1 className="text-2xl font-bold tracking-tight text-primary dark:text-primary-fixed">Agile Recovery</h1>
              </div>
              <div>
                <span className="text-[9px] text-outline uppercase font-bold tracking-wider block mb-0.5">Headline MD (600)</span>
                <h2 className="text-xl font-semibold text-on-surface dark:text-white">Treatment Plan</h2>
              </div>
              <div>
                <span className="text-[9px] text-outline uppercase font-bold tracking-wider block mb-0.5">Headline SM (600)</span>
                <h3 className="text-lg font-semibold text-secondary dark:text-secondary-fixed">Daily Exercises</h3>
              </div>
              <hr className="border-surface-container dark:border-neutral-800" />
              <div>
                <span className="text-[9px] text-outline uppercase font-bold tracking-wider block mb-0.5">Body MD (Standard)</span>
                <p className="text-sm text-on-surface-variant dark:text-neutral-400">
                  Complete 3 sets of 10 repetitions, resting for 30 seconds to maximize tissue recovery.
                </p>
              </div>
              <div>
                <span className="text-[9px] text-outline uppercase font-bold tracking-wider block mb-0.5">Label MD (600)</span>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">COMPLETED</span>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Elements */}
        <section className="md:col-span-12 bg-surface-container-lowest dark:bg-neutral-900 p-6 rounded-2xl shadow-xs border border-surface-container dark:border-neutral-800">
          <div className="flex items-center gap-2 mb-4 border-b border-surface-container dark:border-neutral-800 pb-2">
            <MousePointerClick className="text-primary w-5 h-5" />
            <h2 className="text-lg font-bold">3. Interactive Elements</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Buttons */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-on-surface-variant dark:text-neutral-400 mb-3">
                Button States
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium w-24 text-on-surface-variant">Primary Gradient</span>
                  <button className="flex-1 max-w-xs bg-gradient-to-r from-secondary-container to-primary text-on-primary font-bold py-2.5 rounded-xl text-xs hover:opacity-95 transition-all shadow-sm">
                    Start Routine
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium w-24 text-on-surface-variant">Secondary Outline</span>
                  <button className="flex-1 max-w-xs border border-primary text-primary dark:text-primary-fixed font-bold py-2.5 rounded-xl text-xs hover:bg-surface-container-low dark:hover:bg-neutral-850 transition-all">
                    View Details
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium w-24 text-on-surface-variant">Chips / Tags</span>
                  <div className="flex-1 flex gap-2">
                    <span className="bg-secondary-container text-on-secondary-container font-bold text-[10px] px-3 py-1 rounded-full">Shoulder</span>
                    <span className="bg-surface-container text-on-surface font-bold text-[10px] px-3 py-1 rounded-full">Low Impact</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-on-surface-variant dark:text-neutral-400 mb-3">
                Input States
              </h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant dark:text-neutral-400 block mb-1">Standard Empty</label>
                  <input
                    type="text"
                    placeholder="Enter patient ID"
                    className="w-full bg-[#F1F3F5] dark:bg-neutral-800 border-none rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-error block mb-1">Error Input</label>
                  <input
                    type="text"
                    value="Invalid date format"
                    readOnly
                    className="w-full bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-900 rounded-xl px-4 py-2.5 text-xs text-error focus:ring-1 focus:ring-error focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Visual Components */}
        <section className="md:col-span-12 bg-surface-container-lowest dark:bg-neutral-900 p-6 rounded-2xl shadow-xs border border-surface-container dark:border-neutral-800">
          <div className="flex items-center gap-2 mb-4 border-b border-surface-container dark:border-neutral-800 pb-2">
            <LayoutGrid className="text-primary w-5 h-5" />
            <h2 className="text-lg font-bold">4. Visual Components Mockups</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Component 1: Exercise Card */}
            <div className="bg-background dark:bg-neutral-800 border border-surface-container dark:border-neutral-700 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="h-28 bg-surface-container rounded-xl overflow-hidden relative mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=400"
                    alt="Exercise"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-secondary-container text-on-secondary-container text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Timer className="w-3 h-3" /> 5m
                  </div>
                </div>
                <h4 className="text-sm font-bold text-on-surface dark:text-white">Rotator Cuff Stretch</h4>
                <p className="text-xs text-on-surface-variant dark:text-neutral-400 mt-1">Gentle external rotation to improve mobility.</p>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-[10px] font-bold bg-surface-container-high dark:bg-neutral-700 text-on-surface-variant dark:text-neutral-300 px-2.5 py-1 rounded-full">
                  3 Sets x 10
                </span>
                <PlayCircle className="text-primary dark:text-primary-fixed-dim w-6 h-6 cursor-pointer hover:scale-105 transition-transform" />
              </div>
            </div>

            {/* Component 2: Progress Tracker */}
            <div className="bg-background dark:bg-neutral-800 border border-surface-container dark:border-neutral-700 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-primary-container text-white rounded-lg">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-primary dark:text-primary-fixed">This Week</span>
                </div>
                <h4 className="text-sm font-bold text-on-surface dark:text-white">Recovery Progress</h4>
                <p className="text-xs text-on-surface-variant dark:text-neutral-400 mt-1">You are on track to meet your mobility goals.</p>
              </div>
              <div className="mt-6">
                <div className="flex justify-between text-xs font-bold text-on-surface-variant dark:text-neutral-400 mb-1">
                  <span>Completion</span>
                  <span>75%</span>
                </div>
                <div className="w-full h-2 bg-surface-container dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-secondary-container to-primary rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
            </div>

            {/* Component 3: Appointment Banner */}
            <div className="bg-background dark:bg-neutral-800 border border-surface-container dark:border-neutral-700 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface dark:text-white">Next Session</h4>
                    <p className="text-xs text-on-surface-variant dark:text-neutral-400">Dr. Sarah Jenkins</p>
                  </div>
                </div>
                <div className="bg-surface-container dark:bg-neutral-900 p-2.5 rounded-xl flex items-center gap-2">
                  <Timer className="w-4 h-4 text-outline" />
                  <span className="text-xs text-on-surface-variant dark:text-neutral-300">Oct 24, 10:00 AM</span>
                </div>
              </div>
              <button className="w-full border border-primary dark:border-primary-fixed-dim text-primary dark:text-primary-fixed-dim font-bold text-xs py-2 rounded-xl mt-4 hover:bg-primary/5 transition-all">
                Reschedule
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
