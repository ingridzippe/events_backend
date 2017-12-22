const Vision = require('@google-cloud/vision');
const vision = Vision();

function textDetect(file){
  let detections;
  return vision.textDetection({content: file})
  .then((results) => {
    detections = results[0].fullTextAnnotation.text;
    return detections
  })
  .catch((err) => {
    console.error('ERROR:', err);
  });
}

module.exports = textDetect
