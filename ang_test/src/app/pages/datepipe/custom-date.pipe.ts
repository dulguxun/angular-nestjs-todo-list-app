import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}
//directive
  transform(value: any): string {
    if (!value) return '';

    const today = new Date();
    const date = new Date(value);

    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return this.datePipe.transform(value, 'shortTime')!;
    } else {
      return this.datePipe.transform(value, 'short')!;
    }
  }
}
