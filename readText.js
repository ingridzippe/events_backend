var request = require("request");
// const test1 = "Please come see Betsy for $5 jump through a ring of fire! Thursay the 18th of January he will attempt this daring feat at 221 7th St, San Francisco! Paul and Ross will also come.";

function readText(textRaw) {
  return new Promise(function(resolve, reject) {
    const text = textRaw.split('\n').join(' ')
    console.log(text);
    var options = {
      method: 'POST',
      url: 'http://api.meaningcloud.com/topics-2.0',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      form: {
        key: '353eec81498299ab90b21b50cf50007b',
        lang: 'en',
        txt: text,
        ilang: 'en',
        tt: 'etm',
        uw: 'y',
      }
    };
    request(options, function(error, response, body) {
      body = JSON.parse(body);
      if (error) {
        reject(error)
      }
      let info = {};
      if (body.money_expression_list && body.money_expression_list.length !== 0) {
        const money = body.money_expression_list.map(obj=>obj.amount_form);
        // console.log(body.money_expression_list);
        info.money = money;
      }
      if (body.time_expression_list && body.time_expression_list.length !== 0) {
        const time = [];
        body.time_expression_list.forEach(obj => time.push(obj.form));
        info.time = time;
      }
      const i_list = [];
      // console.log(i_list);

      let place = [];
      let people = [];
      // let phone = [];
      body.entity_list.forEach(obj => {
        if (obj.sementity.type.split('>')[1] === "Location") {
          place.push(obj.form)
        }
        if (obj.sementity.type.split('>')[1] === "Person") {
          people.push(obj.form);
        }
        // if (obj.sementity.type.split('>')[1] === "phone") {
        //   phone.push(obj.form);
        // }
      })
      people = people.filter((p, i) => people[i - 1] !== p);
      place = place.filter((p, i) => place[i - 1] !== p);
      place = place.filter((p, index) => {
        for (var i = 0; i < people.length; i++) {
          if (p === people[i]) {
            return false
          }
        }
        return true
      });
      info.people = people;
      info.place = place;
      // info.phone = place;
      if (text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)) {
        info.email = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
      }
      if (text.match(/(([a-zA-Z0-9._-])+-[a-zA-Z0-9._-]+-[a-zA-Z0-9._-]+)/gi)) {
        info.phone = text.match(/(([a-zA-Z0-9._-])+-[a-zA-Z0-9._-]+-[a-zA-Z0-9._-]+)/gi);
      }
      info.raw = text;
      // console.log(info);
      resolve(info);

    });
  })
}

module.exports = readText;
