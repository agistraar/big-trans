function getAbsoluteMonths(momentDate: moment.Moment) {
  var months = Number(momentDate.format('MM'));
  var years = Number(momentDate.format('YYYY'));
  return months + years * 12;
}

export { getAbsoluteMonths };
