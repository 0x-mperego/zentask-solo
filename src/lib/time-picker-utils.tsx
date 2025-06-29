import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * *******************************************************************
 * From: https://github.com/donavon/date-fns-tz/blob/master/src/formatInTimeZone.ts
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2021 Donavon West
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
* *******************************************************************
*/

import { format, toDate } from "date-fns"

/**
 * @name formatInTimeZone
 * @copyright 2021 Donavon West
 * @license MIT
 *
 * @description
 * Return the formatted date string in the given time zone.
 *
 * @param {Date|number|string} date - the original date
 * @param {string} timeZone - the target time zone
 * @param {string} formatStr - the string of tokens
 *
 * @returns {string} the formatted date string
 *
 * @example
 * // Represent 18 October 2022 in Eastern Time:
 * formatInTimeZone(new Date('2022-10-18T10:00:00.000Z'), 'America/New_York', 'yyyy-MM-dd HH:mm:ssXXX')
 * //=> '2022-10-18 06:00:00-04:00'
 */
export function formatInTimeZone(
  date: Date | number | string,
  timeZone: string,
  formatStr: string,
) {
  // This is not an exact implementation of the date-fns-tz formatInTimeZone function.
  // Instead of using the Intl.DateTimeFormat API, it uses the toLocaleString method.
  // The reason for this is that the Intl.DateTimeFormat API is not available in all environments.
  // For example, it is not available in React Native.
  // This implementation is not as robust as the original, but it is sufficient for our purposes.
  // For more information, see the following links:
  // https://github.com/date-fns/date-fns-tz/issues/186
  // https://github.com/donavon/date-fns-tz/blob/master/src/formatInTimeZone.ts
  const options: Intl.DateTimeFormatOptions = {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }

  const dateInTimeZone = toDate(date).toLocaleString("en-US", options)

  return format(new Date(dateInTimeZone), formatStr)
} 