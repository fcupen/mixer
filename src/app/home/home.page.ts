/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonRouterOutlet, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { MixInterface } from '../interfaces/mix';
import { MixerProvider } from '../providers/mixer.provider';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  mixes: MixInterface[] = [];
  indexClick = -1;
  name = '';
  file;
  fileBase64;

  currentTime$ = new BehaviorSubject(0);
  currentTime = 0;
  updateTime = true;

  showControls = false;
  duration = -1;

  showAdd = false;

  currentMix = new Audio();
  constructor(
    private mixerProvider: MixerProvider,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public router: Router,
    public routerOutlet: IonRouterOutlet,
    public toastCtrl: ToastController
  ) { }
  handleFileInput(target: any | { files: FileList }) {
    const reader = new FileReader();
    reader.readAsDataURL(target.files.item(0));
    reader.onload = () => {
      this.fileBase64 = reader.result.toString();
    };

    reader.onerror = (err) => {
      this.presentToast(err).then(() => {

      });
    };
  }
  ngOnInit() {
    this.updateMixer();

    this.currentTime$.subscribe((currentTime) => {
      if (this.updateTime) {
        this.currentTime = currentTime;
      }
    });
  }

  updateMixer() {
    this.mixerProvider.allMixes().then((mixes) => {
      this.mixes = mixes;
    }).catch((error) => {
      this.presentToast(error).then(() => {

      });
    });
  }

  removeMix(index) {
    this.presentAlert(index).then((a) => {
      console.log(a);
    });
  }
  addMix() {
    this.mixerProvider.addMix({
      name: this.name,
      data: this.fileBase64,
      date: new Date().getTime()
    }).then((mixes) => {
      this.mixes = mixes;
      this.name = '';
      this.fileBase64 = '';
      this.file = undefined;
    }).catch((error) => {
      this.presentToast(error).then(() => {

      });
    });
  }

  setCurrentTime() {
    this.currentTime$.next(this.currentMix.currentTime);
    if (this.indexClick !== -1) {
      setTimeout(() => {
        this.setCurrentTime();
      }, 10);
    }
  }
  setDuration(duration) {
    this.duration = duration;
  }
  playMix(index) {
    this.stopMix();
    if (index !== this.indexClick) {
      this.stopMix();
      this.indexClick = index;
      this.currentMix = new Audio(this.mixes[index].data);
      this.currentMix.volume = 0.2;

      this.currentMix.play();
      this.currentMix.onplaying = () => {
        this.setDuration(this.currentMix.duration);
        this.setCurrentTime();
        this.showControls = true;
      };

      this.currentMix.addEventListener('ended', () => {
        this.resetAllControls();
        this.resetSelection();
      });
    } else {
      this.resetAllControls();
      this.resetSelection();
    }
  }

  stopMix() {
    this.currentMix.pause();
    this.showControls = false;
    this.hideControls();
  }
  stopAllMix() {
    this.resetAllControls();
    this.stopMix();
  }

  resetAllControls() {
    this.resetSelection();
    this.resetDuration();
    this.resetCurrentTime();
    this.hideControls();
  }

  hideControls() {
    this.showControls = false;
  }

  resetDuration() {
    this.setDuration(0);
  }
  resetCurrentTime() {
    this.currentTime$.next(0);
  }
  resetSelection() {
    this.indexClick = -1;
  }

  changeTime(e) {
    this.currentTime = e.detail.value;
  }
  focusTime(e) {
    this.updateTime = false;
  }
  blurTime(e) {
    this.currentMix.currentTime = this.currentTime;
    this.currentTime$.next(this.currentMix.currentTime);
    this.updateTime = true;
  }

  async presentToast(message) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000
    });
    toast.present();
  }

  async presentAlert(index) {
    const alert = await this.alertCtrl.create({
      header: 'Delete',
      subHeader: '',
      message: 'Delete this mix.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Okay',
          handler: () => {
            this.mixerProvider.removeMix(index).then((mixes) => {
              this.mixes = mixes;
            }).catch((error) => {
              this.presentToast(error).then(() => {
              });
            });
          }
        }
      ]
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }
}
