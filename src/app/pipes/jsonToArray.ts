import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'jsonToArray'
})
export class JsonToArrayPipe implements PipeTransform {

  transform(json: any): Array<any> {
    const array = [];

    if (json && typeof json === 'object') {
      for (const key in json) {
        if (Object.prototype.hasOwnProperty.call(json, key)) {
          const value = json[key];
          array.push({
            key,
            value
          });
        }
      }
    }
    return array;
  }

}
