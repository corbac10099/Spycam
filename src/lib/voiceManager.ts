import { getPusherClient } from "./pusherClient";

export interface VoiceManagerCallbacks {
  onSpeakingChange: (isSpeaking: boolean, volumeLevel: number) => void;
  onRemoteSpeakingChange?: (peerId: string, isSpeaking: boolean) => void;
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
}

export interface AudioDeviceInfo {
  deviceId: string;
  label: string;
  kind: "audioinput" | "audiooutput";
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

function enhanceOpusSDP(sdp: string): string {
  if (!sdp) return sdp;
  return sdp.replace(/a=fmtp:(\d+) (.*)/g, (match, pt, params) => {
    if (params.includes("minptime") || params.includes("useinbandfec") || sdp.includes(`a=rtpmap:${pt} opus/48000`)) {
      return `a=fmtp:${pt} minptime=10;useinbandfec=1;stereo=1;sprop-stereo=1;maxaveragebitrate=128000;cbr=0`;
    }
    return match;
  });
}

export class VoiceManager {
  private lobbyId: string;
  private myPeerId: string;
  private stream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private isSpeaking: boolean = false;
  private isMuted: boolean = false;
  private isDeafened: boolean = false;
  private callbacks: VoiceManagerCallbacks;
  private recognition: any = null;
  private pusherChannel: any = null;

  // Selected Devices
  private currentInputDeviceId: string = "default";
  private currentOutputDeviceId: string = "default";

  // WebRTC Peer Connections: peerId -> RTCPeerConnection
  private peers: Map<string, RTCPeerConnection> = new Map();
  // Remote Audio elements: peerId -> HTMLAudioElement
  private remoteAudios: Map<string, HTMLAudioElement> = new Map();
  // Signaling poll timer
  private signalInterval: NodeJS.Timeout | null = null;

  // Krisp-style Studio Audio Isolation & Voice DSP
  private isVoiceIsolationEnabled: boolean = true;
  private audioQualityPreset: "eco" | "standard" | "studio" = "studio";
  private isAutoDuckingEnabled: boolean = true;
  private highpassFilter: BiquadFilterNode | null = null;
  private bandpassFilter: BiquadFilterNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private noiseGateGain: GainNode | null = null;
  private audioDestination: MediaStreamAudioDestinationNode | null = null;
  private processedStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;

  // Speaking detection threshold in RMS
  private speakingThreshold = 0.025;
  private silenceTimer: NodeJS.Timeout | null = null;

  constructor(lobbyId: string, myPeerId: string, callbacks: VoiceManagerCallbacks) {
    this.lobbyId = lobbyId;
    this.myPeerId = myPeerId;
    this.callbacks = callbacks;
  }

  public setVoiceIsolation(enabled: boolean) {
    this.isVoiceIsolationEnabled = enabled;
    if (this.highpassFilter) {
      this.highpassFilter.frequency.value = enabled ? 75 : 10;
    }
    if (this.bandpassFilter) {
      this.bandpassFilter.gain.value = enabled ? 2.5 : 0.0;
    }
    if (this.compressor) {
      this.compressor.threshold.value = enabled ? -24 : -40;
      this.compressor.ratio.value = enabled ? 2.5 : 1.5;
    }
    if (this.noiseGateGain && this.audioCtx) {
      this.noiseGateGain.gain.setTargetAtTime(1.0, this.audioCtx.currentTime, 0.01);
    }
  }

  public setSpeakingThreshold(threshold: number) {
    this.speakingThreshold = Math.max(0.005, Math.min(0.2, threshold));
  }

  public setAutoDucking(enabled: boolean) {
    this.isAutoDuckingEnabled = enabled;
  }

  public setAudioQuality(preset: "eco" | "standard" | "studio") {
    this.audioQualityPreset = preset;
  }

  public getSettings() {
    return {
      voiceIsolation: this.isVoiceIsolationEnabled,
      speakingThreshold: this.speakingThreshold,
      autoDucking: this.isAutoDuckingEnabled,
      audioQuality: this.audioQualityPreset,
      currentInputDeviceId: this.currentInputDeviceId,
      currentOutputDeviceId: this.currentOutputDeviceId,
    };
  }

