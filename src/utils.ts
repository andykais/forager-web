import * as date_fns from 'date-fns'

export function format_date(date: Date) {
  
  return date_fns.format(date, 'MM/dd/yyyy')
}
