// TODO: Debug problem with sound not being produced after a while (at high bpm; >= 150, AND: it sometimes comes back alive (at 150, at least))

'use strict';

const SOLARIZED_DARK = {
  COLOR: '#fff',
  MAINHEAD_BG: '#002C39',
  NAVHEAD_BG: '#1A343C',
  NAV_BUTTON_INACTIVE_BG: '#00212B',
  NAV_BUTTON_HOVER_BG: '#003440',
  NAV_BUTTON_ACTIVE_BG: '#005A6F',
  TIMEHEAD_BG: '#002B37',
  TIMEBODY_BG: '#004052',
  MAINBODY_BG: '#002B36',
  GUI_BUTTON_INACTIVE_BG: '#073642',
  SVG_BG: '#00212B',
  MAINFOOT: '#00212B'
}

const COLOR_LEGEND = ['white', 'lime', 'red'];
for (let index = 0; index < COLOR_LEGEND.length; index++) {
  COLOR_LEGEND[index] = ' ' + COLOR_LEGEND[index];
}

var composition = {
  A5Frequency: 440,
  bpm: 300,
  currentOctave: null,
  length: 1,
  loopStatus: true,
  notes: null,
  octaves: 9,
  timer: null
}

class Note {
  constructor(beatLength = 1, frequency = 440, wave = "sine") {
      this.beatLength = beatLength;
      this.frequency = frequency;
      this.wave = wave;
  }
}
const noteFrequencies = getNoteFrequencies(composition.A5Frequency);

function getUserSettingsInput() {
  // composition.bpm = prompt('Please enter the bpm of your composition!');
  // composition.length = prompt('How many beats (bars is probably correct term and method) long will it be?')
}

function getNoteFrequencies(frequencyOfA4) {
  /**
   * Note name order is:
   * Low Frequencies
   * "C", "CD", "D", "DE", "E"
   * "F", "FG", "G", "GA", "A", "AB", "B";
   * High Frequencies
   *
   * Double letters, such as "CD" and "DE" represent
   * Sharps and Flats, C# / Db, and D# / Eb respectively.
   * Note: All credit goes to
   * https://pages.mtu.edu/~suits/notefreqs.html
   *
   * This frequency graph is also modeled by
   * f(h) = 440(2^(x/12))
   */

  const HALF_STEP_FREQUENCY_RATIO = Math.pow(2, 1/12);
  var arr = new Object();
  for (let octave = 0; octave < 9; octave++) {
    arr[octave + 1] = new Array();
    for (let halfStep = 0; halfStep < 12; halfStep++) {
      arr[octave + 1][halfStep] = frequencyOfA4 * Math.pow(HALF_STEP_FREQUENCY_RATIO, -57 + octave * 12 - halfStep + 11)
    }
  }
  return arr;
}

function setNoteArray() {
  var arr = {};
  for (let octave = 1; octave <= composition.octaves; octave++) {
    arr[octave] = [];
    for (let wave = 0; wave < document.getElementsByClassName('waveType').length; wave++) {
      arr[octave][wave] = [];
      for (let halfStep = 0; halfStep < 12; halfStep++) {
        arr[octave][wave][halfStep] = [];
        for (let time = 0; time < composition.length; time++) {
          arr[octave][wave][halfStep][time] = 0;
        }
      }
    }
  }
  return arr;
}

function appendNoteArray(count = 1) {
  // TODO: Enable increasing length of composition time
  console.warn('appendNoteArray has become WIP, do not use this!');
  return;
  if(typeof(count) === 'object') {
    count = 1;
  }
  var el = '';
  var arrayPushAmount = []
  for (let index = 0; index < count; index++) {
    el += `<button class="guiButton" style="left: ${(composition.length + index) * 20}px;"</button>`;
    arrayPushAmount.push(0);
  }
  composition.length += count;

  for (let octave = 1; octave <= composition.octaves; octave++) {
    for (let wave = 0; wave < document.getElementsByClassName('waveType').length; wave++) {
      for (let halfStep = 0; halfStep < 12; halfStep++) {
        composition.notes[octave][wave][halfStep].push(...arrayPushAmount);
      }
    }
  }

  for (let wave = 0; wave < document.getElementsByClassName('waveType').length; wave++) {
    for (let halfStep = 0; halfStep < 12; halfStep++) {
      document.getElementsByClassName('wave')[wave].children[halfStep].innerHTML += el;
    }
  }
}

