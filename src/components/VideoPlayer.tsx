'use client';

import { useState, useRef, useEffect } from 'react';
import { tr } from '@/lib/i18n';

export type VideoQuality = '1080p' | '720p' | '480p' | '360p';

export interface VideoPlayerProps {
  src?: string;
  qualityUrls?: Partial<Record<VideoQuality, string>>;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  loopDelayMs?: number;
  className?: string;
  onEnded?: () => void;
}

export default function VideoPlayer({
  src,
  qualityUrls,
  poster,
  autoPlay = false,
  loop = true,
  loopDelayMs = 500,
  className = '',
  onEnded
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('spycam_video_muted');
      return cached !== null ? cached === 'true' : true;
    }
    return true;
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>('1080p');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [qualityBadge, setQualityBadge] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const loopTimeout = useRef<NodeJS.Timeout | null>(null);
  const qualityBadgeTimeout = useRef<NodeJS.Timeout | null>(null);

  // Get active video source based on selected quality
  const getActiveVideoSrc = (q: VideoQuality): string | undefined => {
    if (qualityUrls && qualityUrls[q] && qualityUrls[q]!.trim()) {
      return qualityUrls[q];
    }
    return qualityUrls?.['1080p'] || src;
  };

  const activeSrc = getActiveVideoSrc(selectedQuality);

  const handleQualityChange = (q: VideoQuality) => {
    if (q === selectedQuality) {
      setShowQualityMenu(false);
      return;
    }

    const prevTime = videoRef.current ? videoRef.current.currentTime : currentTime;
    const wasPlaying = isPlaying;
    const targetUrl = getActiveVideoSrc(q);

    setSelectedQuality(q);
    setShowQualityMenu(false);
    setQualityBadge(q);

    if (qualityBadgeTimeout.current) clearTimeout(qualityBadgeTimeout.current);
    qualityBadgeTimeout.current = setTimeout(() => {
      setQualityBadge(null);
    }, 1500);

    // Switch video stream dynamically while preserving playback time
    if (videoRef.current && targetUrl && targetUrl !== videoRef.current.currentSrc) {
      videoRef.current.src = targetUrl;
      videoRef.current.currentTime = prevTime;
      if (wasPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const qualityFilters: Record<string, string> = {
    '1080p': 'none',
    '720p': 'blur(0.35px)',
    '480p': 'blur(0.9px) contrast(1.04)',
    '360p': 'blur(1.8px) contrast(1.1)',
  };

  // If a dedicated quality URL is provided, don't blur; otherwise use fallback filter
  const hasDedicatedUrl = !!(qualityUrls && qualityUrls[selectedQuality] && qualityUrls[selectedQuality]!.trim());
  const effectiveFilter = hasDedicatedUrl ? 'none' : (qualityFilters[selectedQuality] || 'none');

  // Sync mute state across all video players in real-time
  useEffect(() => {
    const handleGlobalMuteChange = (e: CustomEvent<{ isMuted: boolean }>) => {
      if (typeof e.detail?.isMuted === 'boolean') {
        setIsMuted(e.detail.isMuted);
        if (videoRef.current) {
          videoRef.current.muted = e.detail.isMuted;
        }
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'spycam_video_muted' && e.newValue !== null) {
        const newMuted = e.newValue === 'true';
        setIsMuted(newMuted);
        if (videoRef.current) {
          videoRef.current.muted = newMuted;
        }
      }
    };

    window.addEventListener('spycam_video_mute_change' as any, handleGlobalMuteChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('spycam_video_mute_change' as any, handleGlobalMuteChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (videoRef.current) {
      videoRef.current.muted = newMuted;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('spycam_video_muted', newMuted ? 'true' : 'false');
      window.dispatchEvent(new CustomEvent('spycam_video_mute_change', { detail: { isMuted: newMuted } }));
    }
  };

  // Auto-hide controls after inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowQualityMenu(false);
      }
    }, 2500);
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
      setShowQualityMenu(false);
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Format seconds to mm:ss
  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Video time update
  const handleTimeUpdate = () => {
    if (videoRef.current && !isSeeking) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Loaded metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Scrubber / Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Video ended with optional loop delay
  const handleVideoEnded = () => {
    if (loop) {
      if (loopTimeout.current) clearTimeout(loopTimeout.current);
      loopTimeout.current = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }, loopDelayMs);
    } else {
      setIsPlaying(false);
    }
    if (onEnded) onEnded();
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
      if (loopTimeout.current) clearTimeout(loopTimeout.current);
    };
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const qualities = ['1080p', '720p', '480p', '360p'];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-[var(--color-border)] select-none group ${className}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={activeSrc}
        poster={poster}
        playsInline
        muted={isMuted}
        autoPlay={autoPlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleVideoEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
        style={{ filter: effectiveFilter }}
        className="w-full h-full object-cover cursor-pointer transition-all duration-300"
      />

      {/* Quality change badge notification */}
      {qualityBadge && (
        <div className="absolute top-3 right-3 z-40 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[var(--color-val-red)]/50 text-white font-bold text-[11px] animate-in fade-in zoom-in-90 duration-150 flex items-center gap-1.5 shadow-xl pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-val-red)] animate-pulse"></span>
          <span>{tr("Qualité :")} {qualityBadge}</span>
        </div>
      )}

      {/* Large Center Play Button when paused */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-black/30 z-20"
        >
          <div className="w-11 h-11 xs:w-13 xs:h-13 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-[var(--color-val-red)] rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(255,70,85,0.6)] transform group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 ml-0.5 sm:ml-1">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Controls Overlay (Fades out when inactive) */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-2 xs:p-2.5 sm:p-4 transition-opacity duration-300 flex flex-col gap-1 sm:gap-2 z-30 ${
          showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber / Progress Bar */}
        <div className="relative w-full flex items-center group/scrubber cursor-pointer">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onMouseDown={() => setIsSeeking(true)}
            onMouseUp={() => setIsSeeking(false)}
            onTouchStart={() => setIsSeeking(true)}
            onTouchEnd={() => setIsSeeking(false)}
            onChange={handleSeek}
            className="w-full h-1 sm:h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[var(--color-val-red)] hover:h-2 sm:hover:h-2.5 transition-all"
            style={{
              background: `linear-gradient(to right, var(--color-val-red) 0%, var(--color-val-red) ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%, rgba(255,255,255,0.2) 100%)`
            }}
          />
        </div>

        {/* Bottom Controls Bar */}
        <div className="flex items-center justify-between text-white text-[11px] sm:text-xs font-bold pt-0.5 sm:pt-1">
          {/* Left: Play/Pause, Mute, Time */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={togglePlay}
              className="p-1 hover:text-[var(--color-val-red)] transition-colors cursor-pointer"
              title={isPlaying ? tr("Pause") : tr("Lecture")}
            >
              {isPlaying ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className="p-1 hover:text-[var(--color-val-red)] transition-colors cursor-pointer"
              title={isMuted ? tr("Activer le son") : tr("Désactiver le son")}
            >
              {isMuted ? (
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <line x1="23" y1="9" x2="17" y2="15"></line>
                  <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              )}
            </button>

            {/* Time Stamp */}
            <span className="text-[9px] xs:text-[10px] sm:text-[11px] text-white/80 font-mono tracking-wider">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right: Quality Selector & Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-3 relative">
            {/* Quality Selector */}
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="px-1.5 sm:px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors text-[9px] sm:text-[10px] uppercase font-mono tracking-wider flex items-center gap-0.5 sm:gap-1 border border-white/10 cursor-pointer"
              >
                <span>{selectedQuality}</span>
                <svg width="8" height="8" className="sm:w-2.5 sm:h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              </button>

              {/* Quality Dropdown Menu */}
              {showQualityMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-[#121820] border border-[var(--color-border)] rounded-lg shadow-2xl py-1 z-40 min-w-[70px] sm:min-w-[80px]">
                  {qualities.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQualityChange(q as VideoQuality)}
                      className={`w-full text-left px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[11px] hover:bg-[var(--color-val-red)]/20 hover:text-[var(--color-val-red)] transition-colors flex items-center justify-between cursor-pointer ${
                        selectedQuality === q ? 'text-[var(--color-val-red)] font-black' : 'text-white/80'
                      }`}
                    >
                      <span>{q}</span>
                      {selectedQuality === q && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1 hover:text-[var(--color-val-red)] transition-colors cursor-pointer"
              title={isFullscreen ? tr("Quitter le plein écran") : tr("Plein écran")}
            >
              {isFullscreen ? (
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
