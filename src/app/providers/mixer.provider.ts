/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { MixInterface } from '../interfaces/mix';


@Injectable({
  providedIn: 'root'
})
export class MixerProvider {
  mixes: MixInterface[] = [];

  constructor(
    public storage: Storage
  ) {
    this.storage.create();
  }

  // ================= MIXERS
  allMixes(): Promise<any> {
    return this.storage.get('mixes').then((mixes) => {
      let _mixes = [];
      if (mixes && Array.isArray(mixes)) {
        _mixes = mixes;
      }
      return _mixes;
    }).then((mixes) => {
      this.mixes = mixes;
      return mixes;
    });
  }

  addMix(mix: MixInterface): Promise<any> {
    this.mixes.push(mix);
    return this.storage.set('mixes', this.mixes).then(() => this.mixes);
  }
  removeMix(index): Promise<any> {
    this.mixes.splice(index, 1);
    return this.storage.set('mixes', this.mixes).then(() => this.mixes);
  }
  // ================= END MIXERS

}