function initializeElements() {
  var text = '';
  var letters = ["B", "A#/Bb", "A", "G#/Ab", "G", "G#/Fb", "F", "E", "D#/Eb", "D", "C#/Db", "C"];
  for (let letter = 0; letter < letters.length; letter++) {
    text += `<aside class="waveLabel">${letters[letter]}</aside>`;
  }
  var waves = document.getElementsByClassName('waveType');
  for (let wave = 0; wave < waves.length; wave++) {
    waves[wave].innerHTML += text;
  }

  var el = '';
  for (let wave = 0; wave < document.getElementsByClassName('waveType').length; wave++) {
    el += '<section class="wave">';
    for (let halfStep = 0; halfStep < 12; halfStep++) {
      el += '<div class="halfStepRow">';
      for (let button = 0; button < composition.notes[1][0][0].length; button++) {
        el += `<button class="guiButton" style="left: ${button * 20}px;"></button>`;
      }
      el += '</div>';
    }
    el += '</section>';
  }
  document.getElementById('guiWindow').innerHTML += el;

  // document.getElementById('guiWindow').style.height = document.getElementsByClassName('waveType').length * 240 + 20 + 'px';
}

function toggleGuiButtonState(element, wave, halfStep, time) {
  /** Changes value in composiiton.notes */
  const value = composition.notes[composition.currentOctave][wave][halfStep][time];
  if (value < COLOR_LEGEND.length) {
    element.className = 'guiButton' + COLOR_LEGEND[composition.notes[composition.currentOctave][wave][halfStep][time]];
    composition.notes[composition.currentOctave][wave][halfStep][time]++;
  } else if (value === COLOR_LEGEND.length) {
    composition.notes[composition.currentOctave][wave][halfStep][time] = 0;
    element.className = 'guiButton';
  }
}

function guiButtonEventHandler(input, element) {
  toggleGuiButtonState(element, element.wave, element.halfStep, element.time);

  // console.log(input);
  // console.log(element);
  // console.warn('wave: ' + element.wave);
  // console.warn('halfStep: ' + element.halfStep);
  // console.warn('time: ' + element.time);
  // console.log(composition.notes[composition.currentOctave][element.wave][element.halfStep][element.time]);
}

function playNote(note, time) {
  // if (typeof(audioCtx) === 'undefined') {
  //   window.audioCtx = new AudioContext();
  // }
  var audioCtx = new AudioContext();
  // if (note.beatLength > 0) {
        var duration = (60000 / composition.bpm) * note.beatLength; // Milliseconds
        var attack = duration / 8; // 12.5% of duration, in milliseconds
        var decay = duration / 8; // 12.5% of duration, in milliseconds

        var gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + attack / 1000);
    setTimeout(
      () => {
        gain.gain.setValueAtTime(1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + decay / 1000);
      }, duration - decay
    );
        gain.connect(audioCtx.destination);

        var osc = audioCtx.createOscillator();
        osc.frequency.value = note.frequency;
        osc.type = note.wave;
        osc.connect(gain);
        osc.start(0);

        setTimeout(() => {
                gain.disconnect(audioCtx.destination);
                osc.stop(0);
                osc.disconnect(gain);
            }, duration
        );
    // }
}

