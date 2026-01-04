// Sound Design System using Web Audio API
// All sounds are synthesized - no external files needed

let audioContext: AudioContext | null = null;
let isMuted = true; // Start muted by default
let masterGain: GainNode | null = null;

// Initialize audio context on first user interaction
export function initAudio(): boolean {
  if (typeof window === "undefined") return false;

  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.gain.value = isMuted ? 0 : 0.3;
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  return true;
}

export function toggleMute(): boolean {
  isMuted = !isMuted;
  if (masterGain) {
    masterGain.gain.setTargetAtTime(isMuted ? 0 : 0.3, audioContext?.currentTime ?? 0, 0.1);
  }
  // Persist preference
  if (typeof window !== "undefined") {
    localStorage.setItem("awesomeintune-sound", isMuted ? "off" : "on");
  }
  return !isMuted;
}

export function isSoundEnabled(): boolean {
  return !isMuted;
}

export function loadSoundPreference(): void {
  if (typeof window !== "undefined") {
    const pref = localStorage.getItem("awesomeintune-sound");
    isMuted = pref !== "on";
    if (masterGain) {
      masterGain.gain.value = isMuted ? 0 : 0.3;
    }
  }
}

// Soft hover sound - gentle high frequency blip
export function playHover(): void {
  if (!audioContext || !masterGain || isMuted) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(masterGain);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.05);

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

// Click sound - satisfying pop
export function playClick(): void {
  if (!audioContext || !masterGain || isMuted) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(masterGain);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);

  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.15);
}

// Success sound - ascending arpeggio
export function playSuccess(): void {
  if (!audioContext || !masterGain || isMuted) return;

  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

  notes.forEach((freq, i) => {
    const oscillator = audioContext!.createOscillator();
    const gainNode = audioContext!.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(masterGain!);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(freq, audioContext!.currentTime + i * 0.1);

    gainNode.gain.setValueAtTime(0, audioContext!.currentTime + i * 0.1);
    gainNode.gain.linearRampToValueAtTime(0.15, audioContext!.currentTime + i * 0.1 + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext!.currentTime + i * 0.1 + 0.2);

    oscillator.start(audioContext!.currentTime + i * 0.1);
    oscillator.stop(audioContext!.currentTime + i * 0.1 + 0.2);
  });
}

// Transition whoosh sound
export function playWhoosh(): void {
  if (!audioContext || !masterGain || isMuted) return;

  // Create white noise
  const bufferSize = audioContext.sampleRate * 0.3;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = audioContext.createBufferSource();
  noise.buffer = buffer;

  // Filter to make it more swooshy
  const filter = audioContext.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(500, audioContext.currentTime);
  filter.frequency.exponentialRampToValueAtTime(2000, audioContext.currentTime + 0.15);
  filter.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.3);
  filter.Q.value = 1;

  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(masterGain);

  noise.start(audioContext.currentTime);
  noise.stop(audioContext.currentTime + 0.3);
}

// Ambient pad - subtle background drone
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

export function playAmbient(): () => void {
  if (!audioContext || !masterGain || isMuted) return noop;

  const oscillators: OscillatorNode[] = [];
  const gains: GainNode[] = [];

  const frequencies = [110, 165, 220, 330]; // A2, E3, A3, E4

  frequencies.forEach((freq, i) => {
    const osc = audioContext!.createOscillator();
    const gain = audioContext!.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioContext!.currentTime);

    // Very subtle LFO for movement
    const lfo = audioContext!.createOscillator();
    const lfoGain = audioContext!.createGain();
    lfo.frequency.value = 0.1 + i * 0.05;
    lfoGain.gain.value = 2;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();

    gain.gain.setValueAtTime(0, audioContext!.currentTime);
    gain.gain.linearRampToValueAtTime(0.02, audioContext!.currentTime + 2);

    osc.connect(gain);
    gain.connect(masterGain!);

    osc.start();
    oscillators.push(osc);
    gains.push(gain);
  });

  // Return cleanup function
  return () => {
    gains.forEach((gain) => {
      gain.gain.linearRampToValueAtTime(0.001, audioContext!.currentTime + 1);
    });
    setTimeout(() => {
      oscillators.forEach((osc) => osc.stop());
    }, 1000);
  };
}

// Filter transition sound
export function playFilterChange(): void {
  if (!audioContext || !masterGain || isMuted) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(masterGain);

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(200, audioContext.currentTime);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(200, audioContext.currentTime);
  filter.frequency.exponentialRampToValueAtTime(2000, audioContext.currentTime + 0.1);
  filter.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
  filter.Q.value = 5;

  gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
}