  public static async getAvailableAudioDevices(): Promise<{
    inputs: AudioDeviceInfo[];
    outputs: AudioDeviceInfo[];
  }> {
    if (typeof window === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
      return { inputs: [], outputs: [] };
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs: AudioDeviceInfo[] = [];
      const outputs: AudioDeviceInfo[] = [];

      let inputCount = 1;
      let outputCount = 1;

      for (const d of devices) {
        if (d.kind === "audioinput") {
          inputs.push({
            deviceId: d.deviceId,
            label: d.label || `Microphone ${inputCount++}`,
            kind: "audioinput",
          });
        } else if (d.kind === "audiooutput") {
          outputs.push({
            deviceId: d.deviceId,
            label: d.label || `Haut-parleurs / Casque ${outputCount++}`,
            kind: "audiooutput",
          });
        }
      }

      return { inputs, outputs };
    } catch {
      return { inputs: [], outputs: [] };
    }
  }

  public async start(inputDeviceId?: string, outputDeviceId?: string): Promise<boolean> {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      this.callbacks.onError?.("Votre navigateur ne prend pas en charge l'accès au micro.");
      return false;
    }

    if (inputDeviceId) this.currentInputDeviceId = inputDeviceId;
    if (outputDeviceId) this.currentOutputDeviceId = outputDeviceId;

    try {
      // Crystal Clear Studio Audio Constraints (48kHz fullband, auto-gain, echo cancelling)
      const audioConstraints: MediaTrackConstraints = {
        echoCancellation: { ideal: true },
        noiseSuppression: { ideal: true },
        autoGainControl: { ideal: true },
        sampleRate: { ideal: 48000 },
        sampleSize: { ideal: 16 },
        channelCount: { ideal: 1 },
      };

      if (this.currentInputDeviceId && this.currentInputDeviceId !== "default") {
        audioConstraints.deviceId = { exact: this.currentInputDeviceId };
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
      });

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass({ sampleRate: 48000 });
      if (this.audioCtx.state === "suspended") {
        await this.audioCtx.resume();
      }

      this.sourceNode = this.audioCtx.createMediaStreamSource(this.stream);

      // Krisp-style Studio Vocal DSP Filter chain
      // 1. Highpass: Cuts desk bumps, handling noise, AC hum (<75Hz)
      this.highpassFilter = this.audioCtx.createBiquadFilter();
      this.highpassFilter.type = "highpass";
      this.highpassFilter.frequency.value = this.isVoiceIsolationEnabled ? 75 : 10;
      this.highpassFilter.Q.value = 0.7;

      // 2. Vocal Clarity & Presence Boost (2.8kHz)
      this.bandpassFilter = this.audioCtx.createBiquadFilter();
      this.bandpassFilter.type = "peaking";
      this.bandpassFilter.frequency.value = 2800;
      this.bandpassFilter.gain.value = this.isVoiceIsolationEnabled ? 2.5 : 0.0;
      this.bandpassFilter.Q.value = 1.2;

      // 3. Studio Broadcast Compressor (smooth, warm, no distortion)
      this.compressor = this.audioCtx.createDynamicsCompressor();
      this.compressor.threshold.value = this.isVoiceIsolationEnabled ? -24 : -40;
      this.compressor.knee.value = 10;
      this.compressor.ratio.value = this.isVoiceIsolationEnabled ? 2.5 : 1.5;
      this.compressor.attack.value = 0.008;
      this.compressor.release.value = 0.12;

      // 4. Smooth Gain Node
      this.noiseGateGain = this.audioCtx.createGain();
      this.noiseGateGain.gain.value = 1.0;

      // 5. Analyser for speech detection & VU-meter
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.25;

      // 6. MediaStreamDestination for WebRTC peer transmission
      this.audioDestination = this.audioCtx.createMediaStreamDestination();
      this.processedStream = this.audioDestination.stream;

      // Connect DSP chain:
      // source -> highpass -> bandpass -> compressor -> analyser
      this.sourceNode.connect(this.highpassFilter);
      this.highpassFilter.connect(this.bandpassFilter);
      this.bandpassFilter.connect(this.compressor);
      this.compressor.connect(this.analyser);

