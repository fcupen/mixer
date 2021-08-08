/* eslint-disable no-var */
/* eslint-disable prefer-const */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { BehaviorSubject } from 'rxjs';
/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { EqualizerInterface, EqualizerMixInterface, equalizerOptInitial } from '../interfaces/equalizer';


@Injectable({
  providedIn: 'root'
})
export class PitchProvider {
  stream = new BehaviorSubject<boolean>(false);
  note = new BehaviorSubject<string>('');
  pitch = new BehaviorSubject<number>(440);
  detune = new BehaviorSubject<number>(0);

  constructor(
    public storage: Storage
  ) {

  }

  turnOff() {
    this.stream.next(false);
  }
  toggleLiveInput() {

    let intervalo = setInterval(() => {
    }, 200);

    this.stream.next(true);
    let mediaStreamSource = null;
    const audioContext = new AudioContext();
    let analyser = null;
    let stream = null;
    let rafID = null;
    let buflen = 2048;
    let buff = new Float32Array(buflen);
    let noteStrings = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    function noteFromPitch(frequency) {
      var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
      return Math.round(noteNum) + 69;
    }
    function centsOffFromPitch(frequency, note) {
      return Math.floor(1200 * Math.log(frequency / frequencyFromNoteNumber(note)) / Math.log(2));
    }
    function frequencyFromNoteNumber(note) {
      return 440 * Math.pow(2, (note - 69) / 12);
    }

    function autoCorrelate(buf, sampleRate) {
      // Implements the ACF2+ algorithm
      var SIZE = buf.length;
      var rms = 0;

      for (var i = 0; i < SIZE; i++) {
        var val = buf[i];
        rms += val * val;
      }
      rms = Math.sqrt(rms / SIZE);
      if (rms < 0.01) { // not enough signal
        return -1;
      }

      var r1 = 0;
      var r2 = SIZE - 1;
      var thres = 0.2;
      for (var i = 0; i < SIZE / 2; i++) {
        if (Math.abs(buf[i]) < thres) { r1 = i; break; }
      }
      for (var i = 1; i < SIZE / 2; i++) {
        if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }
      }

      buf = buf.slice(r1, r2);
      SIZE = buf.length;

      var c = new Array(SIZE).fill(0);
      for (var i = 0; i < SIZE; i++) {
        for (var j = 0; j < SIZE - i; j++) {
          c[i] = c[i] + buf[j] * buf[j + i];
        }
      }
      var d = 0; while (c[d] > c[d + 1]) { d++; }
      var maxval = -1;
      var maxpos = -1;
      for (var i = d; i < SIZE; i++) {
        if (c[i] > maxval) {
          maxval = c[i];
          maxpos = i;
        }
      }
      var T0 = maxpos;

      var x1 = c[T0 - 1]; var x2 = c[T0]; var x3 = c[T0 + 1];
      var a = (x1 + x3 - 2 * x2) / 2;
      var b = (x3 - x1) / 2;
      if (a) { T0 = T0 - b / (2 * a); }

      return sampleRate / T0;
    }

    const updatePitch = () => {
      if (analyser) {
        analyser.getFloatTimeDomainData(buff);
        var ac = autoCorrelate(buff, audioContext.sampleRate);

        if (ac !== -1) {
          let pitch = ac;
          this.pitch.next(Math.round(pitch));
          // console.log({ pitchElem: Math.round(pitch) });
          var note = noteFromPitch(pitch);
          this.note.next(noteStrings[note % 12]);
          // console.log({ noteElem: noteStrings[note % 12] }, note % 12, note);
          var detune = centsOffFromPitch(pitch, note);
          if (detune !== 0) {
            // console.log({ detuneAmount: detune });
            this.detune.next(detune);
          }
        }

        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window.webkitRequestAnimationFrame;
        }
        rafID = window.requestAnimationFrame(updatePitch);
      }
    };

    function error() {
      alert('Stream generation failed.');
    }
    function getUserMedia(dictionary, callback) {
      try {
        navigator.getUserMedia = navigator.getUserMedia;
        navigator.getUserMedia(dictionary, callback, error);
      } catch (e) {
        alert('getUserMedia threw exception :' + e);
      }
    }

    function gotStream(_stream) {
      stream = _stream;
      // Create an AudioNode from the stream.
      mediaStreamSource = audioContext.createMediaStreamSource(_stream);

      // Connect it to the destination.
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      mediaStreamSource.connect(analyser);
      updatePitch();
    }

    getUserMedia(
      {
        audio: {
          mandatory: {
            googEchoCancellation: 'false',
            googAutoGainControl: 'false',
            googNoiseSuppression: 'false',
            googHighpassFilter: 'false'
          },
          optional: []
        },
      }, gotStream);

    let stream$ = this.stream.subscribe((_stream) => {
      if (!_stream) {
        stream.getAudioTracks().forEach(track => {
          track.stop();
        });
        mediaStreamSource.disconnect();
        mediaStreamSource = null;
        analyser = null;
        buff = new Float32Array(buflen);
        audioContext.close();

        this.detune.next(0);
        this.note.next('');
        this.pitch.next(440);

        clearInterval(intervalo);

        stream$.unsubscribe();
      }
    });
  }

}
