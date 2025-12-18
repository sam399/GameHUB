class SoundSystem {
  private sounds: Map<string, HTMLAudioElement>;
  private enabled: boolean;
  private volume: number;

  constructor() {
    this.sounds = new Map();
    this.enabled = true;
    this.volume = 0.3;
    this.initializeSounds();
  }

  private initializeSounds() {
    // Create synthetic sounds using Web Audio API
    this.createSound('hover', this.generateHoverSound());
    this.createSound('click', this.generateClickSound());
    this.createSound('whoosh', this.generateWhooshSound());
  }

  private createSound(name: string, audioBuffer: AudioBuffer) {
    // Convert AudioBuffer to playable audio element
    const context = new AudioContext();
    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    
    // Store for later use
    this.sounds.set(name, this.bufferToAudio(audioBuffer));
  }

  private bufferToAudio(buffer: AudioBuffer): HTMLAudioElement {
    const audio = new Audio();
    const blob = this.audioBufferToBlob(buffer);
    audio.src = URL.createObjectURL(blob);
    return audio;
  }

  private audioBufferToBlob(buffer: AudioBuffer): Blob {
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numberOfChannels * 2;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    
    let offset = 0;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([view], { type: 'audio/wav' });
  }

  private generateHoverSound(): AudioBuffer {
    const context = new AudioContext();
    const sampleRate = context.sampleRate;
    const duration = 0.1;
    const buffer = context.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // High-tech chirp (frequency sweep)
      const freq = 800 + (1200 * t);
      const envelope = Math.exp(-t * 20);
      data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
    }

    return buffer;
  }

  private generateClickSound(): AudioBuffer {
    const context = new AudioContext();
    const sampleRate = context.sampleRate;
    const duration = 0.15;
    const buffer = context.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // Digital lock-in sound
      const freq = 600 - (400 * t);
      const envelope = Math.exp(-t * 15);
      const click = Math.sin(2 * Math.PI * freq * t) * envelope * 0.4;
      const noise = (Math.random() - 0.5) * 0.1 * envelope;
      data[i] = click + noise;
    }

    return buffer;
  }

  private generateWhooshSound(): AudioBuffer {
    const context = new AudioContext();
    const sampleRate = context.sampleRate;
    const duration = 0.3;
    const buffer = context.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // Whoosh transition sound
      const noise = (Math.random() - 0.5) * 2;
      const envelope = Math.sin(Math.PI * t / duration);
      const filter = Math.sin(2 * Math.PI * 200 * t);
      data[i] = noise * envelope * filter * 0.3;
    }

    return buffer;
  }

  public play(soundName: string) {
    if (!this.enabled) return;

    const sound = this.sounds.get(soundName);
    if (sound) {
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.volume = this.volume;
      clone.play().catch(() => {
        // Ignore errors (browser autoplay policies)
      });
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  public isEnabled(): boolean {
    return this.enabled;
  }
}

// Singleton instance
export const soundSystem = new SoundSystem();

// React hook for sound system
export const useSoundEffects = () => {
  const playHover = () => soundSystem.play('hover');
  const playClick = () => soundSystem.play('click');
  const playWhoosh = () => soundSystem.play('whoosh');

  return {
    playHover,
    playClick,
    playWhoosh,
    setEnabled: (enabled: boolean) => soundSystem.setEnabled(enabled),
    setVolume: (volume: number) => soundSystem.setVolume(volume),
    isEnabled: () => soundSystem.isEnabled()
  };
};

// Higher-order component to add sound to elements
export const withSound = <P extends object>(
  Component: React.ComponentType<P>,
  options: { hover?: boolean; click?: boolean } = {}
) => {
  return (props: P) => {
    const { playHover, playClick } = useSoundEffects();

    const handlers: any = {};
    
    if (options.hover) {
      handlers.onMouseEnter = (e: React.MouseEvent) => {
        playHover();
        // @ts-ignore
        props.onMouseEnter?.(e);
      };
    }

    if (options.click) {
      handlers.onClick = (e: React.MouseEvent) => {
        playClick();
        // @ts-ignore
        props.onClick?.(e);
      };
    }

    return <Component {...props} {...handlers} />;
  };
};
