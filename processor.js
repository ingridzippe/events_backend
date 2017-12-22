const readText = require('./readText');
const readImage = require('./readImage');
const formEvent = require('./formEvent');
// const sendEvent = require('./sendEvent');
//THIS IS WHATEVER FILE YOU WOULD LIKE TO PROCESS
const fileName = './images/vevo.jpg';

function processor(file) {
  return new Promise(function(resolve,reject){
    readImage(file)
    .then(txt=>{
      //FILE TURNED INTO RAW TEXT
      console.log("Image read into text");
      return readText(txt)
    }).then(info=>{
      //TEXT TURNED INTO INFO OBJECT
      console.log('Text parsed into information');
      return formEvent(info)
    }).then(evt=>{
      //INFO BECOMES EVENT OBJ FOR GOOGLE
      console.log("Event created");
      resolve(evt)
    }).catch(err=>{
      console.log("ERR",err);
      reject(err)
    });
  })
}

module.exports = processor
