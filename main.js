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

var composition = {
  A4Frequency: 440,
  length: 32,
  notes: null,
  octaves: 9
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

function appendNoteArray() {
  for (let octave = 1; octave <= composition.octaves; octave++) {
    for (let wave = 0; wave < document.getElementsByClassName('waveType').length; wave++) {
      for (let halfStep = 0; halfStep < 12; halfStep++) {
        composition.notes[octave][wave][halfStep].push(0);
      }
    }
  }
}

function setElements() {
  var el = '';
  for (let wave = 0; wave < document.getElementsByClassName('waveType').length; wave++) {
    el += '<section class="wave">';
    for (let halfStep = 0; halfStep < 12; halfStep++) {
      el += '<div class="halfStepRow">';
      for (let button = 0; button < composition.notes[1][0][0].length; button++) {
        el += '<button class="guiButton"></button>';
      }
      el += '</div>';
    }
    el += '</section>';
  }
  document.getElementById('guiWindow').innerHTML += el;
}

function addOctaveEventListeners() {
  var buttons = document.getElementsByClassName('drawOctaveButton');
  for (let index = 0; index < buttons.length; index++) {
    buttons[index].addEventListener('click', function() { drawOctave(this, buttons.length - index + 1); });
  }
}

window.onload = function() {
  composition.notes = setNoteArray();
  setElements();
  addOctaveEventListeners();
}

function drawOctave(element, octave) {
  var activeButton = document.getElementById('active');
  if (activeButton) {
    activeButton.removeAttribute('id');
  }
  element.setAttribute('id', 'active');
  // TODO: ADD LOADING OF OCTAVE ARRAY
}

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
// // TODO: Finsh here!
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
// // TODO: Finish here!
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
// // TODO: Finish here!
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
//   } else {
//     console.warn('compositionTimer already active; playComposition() warning!')
//   }
// }

// function stopComposition() {
// // TODO: Finish here!
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

// function getNoteFrequencies(frequencyOfA4) {
//   /** Note name order is:
//    * "C", "CD", "D", "DE", "E"
//    * "F", "FG", "G", "GA", "A", "AB", "B";
//    * Double letters, such as "CD" and "DE" represent
//    * Sharps and Flats, C# / Db, and D# / Eb respectively.
//    * Note: All credits go to
//    * https://pages.mtu.edu/~suits/notefreqs.html */
//   var arr = new Object();
//   for (let octave = 0; octave < 9; octave++) {
//     arr[octave + 1] = new Array();
//     for (let halfStep = 0; halfStep < 12; halfStep++) {
//       arr[octave + 1][halfStep] = frequencyOfA4 * Math.pow(Math.pow(2, 1/12), -57 + halfStep + octave * 12)
//     }
//   }
//   return arr;
// }
