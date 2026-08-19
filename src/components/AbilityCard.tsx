'use client';

import { useState } from 'react';
import RichTextRenderer from './RichTextRenderer';
import VideoPlayer from './VideoPlayer';
import { tr, trFormat } from '@/lib/i18n';

interface VideoClip {
  label: string;
  videoUrl: string;
  thumbnailUrl: string;
  description?: string;
  loop?: boolean;
  loopDelayMs?: number;
}

interface Ability {
  name: string;
  iconUrl?: string;
  description?: string;
  videos?: VideoClip[];
}

export default function AbilityCard({
  ability,
  slotName,
  globalLoop = true,
  globalLoopDelayMs = 500
}: {
  ability: Ability;
  slotName: string;
  globalLoop?: boolean;
  globalLoopDelayMs?: number;
}) {
  const [activeTab, setActiveTab] = useState<'description' | 'video'>('description');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const hasVideos = ability.videos && ability.videos.length > 0;

  const currentVideo = hasVideos ? ability.videos![currentVideoIndex] : null;

  const prevVideo = () => {
    if (hasVideos) {
      setIsDescriptionExpanded(false);
      setCurrentVideoIndex((prev) => (prev > 0 ? prev - 1 : ability.videos!.length - 1));
    }
  };

  const nextVideo = () => {
    if (hasVideos) {
      setIsDescriptionExpanded(false);
      setCurrentVideoIndex((prev) => (prev < ability.videos!.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <div className="w-full bg-[#0f1923]/80 border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md mb-4 sm:mb-6">
      {/* HEADER TABS */}
      <div className="flex border-b border-white/10 bg-black/40">
        <button
          onClick={() => setActiveTab('description')}
          className={`flex-1 py-2.5 sm:py-3.5 text-center font-bold text-xs sm:text-sm tracking-widest uppercase transition-colors ${
            activeTab === 'description'
              ? 'bg-[#fa4454]/10 text-[#fa4454] border-b-2 border-[#fa4454]'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          {tr("Description")}
        </button>
        {hasVideos && (
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-2.5 sm:py-3.5 text-center font-bold text-xs sm:text-sm tracking-widest uppercase transition-colors ${
              activeTab === 'video'
                ? 'bg-[#fa4454]/10 text-[#fa4454] border-b-2 border-[#fa4454]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {tr("Vidéo")}
          </button>
        )}
      </div>

      {/* CONTENT AREA */}
      <div className="p-3.5 sm:p-6 md:p-8">
        {/* TAB 1: DESCRIPTION */}
        <div style={{ display: activeTab === 'description' ? 'block' : 'none' }}>
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black/50 border border-white/20 rounded-lg flex items-center justify-center p-1.5 sm:p-2 flex-shrink-0">
              {ability.iconUrl ? (
                <img src={ability.iconUrl} alt={ability.name} className="w-full h-full object-contain filter drop-shadow-md" />
              ) : (
                <span className="text-white/50 text-base sm:text-xl font-bold">{slotName}</span>
              )}
            </div>
            <div>
              <div className="text-[#fa4454] text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-0.5 sm:mb-1">{slotName}</div>
              <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-white uppercase tracking-wider">
                {ability.name || tr("Compétence inconnue")}
              </h3>
            </div>
          </div>
          <div className="text-white/80 text-xs sm:text-sm md:text-base leading-relaxed">
            <RichTextRenderer content={ability.description || `<p>${tr("Aucune description disponible.")}</p>`} />
          </div>
        </div>

        {/* TAB 2: VIDEO */}
        {hasVideos && (
          <div style={{ display: activeTab === 'video' ? 'block' : 'none' }} className="animate-in fade-in duration-300">
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-white/10 group">
              {/* VIDEO PLAYER COMPONENT */}
              <VideoPlayer
                key={currentVideo?.videoUrl || currentVideoIndex}
                src={currentVideo?.videoUrl}
                poster={currentVideo?.thumbnailUrl}
                autoPlay={globalLoop}
                loop={globalLoop}
                loopDelayMs={globalLoopDelayMs}
                className="w-full h-full"
              />

              {/* CHAPTER CONTROLS (ARROWS) */}
              {ability.videos!.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevVideo();
                    }}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#fa4454] hover:text-white border border-white/20 z-40 cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-6 sm:h-6">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextVideo();
                    }}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#fa4454] hover:text-white border border-white/20 z-40 cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-6 sm:h-6">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </>
              )}

              {/* TOP/CENTER CHAPTER OVERLAY & PAGINATION */}
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4 pointer-events-none z-20 flex items-center gap-1.5 sm:gap-2 flex-wrap max-w-[85%]">
                <span className="bg-black/70 backdrop-blur-md px-2 sm:px-3 py-0.5 sm:py-1 rounded-md text-white font-bold text-[9px] sm:text-xs tracking-wider border border-white/10 uppercase truncate max-w-[130px] sm:max-w-none">
                  {currentVideo?.label || trFormat("Chapitre {number}", { number: currentVideoIndex + 1 })}
                </span>
                {currentVideo?.description && !isDescriptionExpanded && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDescriptionExpanded(true);
                    }}
                    className="pointer-events-auto flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-white/90 hover:text-white bg-black/70 hover:bg-[#fa4454] px-2 sm:px-3 py-0.5 sm:py-1 rounded-md backdrop-blur-md transition-colors border border-white/10 cursor-pointer"
                  >
                    <span>{tr("En savoir plus")}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 sm:w-3 sm:h-3">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                )}
              </div>

              {/* EXPANDABLE DESCRIPTION OVERLAY */}
              {isDescriptionExpanded && currentVideo?.description && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
                    <h4 className="text-white font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#fa4454]"></span>
                      {tr("Détails :")} {currentVideo.label}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDescriptionExpanded(false);
                      }}
                      className="text-white/60 hover:text-white transition-colors p-1"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto text-white/80 text-sm leading-relaxed pr-2 custom-scrollbar">
                    <RichTextRenderer content={currentVideo.description} />
                  </div>
                  <div className="pt-4 mt-auto text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDescriptionExpanded(false);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/80 hover:text-white bg-white/10 hover:bg-[#fa4454] px-6 py-2 rounded-full transition-colors border border-white/10"
                    >
                      {tr("Fermer")}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
