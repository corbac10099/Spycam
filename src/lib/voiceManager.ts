// Full WebRTC Peer-to-Peer Voice Mesh & Activity Detection Manager
// Transmits live microphone audio directly between players' browsers using free public Google STUN servers.

export interface VoiceManagerCallbacks {
  onSpeakingChange: (isSpeaking: boolean, volumeLevel: number) => void;
  onRemoteSpeakingChange?: (peerId: string, isSpeaking: boolean) => void;
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export class VoiceManager {
  private lobbyId: string;
  private myPeerId: string;
  private stream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private isSpeaking: boolean = false;
  private isMuted: boolean = false;
  private callbacks: VoiceManagerCallbacks;
  private recognition: any = null;

  // WebRTC Peer Connections: peerId -> RTCPeerConnection
  private peers: Map<string, RTCPeerConnection> = new Map();
  // Remote Audio elements: peerId -> HTMLAudioElement
  private remoteAudios: Map<string, HTMLAudioElement> = new Map();
  // Signaling poll timer
  private signalInterval: NodeJS.Timeout | null = null;

  // Speaking detection threshold in RMS
  private speakingThreshold = 0.04;
  private silenceTimer: NodeJS.Timeout | null = null;

  constructor(lobbyId: string, myPeerId: string, callbacks: VoiceManagerCallbacks) {
    this.lobbyId = lobbyId;
    this.myPeerId = myPeerId;
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
      this.startSignalingLoop();

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

        if (!this.isSpeaking) {
          this.isSpeaking = true;
          this.callbacks.onSpeakingChange(true, rms);
        }
      } else {
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

  // Connect to other peers in voice
  public syncRemotePeers(voiceMembers: { memberId: string; gameName: string; tagLine: string }[]) {
    if (!this.stream) return;

    for (const member of voiceMembers) {
      const remoteId = `${member.gameName}_${member.tagLine}`;
      if (remoteId === this.myPeerId) continue;

      if (!this.peers.has(remoteId)) {
        // If my peerId is alphabetically smaller, initiate WebRTC offer (avoids glare)
        const shouldInitiate = this.myPeerId < remoteId;
        this.createPeerConnection(remoteId, shouldInitiate);
      }
    }
  }

  private createPeerConnection(remotePeerId: string, isInitiator: boolean) {
    if (this.peers.has(remotePeerId)) return;

    const pc = new RTCPeerConnection(ICE_SERVERS);
    this.peers.set(remotePeerId, pc);

    // Add local microphone tracks to peer connection
    if (this.stream) {
      this.stream.getTracks().forEach((track) => pc.addTrack(track, this.stream!));
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal(remotePeerId, "ice", event.candidate);
      }
    };

    // When remote voice arrives: play audio through speakers
    pc.ontrack = (event) => {
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
      audioEl.play().catch(() => {});

      // Set up volume monitor on remote voice stream
      this.monitorRemoteStream(remotePeerId, remoteStream);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed" || pc.connectionState === "closed") {
        this.closePeer(remotePeerId);
      }
    };

    if (isInitiator) {
      pc.createOffer({ offerToReceiveAudio: true })
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          this.sendSignal(remotePeerId, "offer", pc.localDescription);
        })
        .catch((err) => console.warn("[WebRTC] Offer error:", err));
    }
  }

  // Monitor remote voice to trigger speaking glow on other players' cards
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

  // Send WebRTC signaling packet (offer / answer / ice) via API
  private async sendSignal(toId: string, type: "offer" | "answer" | "ice", data: any) {
    try {
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

  // Poll incoming WebRTC signals
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
    }, 1200);
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
        await pc.setLocalDescription(answer);
        this.sendSignal(fromId, "answer", answer);
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
    if (muted && this.isSpeaking) {
      this.isSpeaking = false;
      this.callbacks.onSpeakingChange(false, 0);
    }
  }

  public stop() {
    if (this.signalInterval) {
      clearInterval(this.signalInterval);
      this.signalInterval = null;
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
    if (this.audioCtx && this.audioCtx.state !== "closed") {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.isSpeaking = false;
    this.callbacks.onSpeakingChange(false, 0);
  }
}
