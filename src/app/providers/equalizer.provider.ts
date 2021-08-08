import { BehaviorSubject } from 'rxjs';
/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { EqualizerInterface, EqualizerMixInterface, equalizerOptInitial } from '../interfaces/equalizer';


@Injectable({
  providedIn: 'root'
})
export class EqualizerProvider {
  equalizerOpt = new BehaviorSubject<EqualizerInterface>(equalizerOptInitial);
  equalizer: EqualizerMixInterface;

  constructor(
    public storage: Storage
  ) {
    this.storage.create();
    this.allEqualizer().then(() => {

    });
    this.equalizerOpt.subscribe((equalizer) => {
      for (const key in equalizer) {
        if (Object.prototype.hasOwnProperty.call(equalizer, key) &&
          this.equalizer &&
          Object.prototype.hasOwnProperty.call(this.equalizer, key)) {
          const value = equalizer[key];
          this.equalizer[key](value.value);
        }
      }
    });
  }
  equalizerMix(currentMix: HTMLAudioElement) {

    const context: AudioContext = new (window.AudioContext)();
    const result: EqualizerMixInterface = {
      context,
      source: context.createMediaElementSource(currentMix),
      gain: context.createGain(),
      media: currentMix,
      volume: v => { result.media.volume = v; },
      getvolume: v => { result.media.volume = v; },
      amplify: m => { result.gain.gain.value = m; },
      getamplify: () => result.gain.gain.value
    };
    result.source.connect(result.gain);
    result.gain.connect(context.destination);



    const oscillator = context.createOscillator();

    oscillator.type = 'square';
    console.log(oscillator.frequency.value);
    setTimeout(() => {

      console.log(oscillator.frequency.value);
    }, 500);
    // oscillator.frequency.setValueAtTime(440, context.currentTime); // value in hertz
    oscillator.start();


    // SET INITIAL VALUES
    result.volume(this.equalizerOpt.getValue().volume.value);
    result.amplify(this.equalizerOpt.getValue().amplify.value);

    this.equalizer = result;
  }

  amplify(gain = 1) {
    this.equalizer.amplify(gain);
  }

  // ================= EQUALIZER
  allEqualizer(): Promise<any> {
    return this.storage.get('equalizer').then((equalizer: EqualizerInterface) => {
      let _equalizer = this.equalizerOpt.getValue();
      if (equalizer) {
        _equalizer = equalizer;
      }
      return _equalizer;
    }).then((equalizer: EqualizerInterface) => {
      this.equalizerOpt.next({ ...this.equalizerOpt.getValue(), ...equalizer });
      return equalizer;
    });
  }

  updateEqualizer(equalizer): Promise<any> {
    this.equalizerOpt.next({ ...this.equalizerOpt.getValue(), ...equalizer });
    return this.storage.set('equalizer', this.equalizerOpt.getValue()).then(() => this.equalizerOpt.getValue());
  }
  // ================= END EQUALIZER

}
