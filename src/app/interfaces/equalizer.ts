export interface EqualizerInterface {
  amplify: EqualizerItem;
  volume: EqualizerItem;
}

export const equalizerOptInitial: EqualizerInterface = {
  amplify: { value: 1, max: 50, min: 1, step: 0.1, pin: true, mult: 1, prefix: '' },
  volume: { value: 0.7, max: 1, min: 0, step: 0.01, pin: true, mult: 100, prefix: '%' }
};

export interface EqualizerItem {
  value: number;
  min: number;
  max: number;
  step: number;
  pin?: boolean;
  mult: number;
  prefix: string;
}

export interface EqualizerMixInterface {
  context: AudioContext;
  source: MediaElementAudioSourceNode;
  gain: GainNode;
  media: HTMLAudioElement;
  amplify: any;
  getamplify: any;
  volume: any;
  getvolume: any;
}