function playComposition() {
  // TODO: Enable playing of music
  // console.warn('playComposition is WIP, do not use this!');
  // return;
  /** Toggles play button */
  document.getElementsByClassName('buttonText')[0].innerHTML = 'Stop';
  document.getElementsByTagName('path')[0].setAttribute('d', 'm10,10 l10,0 l0,30 l-10,0 z m20,0 l10,0 l0,30 l-10,0 z');
  document.getElementById('playButton').removeEventListener('click', playComposition);
  document.getElementById('playButton').addEventListener('click', stopComposition);

  var noteArr = [];
  for (let time = 0; time < composition.length; time++) {
    noteArr[time] = [];
    for (let octave = 1; octave <= composition.octaves; octave++) {
      for (let wave = 0; wave < document.getElementsByClassName('waveType').length; wave++) {
        for (let halfStep = 0; halfStep < 12; halfStep++) {
          if (composition.notes[octave][wave][halfStep][time]) {
            noteArr[time].push(new Note(1, noteFrequencies[octave][halfStep], document.getElementsByClassName('waveType')[wave].childNodes[0].nodeValue.toLowerCase()))
          }
        }
      }
    }
  }

  var currentTime = 0;
  composition.timer = setInterval(
    () => {
      if(noteArr[currentTime].length) {
        noteArr[currentTime].forEach(
            (note) => {
                playNote(note, currentTime);
            }
        );
      }
      currentTime++;
      if (noteArr.length === currentTime) {
        if (composition.loopStatus === false) {
          clearInterval(composition.timer);
          console.log('Finished Composition Play!');
          stopComposition(false);
          return;
        } else if (composition.loopStatus === true) {
          currentTime = 0;
          console.log('Replaying Composition!')
        }
      }
      console.log('Current Time: ' + currentTime);
    }, 60000 / composition.bpm
  );
  return noteArr;
}

function stopComposition(calledByUser = true) {
  /** Toggles pause button */
  document.getElementsByClassName('buttonText')[0].innerHTML = 'Play';
  document.getElementsByTagName('path')[0].setAttribute('d', 'm10,10 l0,30 l30,-15 z');
  document.getElementById('playButton').removeEventListener('click', stopComposition);
  document.getElementById('playButton').addEventListener('click', playComposition);
  clearInterval(composition.timer);
  composition.timer = null;
  if (calledByUser) {
    console.log('Composition Stopped Playing!');
  }
}

function togglePlayLoop() {
  // console.warn('togglePlayLoop is WIP, do not use this!');
  // return;
  switch(composition.loopStatus) {
    case false:
      composition.loopStatus = true;
      var button = document.getElementById('loopButton');
      if (button.childElementCount > 1) {
        button.lastChild.remove();
      }
      break;
    case true:
      composition.loopStatus = false;
      document.getElementById('loopButton').innerHTML += '<path class="inactive" d="m5,10 q-4,-5 -2,-7 q2,-2 7,2 l15,15 l15,-15 q5,-4 7,-2 q2,2 -2,7 l-15,15 l15,15 q4,5 2,7 q-2,2 -7,-2 l-15,-15 l-15,15 q-5,4 -7,2 q-2,-2 2,-7 l15,-15 z">';
      break;
  }
}

function saveComposition() {
  // TODO: Enable saving of music
  console.warn('saveComposition is WIP, do not use this!');
  return;
}

function loadComposition() {
  // TODO: Enable loading of music
  console.warn('loadComposition is WIP, do not use this!');
  return;
}

function initializeEventListeners() {
  /** Octave switching event listeners */
  var buttons = document.getElementsByClassName('drawOctaveButton');
  for (let index = 0; index < buttons.length; index++) {
    buttons[index].addEventListener('click', function() { drawOctave(this, buttons.length - index + 1); });
  }

  /** Event listeners of buttons function */
  var buttons = document.getElementsByClassName('guiButton');
  for (let index = 0; index < buttons.length; index++) {
    buttons[index].addEventListener('click', function(input) { guiButtonEventHandler(input, this); } );
    buttons[index].wave = Math.floor(index / 12 / composition.length);
    buttons[index].halfStep = Math.floor(index / composition.length) - buttons[index].wave * 12;
    buttons[index].time = index % composition.length;
  }

  /** SVG event listeners */
  document.getElementById('playButton').addEventListener('click', playComposition);
  document.getElementById('loopButton').addEventListener('click', togglePlayLoop);
  document.getElementById('saveButton').addEventListener('click', saveComposition);
  document.getElementById('loadButton').addEventListener('click', loadComposition);
  document.getElementById('timeButton').addEventListener('click', appendNoteArray);
}

window.onload = function() {
  getUserSettingsInput();
  composition.notes = setNoteArray();
  initializeElements();
  initializeEventListeners();
  drawOctave(document.getElementsByClassName('drawOctaveButton')[4], 5);
  document.addEventListener('keydown', eventHandler);
  togglePlayLoop();
}

