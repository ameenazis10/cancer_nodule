/**
 * @typedef {{
 *  age: Age,
 *  smokingHistory: boolean,
 *  cancerHistory: boolean,
 *  spiculatedNodule: boolean,
 *  upperLobe: boolean,
 *  noduleSize: Size,
 *  scanType: ScanType,
 * }}
 */
var Nodule;

/** @enum {string} */
var ScanType = {
  CT: 'DCE CT',
  MRI: 'DCE MRI',
  SPECT: 'SPECT',
  PET: 'PET',
  NONE: 'None',
};

/** @enum {string} */
var Age = {
  THIRTY_FIVE: '35',
  FIFTY_FIVE: '55',
  SEVENTY_FIVE: '75',
};

/** @enum {string} */
var Size = {
  TEN_MM: '10mm',
  TWENTY_MM: '20mm',
  THIRTY_MM: '30mm',
};

var formEl = document.querySelector('form');
var resultEl = document.querySelector('.result');
var probabilityEl = document.querySelector('.probability');
var submitEl = document.querySelector('[type="submit"]');

// Calculate the probability and show it to the user.
formEl.addEventListener('submit', function (event) {
  event.preventDefault();
  var nodule = getNodule(event.target);
  var probability = getCancerProbability(nodule);
  renderProbability(probability);
});

// If the user has already entered a nodule, grey out previous result.
formEl.addEventListener('change', function() {
  if (resultEl.className.indexOf('visible') === -1) {
    return;
  }
  resultEl.className = 'visible dirty result';
});

/**
 * @param {!Form} form
 * @return {Nodule}
 */
function getNodule(form) {
  return {
    age: form.elements['age'].value,
    smokingHistory: yesNoRadioValue(form, 'smoking-history'),
    cancerHistory: yesNoRadioValue(form, 'cancer-history'),
    spiculated: yesNoRadioValue(form, 'spiculated'),
    upperLobe: yesNoRadioValue(form, 'upper-lobe'),
    size: form.elements['size'].value,
    scanType: form.elements['scan-type'].value,
  };
}

/**
 * @param {!Nodule} nodule
 * @return {number}
 */
function getCancerProbability(nodule) {
  var matchingRows = window.PULMONARY_NODULE_DATA
      .filter(function(row) {
        return row.smokingHistory === nodule.smokingHistory;
      })
      .filter(function(row) {
        return row.cancerHistory === nodule.cancerHistory;
      })
      .filter(function(row) {
        return row.spiculated === nodule.spiculated;
      })
      .filter(function(row) {
        return row.upperLobe === nodule.upperLobe;
      })
      .filter(function(row) {
        return row.scanType === nodule.scanType;
      });

  if (matchingRows.length === 0) {
    renderError('No row found that matched the form input');
    return;
  }

  // Just take first matching row.
  var row = matchingRows[0];

  // Return age- and size-specific probability.
  var probabilityKey = nodule.age + ' ' + nodule.size;
  return row[probabilityKey];
}

function renderProbability(probability) {
  probabilityEl.innerText = probability;
  resultEl.className = 'result visible';

  // Show the rect to the right of the submit button.
  var resultRect = submitEl.getBoundingClientRect();
  resultEl.style.top = resultRect.top + window.scrollY - 24 + 'px';
  resultEl.style.left = resultRect.right + window.scrollX + 24 + 'px';
}

function renderError(message) {
  console.log(message);
}

/**
 * Returns true if "Yes" is selected, false otherwise.
 * @param {!Form} form
 * @param {!string} name
 * @return {boolean}
 */
function yesNoRadioValue(form, name) {
  var selector = 'input[name="' + name + '"]:checked';
  var selectedInput = form.querySelector(selector);
  return !!selectedInput && selectedInput.value === 'Yes';
}
