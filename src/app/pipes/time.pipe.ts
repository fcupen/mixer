import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {

  transform(value: number): Date {
    const date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    if (value === 0) {
      date.setMilliseconds(0);
    }
    date.setSeconds(value);
    return date;
  }

}
