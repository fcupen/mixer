import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { EqualizerInterface } from 'src/app/interfaces/equalizer';
import { EqualizerProvider } from 'src/app/providers/equalizer.provider';
import { PitchProvider } from 'src/app/providers/pitch.provider';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-eq',
  templateUrl: './eq.component.html',
  styleUrls: ['./eq.component.scss'],
})
export class EqComponent implements OnInit {
  equalizerOpt: EqualizerInterface;
  rangeSelect = -1;

  isTune = false;

  note = new BehaviorSubject<string>('');
  pitch = new BehaviorSubject<number>(440);
  detune = new BehaviorSubject<number>(0);

  constructor(
    public pitchProvider: PitchProvider,
    private equalizerProvider: EqualizerProvider,
    public modalController: ModalController
  ) {
    this.equalizerProvider.equalizerOpt.subscribe((equalizerOpt: EqualizerInterface) => {
      this.equalizerOpt = equalizerOpt;
    });
  }

  change(e) {
    this.rangeSelect = e.detail.value;
  }
  update(key) {
    setTimeout(() => {
      this.equalizerProvider.updateEqualizer(
        {
          [key]:
          {
            ...this.equalizerOpt[key],
            value: this.rangeSelect !== -1 ?
              this.rangeSelect :
              this.equalizerOpt[key].value
          }
        });
    }, 10);
  }

  ngOnInit() {
    this.pitchProvider.note.subscribe((note) => {
      this.note.next(note);
    });
    this.pitchProvider.pitch.subscribe((pitch) => {
      this.pitch.next(pitch);
    });
    this.pitchProvider.detune.subscribe((detune) => {
      this.detune.next(detune);
    });
  }
  dismiss() {
    this.modalController.dismiss({
    });
  }
  startTune() {
    if (this.isTune) {
      this.pitchProvider.turnOff();
    } else {
      this.pitchProvider.toggleLiveInput();
    }
    this.isTune = !this.isTune;
  }
}