function drawOctave(element, octave) {
  var activeButton = document.getElementById('active');
  if (activeButton) {
    activeButton.removeAttribute('id');
  }
  element.setAttribute('id', 'active');
  composition.currentOctave = parseInt(document.getElementById('active').innerHTML[0]);

  /** Reloads buttons styles, where they are not the same as what it should change to from composition.currentOctave */
  var buttons = document.getElementsByClassName('guiButton');
  for (let index = 0; index < composition.length * 12 * document.getElementsByClassName('waveType').length; index++) {
    var buttonClass = buttons[index].className;
    var wave = Math.floor(index / 12 / composition.length);
    var halfStep = Math.floor(index / composition.length) - buttons[index].wave * 12;
    var time = index % composition.length;
    var expectedClass = composition.notes[composition.currentOctave][wave][halfStep][time] > 0 ? 'guiButton' + COLOR_LEGEND[composition.notes[composition.currentOctave][wave][halfStep][time] - 1] : 'guiButton';
    if (buttonClass !== expectedClass) {
      buttons[index].classList = expectedClass;
    }
  }
}

function eventHandler(input) {
  // console.log(input);
  switch(input.key.toUpperCase()) {
    case 'TAB':
      var buttons = document.getElementsByClassName('drawOctaveButton');
      if (input.shiftKey === false) {
        var nextElementSibling = document.getElementById('active').nextElementSibling;
        if (nextElementSibling) {
          nextElementSibling.click();
        } else {
          buttons[0].click();
        }
      } else if (input.shiftKey === true) {
        var previousElementSibling = document.getElementById('active').previousElementSibling;
        if (previousElementSibling.tagName.toUpperCase() === 'BUTTON') {
          previousElementSibling.click();
        } else {
          buttons[buttons.length - 1].click();
        }
      }
  }
}

/*
// class Note {
//     constructor(beatStart, beatLength = 1, frequency = 440, wave = "sine") {
//         this.beatStart = beatStart;
//         this.beatLength = beatLength;
//         this.frequency = frequency;
//         this.wave = wave;
//     }
// }
// const bpm = 60;
var audioCtx = new AudioContext();
note1 = new Note(0);
note2 = new Note(1);
note3 = new Note(3);
note4 = new Note(0);

playNotes(60, [note1, note2, note3, note4]);

function playNotes(bpm, notes) {
  var noteArr = [];
  notes.forEach((note) => {
      if (noteArr[note.beatStart] === undefined) {
        noteArr[note.beatStart] = [];
            }
      noteArr[note.beatStart].push(note);
            console.log(noteArr);
      }
  );

  var currentTime = 0;

  var timer = setInterval(() => {
      if(noteArr[currentTime]) {
                noteArr[currentTime].forEach(
                    (note) => {
                        playNote(note);
                    }
                );
            }
            currentTime++;
            if (noteArr.length === currentTime) {
                clearInterval(timer);
            }
      console.log(currentTime);
    }, 1000
  );
}

function playNote(note) {
  if (note.beatLength > 0) {
        var duration = (60000 / bpm) * note.beatLength; // Milliseconds
        var attack = duration / 8; // 12.5% of duration, in milliseconds
        var decay = duration / 8; // 12.5% of duration, in milliseconds

        var gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + attack / 1000);
    setTimeout(
      () => {
        gain.gain.setValueAtTime(1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + decay / 1000);
      }, duration - decay
    );
        gain.connect(audioCtx.destination);

        var osc = audioCtx.createOscillator();
        osc.frequency.value = note.frequency;
        osc.type = note.wave;
        osc.connect(gain);
        osc.start(0);

        setTimeout(() => {
                gain.disconnect(audioCtx.destination);
                osc.stop(0);
                osc.disconnect(gain);
            }, duration
        );
    }
}
*/
























// // FIX: Notes in multiple octaves not stopping playing.
// const COMPOSITIONDURATION = 32;
// const noteFrequencies = getNoteFrequencies(440);
// const WAVETYPES = ['sine'/* , 'square', 'sawtooth', 'triangle' */];
// const composition = appendCompositionDuration(-1);
// // const composition = createNoteArray();
// var currentOctave;
// const bpm = 60;
// //** Note: oneBarMs is for one quarter note! (1/4 bar) */
// const oneBarMs = 1000 / (bpm / 60) / 4;
// // const bps = bpm/60;
// // const bpmMs = 1000 / bps;
// var compositionTimer = null;
// var frequencies = setFrequencies();
// var timerCurrentDuration = 0;
// var timerLoop = false;

