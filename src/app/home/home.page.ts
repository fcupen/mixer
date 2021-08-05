import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonRouterOutlet, LoadingController, ModalController, ToastController } from '@ionic/angular';
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
  playMix(index) {
    if (index !== this.indexClick) {
      this.stopMix();
      this.indexClick = index;
      this.currentMix = new Audio(this.mixes[index].data);
      this.currentMix.play();
      this.currentMix.addEventListener('ended', () => {
        this.indexClick = -1;
      });
    } else {
      this.stopMix();
    }
  }

  stopMix() {
    this.currentMix.pause();
    this.indexClick = -1;
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
