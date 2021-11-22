var positive;
var negative;
var percentage;
var wordFreq;
  
init = function () {
  positive = 0;
  negative = 0;
  percentage = 0;
  wordFreq = [];
}
init();

var Sentiment = require('sentiment');
var sentiment = new Sentiment();

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var recognition = new SpeechRecognition();
var speechRecognitionList = new SpeechGrammarList();
recognition.grammars = speechRecognitionList;
recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

var diagnostic = document.querySelector('.diagnostic');
var positiveDOM = document.querySelector('.positive');
var negativeDOM = document.querySelector('.negative');
var progressBarDOM = document.querySelector('.progress-bar');

document.querySelector('.speak').onclick = function() {

  // Start animation on UI
  console.log('Started listening...');
  document.querySelector('.waves').style.height = '48px';
  document.querySelector('#wave1').classList.add("wave-normal");
  document.querySelector('#wave2').classList.add("wave-loud");
  document.querySelector('#wave3').classList.add("wave-quiet");
  document.querySelector('#wave4').classList.add("wave-quiet");
  document.querySelector('#wave5').classList.add("wave-loud");
  document.querySelector('#wave6').classList.add("wave-normal");
  recognition.start();
}

// After speech input is completed
recognition.onresult = function(event) {
  var speechintotext = event.results[0][0].transcript;
  diagnostic.textContent = "\"" + speechintotext + "\"";
  console.log('Confidence: ' + event.results[0][0].confidence);
  
  // Initiate sentiment analysis
  var result = sentiment.analyze(speechintotext);
  console.dir(result);

  // Update cumulative positive & negative values
  result.calculation.forEach(getWordRating);
  function getWordRating(value) {
    for (var i in value) {
      console.log('Key is ' + i);
      
      var addNew = 'true';
      //for each key in wordFreq, if its not there add key and value, if found, increment count
      for (j=0 ; j<wordFreq.length ; j++) {
        // console.log('~~ wordFreq length:' + wordFreq.length + ', checking with ' + wordFreq[j,0]);
        if (i == wordFreq[j][0]) {
          wordFreq[j][1] = wordFreq[j][1] + wordFreq[j][1];
          addNew = 'false';
          // console.log('~~ ' + i + ' matched with ' + wordFreq[j][0] + '. Add new entry is now set to ' + addNew);
          break;
        }
        // console.log('~~ ' + i + ' did not match with ' + wordFreq[j][0]);
      }
      if (addNew == 'true') {
        if (value[i] > 0) {
          wordFreq.push([i, value[i], 'p']);
        }
        else if (value[i] < 0) {
          wordFreq.push([i, -value[i], 'n']);
        }
        // console.log('~~ Since ' + i + ' did not match with any entries, it has been added. wordFreq now looks like: ' + wordFreq);
      }
      // console.log('~~ So wordFreq finally is: ' + wordFreq);

      
      // Add to wordcloud
      anychart.onDocumentReady(function() {
        
        const myCanvasDOM = document.getElementById("my_canvas");

        while (myCanvasDOM.firstChild) {
          myCanvasDOM.removeChild(myCanvasDOM.lastChild);
        }

        // create a tag (word) cloud chart
        var chart = anychart.tagCloud(wordFreq);

        // set a chart title
        // chart.title('15 most spoken languages')
        // set an array of angles at which the words will be laid out
        chart.angles([0])

        // enable a color range
        // chart.colorRange(true);

        // create and configure a color scale.
        var customColorScale = anychart.scales.ordinalColor();
        
        //
        if (wordFreq[0][2] == 'p') {
          customColorScale.colors(["#00c3d5", "#AAAAAA"]);
        }
        else if (wordFreq[0][2] == 'n') {
          customColorScale.colors(["#AAAAAA", "#00c3d5"]);
        }
        //      
        
        // set the color scale as the color scale of the chart
        chart.colorScale(customColorScale);
        // add a color range
        // chart.colorRange().enabled(true);

        // set the color range length
        // chart.colorRange().length('80%');

        chart.container("my_canvas");
        chart.draw();
      });

      if (value[i] > 0) {
        positive += value[i];
        positiveDOM.textContent = positive;
      }
      else if (value[i] < 0) {
        negative += value[i];
        negativeDOM.textContent = (negative * -1);
      }
    }
  }

  // Update progress bar width
  percentage = positive / (positive - negative) * 100;
  console.log(percentage);
  progressBarDOM.style.width = percentage.toString() + '%';
}

recognition.onspeechend = function() {
    // Stop animation on UI
    document.querySelector('.waves').style.height = '0px';
    document.querySelector('#wave1').classList.remove("wave-normal");
    document.querySelector('#wave2').classList.remove("wave-loud");
    document.querySelector('#wave3').classList.remove("wave-quiet");
    document.querySelector('#wave4').classList.remove("wave-quiet");
    document.querySelector('#wave5').classList.remove("wave-loud");
    document.querySelector('#wave6').classList.remove("wave-normal");
    recognition.stop();
    console.log('Stopped listening.');
}

recognition.onerror = function(event) {
  diagnostic.textContent = 'Error occurred in recognition: ' + event.error;
}