      // compressor -> noiseGateGain -> audioDestination
      this.compressor.connect(this.noiseGateGain);
      this.noiseGateGain.connect(this.audioDestination);

      this.startVolumeMonitoring();
      this.startSpeechRecognition();
      this.initPusherChannel();
      this.startSignalingLoop();

      return true;
    } catch (err: any) {
      console.warn("[VoiceManager] Micro access error:", err);
      this.callbacks.onError?.(
        err.name === "NotAllowedError"
          ? "Accès au microphone refusé. Autorisez le micro dans votre navigateur."
          : "Impossible d'accéder au microphone sélectionné."
      );
      return false;
    }
  }

  public async setInputDevice(deviceId: string): Promise<boolean> {
    this.currentInputDeviceId = deviceId;
    if (!this.stream) return false;

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: deviceId !== "default" ? { exact: deviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const oldTracks = this.stream.getAudioTracks();
      oldTracks.forEach((t) => t.stop());
      this.stream = newStream;

      if (this.audioCtx && this.sourceNode && this.highpassFilter) {
        this.sourceNode.disconnect();
        this.sourceNode = this.audioCtx.createMediaStreamSource(newStream);
        this.sourceNode.connect(this.highpassFilter);
      }

      // Re-apply mute state if needed
      if (this.processedStream) {
        const processedTrack = this.processedStream.getAudioTracks()[0];
        if (processedTrack) {
          processedTrack.enabled = !this.isMuted;
        }
      }

      return true;
    } catch (err) {
      console.warn("[VoiceManager] Failed to switch input device:", err);
      return false;
    }
  }

  public async setOutputDevice(sinkId: string): Promise<boolean> {
    this.currentOutputDeviceId = sinkId;
    for (const [, audioEl] of this.remoteAudios) {
      if (typeof (audioEl as any).setSinkId === "function") {
        try {
          await (audioEl as any).setSinkId(sinkId);
        } catch (err) {
          console.warn("[VoiceManager] setSinkId error:", err);
        }
      }
    }
    return true;
  }

  // Monitor microphone volume for green speaking glow
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

        // Instantly open the studio noise gate
        if (this.noiseGateGain && this.audioCtx) {
          this.noiseGateGain.gain.setTargetAtTime(1.0, this.audioCtx.currentTime, 0.008);
        }

        if (!this.isSpeaking) {
          this.isSpeaking = true;
          this.callbacks.onSpeakingChange(true, rms);
          if (this.isAutoDuckingEnabled) {
            this.remoteAudios.forEach((audio) => {
              audio.volume = 0.45;
            });
          }
        }
      } else {
        if (this.isSpeaking && !this.silenceTimer) {
          this.silenceTimer = setTimeout(() => {
            this.isSpeaking = false;
            this.callbacks.onSpeakingChange(false, 0);

            // Close studio noise gate when quiet so fans/keyboard/breathing are 100% muted
            if (this.noiseGateGain && this.audioCtx && this.isVoiceIsolationEnabled) {
              this.noiseGateGain.gain.setTargetAtTime(0.001, this.audioCtx.currentTime, 0.035);
            }

            if (this.isAutoDuckingEnabled) {
              this.remoteAudios.forEach((audio) => {
                audio.volume = 1.0;
              });
            }
            this.silenceTimer = null;
          }, 220);
        }
      }

      this.animFrameId = requestAnimationFrame(checkVolume);
    };

    this.animFrameId = requestAnimationFrame(checkVolume);
  }

  // Connect to other peers in voice
  public syncRemotePeers(voiceMembers: { memberId: string; gameName: string; tagLine: string }[]) {
    if (!this.stream) return;

    for (const member of voiceMembers) {
      const remoteId = `${member.gameName}_${member.tagLine}`;
      if (remoteId === this.myPeerId) continue;

      if (!this.peers.has(remoteId)) {
        const shouldInitiate = this.myPeerId < remoteId;
        this.createPeerConnection(remoteId, shouldInitiate);
      }
    }
  }

  private createPeerConnection(remotePeerId: string, isInitiator: boolean) {
    if (this.peers.has(remotePeerId)) return;

    const pc = new RTCPeerConnection(ICE_SERVERS);
    this.peers.set(remotePeerId, pc);

    // Send the Krisp-isolated DSP audio stream over WebRTC
    const outboundStream = this.processedStream || this.stream;
    if (outboundStream) {
      outboundStream.getTracks().forEach((track) => pc.addTrack(track, outboundStream));
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal(remotePeerId, "ice", event.candidate);
      }
    };

    pc.ontrack = async (event) => {
      const remoteStream = event.streams[0];
      let audioEl = this.remoteAudios.get(remotePeerId);
      if (!audioEl) {
        audioEl = document.createElement("audio");
        audioEl.autoplay = true;
        (audioEl as any).playsInline = true;
        document.body.appendChild(audioEl);
        this.remoteAudios.set(remotePeerId, audioEl);
      }
      audioEl.srcObject = remoteStream;
      audioEl.muted = this.isDeafened;

      if (this.currentOutputDeviceId && typeof (audioEl as any).setSinkId === "function") {
        try {
          await (audioEl as any).setSinkId(this.currentOutputDeviceId);
        } catch {}
      }

      audioEl.play().catch(() => {});
      this.monitorRemoteStream(remotePeerId, remoteStream);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed" || pc.connectionState === "closed") {
        this.closePeer(remotePeerId);
      }
    };

    if (isInitiator) {
      pc.createOffer({ offerToReceiveAudio: true })
        .then(async (offer) => {
          const enhancedOffer = new RTCSessionDescription({
            type: offer.type,
            sdp: enhanceOpusSDP(offer.sdp || ""),
          });
          await pc.setLocalDescription(enhancedOffer);
          this.sendSignal(remotePeerId, "offer", pc.localDescription);
        })
        .catch((err) => console.warn("[WebRTC] Offer error:", err));
    }
  }

  private monitorRemoteStream(peerId: string, stream: MediaStream) {
    if (!this.audioCtx) return;
    try {
      const remoteSource = this.audioCtx.createMediaStreamSource(stream);
      const remoteAnalyser = this.audioCtx.createAnalyser();
      remoteAnalyser.fftSize = 256;
      remoteSource.connect(remoteAnalyser);

      const data = new Uint8Array(remoteAnalyser.frequencyBinCount);
      let isRemoteSpeaking = false;

      const checkRemote = () => {
        if (!this.peers.has(peerId)) return;
        remoteAnalyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const val = data[i] / 255;
          sum += val * val;
        }
        const rms = Math.sqrt(sum / data.length);
        const speaking = rms > this.speakingThreshold;

        if (speaking !== isRemoteSpeaking) {
          isRemoteSpeaking = speaking;
          this.callbacks.onRemoteSpeakingChange?.(peerId, speaking);
        }
        requestAnimationFrame(checkRemote);
      };
      requestAnimationFrame(checkRemote);
    } catch {}
  }

  private initPusherChannel() {
    try {
      const pusher = getPusherClient();
      if (!pusher) return;

      const channelName = `lobby-${this.lobbyId}`;
      this.pusherChannel = pusher.subscribe(channelName);

      this.pusherChannel.bind("voice-signal", (sig: any) => {
        if (sig && sig.toId === this.myPeerId && sig.fromId !== this.myPeerId) {
          this.handleIncomingSignal(sig);
        }
      });

      this.pusherChannel.bind("voice-member-join", (data: any) => {
        if (data && data.voiceMembers) {
          this.syncRemotePeers(data.voiceMembers);
        }
      });

      this.pusherChannel.bind("voice-member-leave", (data: any) => {
        if (data && data.gameName && data.tagLine) {
          const remoteId = `${data.gameName}_${data.tagLine}`;
          this.closePeer(remoteId);
        }
      });

      this.pusherChannel.bind("voice-member-state", (data: any) => {
        if (data && data.gameName && data.tagLine) {
          const remoteId = `${data.gameName}_${data.tagLine}`;
          if (typeof data.isSpeaking === "boolean") {
            this.callbacks.onRemoteSpeakingChange?.(remoteId, data.isSpeaking);
          }
        }
      });
    } catch (err) {
      console.warn("[VoiceManager] Pusher init error:", err);
    }
  }

  private async sendSignal(toId: string, type: "offer" | "answer" | "ice", data: any) {
    try {
      // 1. Instant WebSocket broadcast via dedicated signaling endpoint
      fetch("/api/voice/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lobbyId: this.lobbyId,
          fromId: this.myPeerId,
          toId,
          type,
          data,
        }),
      }).catch(() => {});

      // 2. Also send to standard lobby endpoint as fallback
      await fetch(`/api/lobbies/${this.lobbyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "voice-signal",
          fromId: this.myPeerId,
          toId,
          type,
          data,
        }),
      });
    } catch {}
  }

  private startSignalingLoop() {
    this.signalInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/lobbies/${this.lobbyId}?forPeer=${encodeURIComponent(this.myPeerId)}`);
        const data = await res.json();
        if (data.success && data.signals && Array.isArray(data.signals)) {
          for (const sig of data.signals) {
            this.handleIncomingSignal(sig);
          }
        }
        if (data.success && data.lobby?.voiceMembers) {
          this.syncRemotePeers(data.lobby.voiceMembers);
        }
      } catch {}
    }, 600);
  }

  private async handleIncomingSignal(sig: { fromId: string; type: string; data: any }) {
    const { fromId, type, data } = sig;
    let pc = this.peers.get(fromId);

    if (type === "offer") {
      if (!pc) {
        this.createPeerConnection(fromId, false);
        pc = this.peers.get(fromId);
      }
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(data));
        const answer = await pc.createAnswer();
        const enhancedAnswer = new RTCSessionDescription({
          type: answer.type,
          sdp: enhanceOpusSDP(answer.sdp || ""),
        });
        await pc.setLocalDescription(enhancedAnswer);
        this.sendSignal(fromId, "answer", pc.localDescription);
      }
    } else if (type === "answer") {
      if (pc && pc.signalingState === "have-local-offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(data));
      }
    } else if (type === "ice") {
      if (pc && data) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data));
        } catch {}
      }
    }
  }

  private closePeer(peerId: string) {
    const pc = this.peers.get(peerId);
    if (pc) {
      pc.close();
      this.peers.delete(peerId);
    }
    const audio = this.remoteAudios.get(peerId);
    if (audio) {
      audio.pause();
      audio.remove();
      this.remoteAudios.delete(peerId);
    }
    this.callbacks.onRemoteSpeakingChange?.(peerId, false);
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

        this.recognition.onerror = () => {};
        this.recognition.onend = () => {
          if (this.stream && !this.isMuted) {
            try {
              this.recognition.start();
            } catch {}
          }
        };

        this.recognition.start();
      } catch {}
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.stream) {
      this.stream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
    if (this.processedStream) {
      this.processedStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
    if (muted && this.isSpeaking) {
      this.isSpeaking = false;
      this.callbacks.onSpeakingChange(false, 0);
    }
  }

  public setDeafened(deafened: boolean) {
    this.isDeafened = deafened;
    this.remoteAudios.forEach((audio) => {
      audio.muted = deafened;
    });
  }

  public stop() {
    if (this.signalInterval) {
      clearInterval(this.signalInterval);
      this.signalInterval = null;
    }
    if (this.pusherChannel) {
      try {
        const pusher = getPusherClient();
        if (pusher) {
          pusher.unsubscribe(`lobby-${this.lobbyId}`);
        }
      } catch {}
      this.pusherChannel = null;
    }
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
    this.peers.forEach((pc) => pc.close());
    this.peers.clear();
    this.remoteAudios.forEach((audio) => {
      audio.pause();
      audio.remove();
    });
    this.remoteAudios.clear();

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.processedStream) {
      this.processedStream.getTracks().forEach((track) => track.stop());
      this.processedStream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== "closed") {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.isSpeaking = false;
    this.callbacks.onSpeakingChange(false, 0);
  }
}
