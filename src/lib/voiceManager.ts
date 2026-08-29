// WebRTC Voice Activity & Audio Analysis Manager
// Captures microphone, computes live volume for glowing speaking ring, and transcribes voice for safety logging

export interface VoiceManagerCallbacks {
  onSpeakingChange: (isSpeaking: boolean, volumeLevel: number) => void;
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
}

export class VoiceManager {
  private stream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private isSpeaking: boolean = false;
  private isMuted: boolean = false;
  private callbacks: VoiceManagerCallbacks;
  private recognition: any = null;

  // Threshold in RMS (0.0 to 1.0)
  private speakingThreshold = 0.04;
  private silenceTimer: NodeJS.Timeout | null = null;

  constructor(callbacks: VoiceManagerCallbacks) {
    this.callbacks = callbacks;
  }

  public async start(): Promise<boolean> {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      this.callbacks.onError?.("Votre navigateur ne prend pas en charge l'accès au micro.");
      return false;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      if (this.audioCtx.state === "suspended") {
        await this.audioCtx.resume();
      }

      const source = this.audioCtx.createMediaStreamSource(this.stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.4;
      source.connect(this.analyser);

      this.startVolumeMonitoring();
      this.startSpeechRecognition();
      return true;
    } catch (err: any) {
      console.warn("[VoiceManager] Micro access error:", err);
      this.callbacks.onError?.(
        err.name === "NotAllowedError"
          ? "Accès au microphone refusé. Autorisez le micro dans votre navigateur."
          : "Impossible d'accéder au microphone."
      );
      return false;
    }
  }

  private startVolumeMonitoring() {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const checkVolume = () => {
      if (!this.analyser || this.isMuted) {
        if (this.isSpeaking) {
          this.isSpeaking = false;
          this.callbacks.onSpeakingChange(false, 0);
        }
        this.animFrameId = requestAnimationFrame(checkVolume);
        return;
      }

      this.analyser.getByteFrequencyData(dataArray);

      // Compute Root Mean Square (RMS) volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const val = dataArray[i] / 255;
        sum += val * val;
      }
      const rms = Math.sqrt(sum / dataArray.length);

      if (rms > this.speakingThreshold) {
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
        }

        if (!this.isSpeaking) {
          this.isSpeaking = true;
          this.callbacks.onSpeakingChange(true, rms);
        }
      } else {
        // Debounce silence by 250ms so the glow doesn't flicker while speaking syllables
        if (this.isSpeaking && !this.silenceTimer) {
          this.silenceTimer = setTimeout(() => {
            this.isSpeaking = false;
            this.callbacks.onSpeakingChange(false, 0);
            this.silenceTimer = null;
          }, 250);
        }
      }

      this.animFrameId = requestAnimationFrame(checkVolume);
    };

    this.animFrameId = requestAnimationFrame(checkVolume);
  }

  private startSpeechRecognition() {
    if (typeof window === "undefined") return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      try {
        this.recognition = new SpeechRecognitionClass();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = "fr-FR";

        this.recognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              const text = event.results[i][0].transcript.trim();
              if (text && this.callbacks.onTranscript) {
                this.callbacks.onTranscript(text);
              }
            }
          }
        };

        this.recognition.onerror = (e: any) => {
          // Ignore no-speech errors quietly
          if (e.error !== "no-speech") {
            console.debug("[SpeechRecognition] error:", e.error);
          }
        };

        this.recognition.onend = () => {
          // Restart if voice stream is still active and not muted
          if (this.stream && !this.isMuted) {
            try {
              this.recognition.start();
            } catch {}
          }
        };

        this.recognition.start();
      } catch (e) {
        console.debug("[SpeechRecognition] Init bypassed:", e);
      }
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.stream) {
      this.stream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
    if (muted && this.isSpeaking) {
      this.isSpeaking = false;
      this.callbacks.onSpeakingChange(false, 0);
    }
  }

  public stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== "closed") {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.isSpeaking = false;
    this.callbacks.onSpeakingChange(false, 0);
  }
}
