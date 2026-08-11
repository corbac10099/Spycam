'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import RichTextRenderer from './RichTextRenderer';

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

export default function AbilityCard({ ability, slotName, globalLoop = true, globalLoopDelayMs = 500 }: { ability: Ability; slotName: string, globalLoop?: boolean, globalLoopDelayMs?: number }) {
  const [activeTab, setActiveTab] = useState<'description' | 'video'>('description');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const loopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayRef = useRef(false);
  const hasVideos = ability.videos && ability.videos.length > 0;

  const currentVideo = hasVideos ? ability.videos![currentVideoIndex] : null;

  // Nettoyer le timeout de boucle
  const clearLoopTimeout = useCallback(() => {
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Reset video state when changing chapters
    if (videoRef.current) {
      clearLoopTimeout();
      setIsDescriptionExpanded(false);
      
      // Charger la nouvelle source
      videoRef.current.load();
      
      // Si on vient d'une flèche → auto-play
      if (autoPlayRef.current) {
        const playPromise = videoRef.current.play();
        if (playPromise) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        }
        autoPlayRef.current = false;
      } else {
        setIsPlaying(false);
      }
    }
  }, [currentVideoIndex, clearLoopTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearLoopTimeout();
  }, [clearLoopTimeout]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        clearLoopTimeout();
        setIsPlaying(false);
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        }
      }
    }
  };

  const handleVideoEnded = () => {
    if (globalLoop) {
      // Relancer après le délai configuré
      loopTimeoutRef.current = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          const playPromise = videoRef.current.play();
          if (playPromise) {
            playPromise
              .then(() => setIsPlaying(true))
              .catch(() => setIsPlaying(false));
          }
        }
      }, globalLoopDelayMs);
    } else {
      setIsPlaying(false);
    }
  };

  const prevVideo = () => {
    if (hasVideos) {
      clearLoopTimeout();
      autoPlayRef.current = true;
      setCurrentVideoIndex((prev) => (prev > 0 ? prev - 1 : ability.videos!.length - 1));
    }
  };

  const nextVideo = () => {
    if (hasVideos) {
      clearLoopTimeout();
      autoPlayRef.current = true;
      setCurrentVideoIndex((prev) => (prev < ability.videos!.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <div className="w-full bg-[#0f1923]/80 border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md mb-8">
      
      {/* HEADER TABS */}
      <div className="flex border-b border-white/10 bg-black/40">
        <button
          onClick={() => setActiveTab('description')}
          className={`flex-1 py-4 text-center font-bold text-sm tracking-widest uppercase transition-colors ${
            activeTab === 'description' 
              ? 'bg-[#fa4454]/10 text-[#fa4454] border-b-2 border-[#fa4454]' 
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          Description
        </button>
        {hasVideos && (
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-4 text-center font-bold text-sm tracking-widest uppercase transition-colors ${
              activeTab === 'video' 
                ? 'bg-[#fa4454]/10 text-[#fa4454] border-b-2 border-[#fa4454]' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Vidéo
          </button>
        )}
      </div>

      {/* CONTENT AREA */}
      <div className="p-6 md:p-8">
        
        {/* TAB 1: DESCRIPTION */}
        <div style={{ display: activeTab === 'description' ? 'block' : 'none' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-black/50 border border-white/20 rounded flex items-center justify-center p-2">
              {ability.iconUrl ? (
                <img src={ability.iconUrl} alt={ability.name} className="w-full h-full object-contain filter drop-shadow-md" />
              ) : (
                <span className="text-white/50 text-xl font-bold">{slotName}</span>
              )}
            </div>
            <div>
              <div className="text-[#fa4454] text-xs font-bold tracking-widest uppercase mb-1">{slotName}</div>
              <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">{ability.name || 'Compétence inconnue'}</h3>
            </div>
          </div>
          <div className="text-white/80 text-sm md:text-base leading-relaxed">
            <RichTextRenderer content={ability.description || '<p>Aucune description disponible.</p>'} />
          </div>
        </div>

        {/* TAB 2: VIDEO */}
        {hasVideos && (
          <div style={{ display: activeTab === 'video' ? 'block' : 'none' }} className="animate-in fade-in duration-300">
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-white/10 group">
              
              {/* VIDEO ELEMENT */}
              <video 
                ref={videoRef}
                className="w-full h-full object-cover"
                poster={currentVideo?.thumbnailUrl}
                onEnded={handleVideoEnded}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                playsInline
                autoPlay={globalLoop}
                muted={isMuted}
                onClick={togglePlay}
              >
                {currentVideo?.videoUrl && <source src={currentVideo.videoUrl} type="video/mp4" />}
                Votre navigateur ne supporte pas la balise vidéo.
              </video>

              {/* MUTE CONTROLS */}
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                className="absolute right-4 top-4 z-20 w-10 h-10 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 border border-white/20 shadow-md backdrop-blur-md"
                title={isMuted ? "Activer le son" : "Désactiver le son"}
              >
                {isMuted ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                )}
              </button>

              {/* OVERLAY / BIG PLAY BUTTON */}
              {!isPlaying && !globalLoop && (
                <div 
                  className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/20 transition-colors"
                  onClick={togglePlay}
                >
                  <div className="w-20 h-20 bg-[#fa4454] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(250,68,84,0.6)] transform transition-transform group-hover:scale-110">
                    <svg viewBox="0 0 24 24" fill="white" className="w-10 h-10 ml-1">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* CHAPTER CONTROLS (ARROWS) */}
              {ability.videos!.length > 1 && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); prevVideo(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#fa4454] hover:text-white border border-white/20"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); nextVideo(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#fa4454] hover:text-white border border-white/20"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </>
              )}

              {/* BOTTOM BAR: CHAPTER LABEL & PAGINATION */}
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent pointer-events-none flex flex-col items-center justify-end z-10">
                <span className="text-white font-bold text-lg mb-2 shadow-black drop-shadow-md">
                  {currentVideo?.label || `Chapitre ${currentVideoIndex + 1}`}
                </span>
                
                {currentVideo?.description && !isDescriptionExpanded && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsDescriptionExpanded(true); }}
                    className="pointer-events-auto flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md mb-2 transition-colors border border-white/10"
                  >
                    En savoir plus
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                )}

                {/* DOTS PAGINATION */}
                {ability.videos!.length > 1 && (
                  <div className="flex gap-2">
                    {ability.videos!.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentVideoIndex ? 'w-6 bg-[#fa4454]' : 'w-2 bg-white/40'}`}
                      />
                    ))}
                  </div>
                )}

                {/* LOOP INDICATOR */}
                {globalLoop && (
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-white/40 uppercase tracking-widest">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                      <polyline points="17 1 21 5 17 9"></polyline>
                      <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                      <polyline points="7 23 3 19 7 15"></polyline>
                      <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                    </svg>
                    Boucle ({globalLoopDelayMs}ms)
                  </div>
                )}
              </div>

              {/* EXPANDABLE DESCRIPTION OVERLAY */}
              {isDescriptionExpanded && currentVideo?.description && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-20 flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
                    <h4 className="text-white font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#fa4454]"></span>
                      Détails : {currentVideo.label}
                    </h4>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsDescriptionExpanded(false); }}
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
                      onClick={(e) => { e.stopPropagation(); setIsDescriptionExpanded(false); }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/80 hover:text-white bg-white/10 hover:bg-[#fa4454] px-6 py-2 rounded-full transition-colors border border-white/10"
                    >
                      Fermer
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