// function appendCompositionDuration(barCount = 1) {
//   if (barCount === -1) {
//     //** Initialize composition */
//     var obj = new Object();
//     for (let octave = 1; octave <= 9; octave++) {
//       obj[octave] = new Array();
//       for (let waveTypes = 0; waveTypes < WAVETYPES.length; waveTypes++) {
//         obj[octave][waveTypes] = new Array();
//         for (let time = 0; time < COMPOSITIONDURATION; time++) {
//           obj[octave][waveTypes][time] = new Array();
//           for (let halfStep = 0; halfStep < 12; halfStep++) {
//             obj[octave][waveTypes][time][halfStep] = 0;
//           }
//         }
//       }
//     }
//     return obj;
//   } else if (0 < barCount && composition) {
//     //** Appends to composition */
//     for (let octave = 1; octave <= 9; octave++) {
//       for (let waveTypes = 0; waveTypes < WAVETYPES.length; waveTypes++) {
//         const compositionLength = composition[octave][waveTypes].length;
//         composition[octave][waveTypes][compositionLength] = new Array();
//         for (let halfStep = 0; halfStep < 12; halfStep++) {
//           composition[octave][waveTypes][compositionLength][halfStep] = 0;
//         }
//       }
//     }
//   } else {
//     console.warn('appendCompositionDuration() warning!');
//     return;
//   }
// }

// function styleDocument() {
//   if (document.styleSheets[0].cssRules) {
//     var cssRules = document.styleSheets[0].cssRules;
//   } else if (document.styleSheets[0].rules) {
//     var cssRules = document.styleSheets[0].rules;
//   } else {
//     console.warn('styleDocument() warning!');
//     return;
//   }

//   //** Width of GUI Button Containers, for Overflow Scroll */
//   for (let i = 0; i < cssRules.length; i++) {
//     if (cssRules[i].selectorText === '#mainWrapper #guiWindow .waveType') {
//       cssRules[i].style.width = `${document.getElementsByClassName('waveType')[0].children.length * 20}px`;
//     }
//   }

//   //** Height of some stuff, for dynamic-ness */
//   document.getElementById('legend').style.height = window.getComputedStyle(document.getElementById('guiWindow')).height;
//   document.getElementById('waveTypeLabel').style.height = window.getComputedStyle(document.getElementById('guiWindow')).height;
//   //** Side Headers that tell type of wave */
//   for (let index = 0; index < WAVETYPES.length; index++) {
//     document.getElementById('waveTypeLabel').innerHTML += `<h style="top:${Number(window.getComputedStyle(document.getElementById('timelineNumbers')).height.replace('px', '')) + Number(window.getComputedStyle(document.getElementsByClassName('waveType')[0]).height.replace('px', '')) * index + 'px'};">
//     ${WAVETYPES[index]}
//     </h>`;
//   }

//   //** SVG Button Width and Height Attributes */
//   var buttons = document.getElementsByClassName('svgButton');
//   for (let index = 0; index < buttons.length; index++) {
//     buttons[index].setAttribute('width', 50);
//     buttons[index].setAttribute('height', 50);
//   }
// }

// function drawElements() {
//   var waveCounter = 0;
//   var el = '';
//   for (const waveType of WAVETYPES) {
//     el += '<article class="waveType">';
//     for (let time = 0; time < COMPOSITIONDURATION; time++) {
//       el += `<div class="boxColumn" style="left:${time*20}px">`;
//       for (let halfStep = 0; halfStep < 12; halfStep++) {
//         el += `<div class="${waveType}Wave wave" onclick="changeNote('${waveCounter}', ${halfStep}, ${time})"></div>`;
//       }
//       el += '</div>';
//     }
//     el += '</article>';
//     waveCounter++;
//   }
//   document.getElementById('guiWindow').innerHTML += el;
// }

