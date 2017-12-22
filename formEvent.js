var chrono = require('chrono-node');
var parse = require('parse-messy-schedule');

function formEvent(info) {
  return new Promise(function(resolve, reject) {
    console.log(info);
    const dates = info.time.map(time=>chrono.parseDate(time));
    const dateStart = dates.reduce((actual,next)=>{
      if (!next) return actual
      return (actual>next)?actual:next
    })
    const dateEnd = dates.reduce((actual,next)=>{
      if (!next) return actual
      return (actual<next)?actual:next
    })
    const attendees = info.email.map(email=>({'email':email}));
    attendees.concat(info.people.map(person=>({'displayName':person})));
    // const recurrence = parse(info.time.join(', '));
    // if (recurrence._every.every) {
    //
    // }
    // console.log("RECURRENCE",recurrence,"\n\n\n\n\n");
    var event = {
      'summary': info.raw.split(' ').slice(0,5).join(' '),
      'location': info.place.join(', '),
      'start': {
        'dateTime': dateStart,
        'timeZone': 'America/Los_Angeles'
      },
      'end': {
        'dateTime': dateEnd,
        'timeZone': 'America/Los_Angeles'
      },
      // 'recurrence': ['RRULE:FREQ=DAILY;COUNT=2'],
      'attendees': attendees,
      'description': info.raw,
      'attachments': [],
      'reminders': {
        'useDefault': false,
        'overrides': [
          {
            'method': 'email',
            'minutes': 24 * 60
          }, {
            'method': 'popup',
            'minutes': 10
          }
        ]
      }
    };
    // if (err) {
    //   reject(err)
    // }
    resolve(event)
  });
}

module.exports = formEvent
