import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
  name: 'luxonDate'
})
export class LuxonDatePipe implements PipeTransform {
  transform(value: string | Date, format: string = 'yyyy LLL dd, HH:mm'): string {
    if (!value) return '';

    const date = typeof value === 'string' ? DateTime.fromISO(value) : DateTime.fromJSDate(value);
    return date.toFormat(format);
  }
}