// function makeUndefined(el) {
//   el.removeAttribute('style');
// }

// function makeWhite(el) {
//   el.setAttribute('style', 'background-color: #fff;');
// }

// function makeLime(el) {
//   el.setAttribute('style', 'background-color: #0f0;');
// }

// function changeNote(waveIndex, halfStep, time) {
//   var note = document.getElementsByClassName(WAVETYPES[waveIndex] + 'Wave');
//   const currentNoteIndex = halfStep + time * 12;
//   const currentNote = note[currentNoteIndex];
//   const nextNote = note[currentNoteIndex + 12];

//   if (!currentNote.hasAttribute('style')) {
//     //** Turns white */
//     makeWhite(currentNote);
//     composition[currentOctave][waveIndex][time][halfStep] = 1;
//   } else if (currentNote.getAttribute('style') === 'background-color: #fff;') {
//     if (nextNote === undefined || !nextNote.hasAttribute('style')) {
//       //** Turns undefined */
//       makeUndefined(currentNote);
//       composition[currentOctave][waveIndex][time][halfStep] = 0;
//     } else if (nextNote.hasAttribute('style')) {
//       //** Turns lime */
//       makeLime(currentNote);
//       composition[currentOctave][waveIndex][time][halfStep] = 2;
//     } else {
//       console.warn(`changeNote(${waveIndex}, ${halfStep}, ${time} warning!)`);
//       return;
//     }
//   } else if (currentNote.getAttribute('style') === 'background-color: #0f0;') {
//     //** Turns undefined */
//     makeUndefined(currentNote);
//     composition[currentOctave][waveIndex][time][halfStep] = 0;
//   } else {
//     console.warn(`changeNote(${waveIndex}, ${halfStep}, ${time} warning!)`);
//     return;
//   }
// }

// /* function changeNote(wave, halfStep, time, waveIndex) {
//   var note = document.getElementsByClassName(wave);
//   if (!note[halfStep + time * 12].getAttribute('style')) {
//     note[halfStep + time * 12].setAttribute('style','background-color: #fff');
//     composition[currentOctave][waveIndex][time][halfStep] = 1;
//   } else if (note[halfStep + time * 12].getAttribute('style')) {
//     note[halfStep + time * 12].removeAttribute('style');
//     composition[currentOctave][waveIndex][time][halfStep] = 0;
//   } else {
//     console.warn(`changeNote(${wave}, ${halfStep}, ${time}) warning!`);
//     return;
//   }
// } */

// function switchOctave(octave) {
//   currentOctave = octave;
//   for (const el of document.getElementsByClassName('octaveChangeButton')) {
//     /** Visible: #005A6F or rgb(0, 90, 111)
//      * Hidden: #00212B or rgb(0, 33, 43) */
//     if (el.getAttribute('style')) {
//       el.removeAttribute('style');
//       break;
//     }
//   }
//   document.getElementsByClassName('octaveChangeButton')[currentOctave - 1].setAttribute('style', 'background-color: #005A6F');

//   var el = document.getElementsByClassName('wave');
//   for (let waveTypes = 0; waveTypes < WAVETYPES.length; waveTypes++) {
//     for (let time = 0; time < COMPOSITIONDURATION; time++) {
//       for (let halfStep = 0; halfStep < 12; halfStep++) {
//         if (composition[currentOctave][waveTypes][time][halfStep] === 0 && el[el.length / WAVETYPES.length * waveTypes + halfStep + time * 12].getAttribute('style')) {
//           /** Change box color */
//           el[el.length / WAVETYPES.length * waveTypes + halfStep + time * 12].removeAttribute('style');
//         } else if (composition[currentOctave][waveTypes][time][halfStep] === 1 && !el[el.length / WAVETYPES.length * waveTypes + halfStep + time * 12].getAttribute('style')) {
//           changeNote(WAVETYPES[waveTypes] + 'Wave', halfStep, time, waveTypes);
//         }
//       }
//     }
//   }
// }

// function setFrequencies() {
// // TODO: (Finish here!)
//   if (!frequencies) {
//     return new Object();
//   } else if (frequencies) {
//     for (let waveType = 0; waveType < WAVETYPES.length; waveType++) {
//       frequencies[WAVETYPES[waveType]] = new Array()
//       for (let octave = 1; octave <= 9; octave++) {
//         for (let halfStep = 0; halfStep < 12; halfStep++) {
//           if (composition[octave][waveType][timerCurrentDuration][halfStep] === 1) {
//             frequencies[WAVETYPES[waveType]][frequencies[WAVETYPES[waveType]].length] = noteFrequencies[octave][halfStep];
//           }
//         }
//       }
//     }
//   }
// }

// function playFrequencies() {
// // TODO: (Finish here!)
//   var audioContext = new AudioContext();
//   var oscillatorArr = new Array();
//   for (const key in frequencies) {
//     if (frequencies.hasOwnProperty(key)) {
//       for (let index = 0; index < frequencies[key].length; index++) {
//         oscillatorArr[oscillatorArr.length] = audioContext.createOscillator();
//         oscillatorArr[oscillatorArr.length - 1].frequency.value = frequencies[key][index];
//         oscillatorArr[oscillatorArr.length - 1].type = key;
//         oscillatorArr[oscillatorArr.length - 1].connect(audioContext.destination);
//         oscillatorArr[oscillatorArr.length - 1].start();
//         // setTimeout(() => {
//         //   oscillatorArr[oscillatorArr.length - 1].stop();
//         //   console.log(oscillatorArr.length);
//         // }, oneBarMs);
//       }
//     }
//   }
//   setTimeout(() => {
//     for (let oscillator = 0; oscillator < oscillatorArr.length; oscillator++) {
//       oscillatorArr[oscillator].stop();
//     }
//     console.log(oscillatorArr);
//   }, oneBarMs)
//   // console.log(oscillatorArr);
// }

// function playComposition() {
// // TODO: (Finish here!)
//   if (compositionTimer === null) {
//     compositionTimer = setInterval(() => {
//       setFrequencies();
//       playFrequencies();
//       timerCurrentDuration++;
//       if (timerCurrentDuration === COMPOSITIONDURATION && timerLoop === false) {
//         stopComposition();
//       } else if (timerCurrentDuration === COMPOSITIONDURATION && timerLoop === true) {
//         timerCurrentDuration = 0;
//       }
//     }, oneBarMs);

//   /** Toggles play button */
//   document.getElementsByClassName('buttonText')[0].innerHTML = 'Stop';
//   document.getElementsByTagName('path')[0].setAttribute('d', 'm10,10 l10,0 l0,30 l-10,0 z m20,0 l10,0 l0,30 l-10,0 z');
//   document.getElementById('playButton').setAttribute('onclick', 'stopComposition();');
//   } else
//     console.warn('compositionTimer already active; playComposition() warning!')
//   }
// }

// function stopComposition() {
// // TODO: (Finish here!)
//   /** Toggles pause button */
//   document.getElementsByClassName('buttonText')[0].innerHTML = 'Play';
//   document.getElementsByTagName('path')[0].setAttribute('d', 'm10,10 l0,30 l30,-15 z');
//   document.getElementById('playButton').setAttribute('onclick', 'playComposition();');

//   if (compositionTimer !== null) {
//     clearInterval(compositionTimer);
//     compositionTimer = null;
//     timerCurrentDuration = 0;
//   } else {
//     console.warn('compostionTimer already inactive; stopComposition() warning!');
//   }
// }

// function togglePlayLoop() {
//   var el = document.getElementById('loopButton');
//   if (el.lastChild.getAttribute('class') === null) {
//     el.innerHTML += '<path class="inactive" d="m5,10 q-4,-5 -2,-7 q2,-2 7,2 l15,15 l15,-15 q5,-4 7,-2 q2,2 -2,7 l-15,15 l15,15 q4,5 2,7 q-2,2 -7,-2 l-15,-15 l-15,15 q-5,4 -7,2 q-2,-2 2,-7 l15,-15 z">';
//     timerLoop = false;
//   } else if (el.lastChild.getAttribute('class') === 'inactive') {
//     el.removeChild(el.lastChild);
//     timerLoop = true;
//   }
// }

// window.onload = function() {
//   drawElements();
//   styleDocument();
//   switchOctave(5);
//   togglePlayLoop();
// }
