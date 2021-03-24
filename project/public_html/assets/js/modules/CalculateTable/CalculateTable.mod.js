// ============================================================================
// File: CalculateTable.mod.js
// ============================================================================
// Developer: Kayevon Azuca
// Date: 3/15/2021
// Description: Module that acts as the main driver of other modules.
// ============================================================================

// ==== Function Declarations =================================================
// ============================================================================

// ==== init() ================================================================
//
// Cache parameter DOM elements and add an event listener on form submit. Event
// listener will process a submit form which will contain inputs/values that
// determine the multiplication table.
// 
// Parameters:
//   form        -- HTML form element for multiplication table creation
//   output      -- display container element for created multiplication table
//
// Return:
//   true        -- initialization complete
//   false       -- could not complete initialization
// ============================================================================
export function init(form, output){
  try {
    formEl = form;
    outputEl = output;
    formEl.addEventListener('submit', function(ev){
      ev.preventDefault();
      if(submitDelay){return;}
      processForm(ev);
    });
    return true;
  } catch(e){
    console.error(e);
    return false;
  }
} // end of init()

// ==== processForm() =========================================================
//
// This function is the main driver of the application's results. It involves
// the delay of the next multiplication table creation, validating form inputs,
// choosing the correct device to calculate the table, and handling any errors.
// 
// Parameters:
//   ev              -- HTML form element for multiplication table creation
//
// Return:
//   undefined       -- no return statement
//
// ============================================================================
function processForm(ev){
  let errMsg = [];
  try {
    // Delay another table creation
    submitDelay = true;

    // Allow table creation after delay
    setTimeout(() => {
      submitDelay = false;
    }, 1500);

    console.log("Processing...");

    // Element with all form inputs
    let inputs = ev.target;
    
    // Check hidden input for value
    if(inputs.querySelector("input[name=msg]").value !== ''){
      return;
    }

    // Determine which device should create the multiplication table
    let rdoEls = inputs.querySelectorAll("input[name=rdoCalcDevice]");
    let calcDevice = getCalcDevice(rdoEls);

    if(!calcDevice){
      errMsg.push("Could not determine calculation device!")
      throw "Processing Error: Radio button chioce";
    }

    // Validate numbers in Column Start/End and Row Start/End
    let colStart = inputs.querySelector('input[name=colStart]').value;
    if(isNaN(Number(colStart))){errMsg.push('"Column Start" value is not a number!');}
    let colEnd = inputs.querySelector('input[name=colEnd]').value;
    if(isNaN(Number(colEnd))){errMsg.push('"Column End" value is not a number!');}
    let rowStart = inputs.querySelector('input[name=rowStart]').value;
    if(isNaN(Number(rowStart))){errMsg.push('"Row Start" value is not a number!');}
    let rowEnd = inputs.querySelector('input[name=rowEnd]').value;
    if(isNaN(Number(rowEnd))){errMsg.push('"Row End" value is not a number!');}

    if(errMsg.length > 0){
      throw "Processing Error: Not a number";
    }

    // Check how many columns/rows are needed
    // and make sure they don't exceed client/server limit

    // Determine the difference limit by the "calcDevice" variable.
    let diffLimit = clientLimit;
    if(calcDevice === 'server'){diffLimit = serverLimit;}

    let colDiff = getNumDiff(colStart, colEnd);
    if(colDiff > diffLimit){
      errMsg.push('The table you are trying to create is too large!' + 
      ' The range between "Column Start" and "Column End" is ' + colDiff +
      ' Range limit is ' + diffLimit);
    }

    let rowDiff = getNumDiff(rowStart, rowEnd);
    if(rowDiff > diffLimit){
      errMsg.push('The table you are trying to create is too large!' + 
      ' The range between "Row Start" and "Row End" is ' + rowDiff +
      ' Range limit is ' + diffLimit);
    }

    if(errMsg.length > 0){
      throw "Processing Error: Differnce limit exceeded!";
    }

    // Create multiplication table
    // Determine which device will create the table
    if(calcDevice === 'client'){
      console.log("Calculating table on client-side device...")
      if(createTableJS(colStart, colEnd, rowStart, rowEnd)){
        console.log("QED!");
        return;
      }
      console.log("Something went wrong. Sorry for the inconvenience");
    } else if(calcDevice === 'server'){
      console.log("Calling server...")
      if(createTablePHP()){
        console.log("QED!");
        return;
      }
      console.log("Something went wrong. Sorry for the inconvenience");
    }
  } catch(e){
    console.error(e);
    dispErr(errMsg);
  }
} // end of processForm()

// ==== getCalcDevice() =======================================================
//
// Recieve an array of radio button inputs and determine which one has a
// "checked" attribute and has a valid value in the input.
// 
// Parameters:
//   arr              -- an array of radio button inputs
//
// Return:
//   arr[i].value     -- the valid value in the input
//   false            -- somehting went wrong
// ============================================================================
function getCalcDevice(arr){
  try {
    for(let i = 0; i < arr.length; ++i){
      if(arr[i].checked && validRdoVal.includes(arr[i].value)){
        return arr[i].value;
      } // end of if()
    } // end of for()
    return false;
  } catch(e){
    console.error(e);
    return false;
  }
} // end of getCalcDevice()

// ==== getNumDiff() ==========================================================
//
// Return the difference between two numbers.
//
// Parameters:
//   start          -- the starting Number value
//   end            -- the ending Number value
//
// Return:
//   diff           -- number that represents the differece
//
// ============================================================================
function getNumDiff(start, end){
  let diff;
  if(start > end){
      diff = (start - end) + 1;;
  } else {
      diff = (end - start) + 1;;
  }
  return diff;
} // end of getNumDiff()

// ==== createTableJS() =======================================================
//
// This function creates the multiplication table when client device is
// selected. Display the results by appending the "table" variable 
// to "outputEl".
//
// Parameters:
//   colStart        -- the starting column value
//   colEnd          -- the ending column value
//   rowStart        -- the starting row value
//   rowEnd          -- the ending row value
//
// Return:
//   true            -- function execution succeded
//   false           -- function execution failed
//
// ============================================================================
async function createTableJS(colStart, colEnd, rowStart, rowEnd){
  try {
    clearOutput();

    let table = mkEl('TABLE', {"id":"famtTableOutput","class":"famt__table famt__table--output"});
    let thead = mkEl('THEAD', {"class":"famt__thead"});
    let tbody = mkEl('TBODY', {"id":"famtBody","class":"famt__tbody"});
    let tr = mkEl('TR', {"class":"famt__tr"});
    let th = mkEl('TH', {"class":`famt__th famt--js row${rowCounter} col${colCounter}`}, 'My Device');
    tr.appendChild(th);

    table.addEventListener("mouseover", dispColHighlight, false);
    table.addEventListener("mouseleave", hideColHighlight, false);

    var colCounter = 1;
    var rowCounter = 1;
    ++colCounter;

    // Check whether to increment or decrement starting at "colStart" value.
    if(colStart > colEnd){
      for(let i = colStart; i >= colEnd; --i){
        let num = i;
        if(num % 1 != 0){
          num = parseFloat(num).toFixed(1);
        }
        tr.appendChild(mkEl('TH', {"class":`famt__th row${rowCounter} col${colCounter}`}, `${num}`));
        ++colCounter;
      } // end of for()
    } else {
      for(let i = colStart; i <= colEnd; ++i){ // idkJS()
        let num = i;
        if(num % 1 != 0){
          num = parseFloat(num).toFixed(1);
        }
        tr.appendChild(mkEl('TH', {"class":`famt__th row${rowCounter} col${colCounter}`}, `${num}`));
        ++colCounter;
      } // end of for()
    } // end of else {}

    thead.appendChild(tr);
    table.appendChild(thead);
    tr = null;
    ++rowCounter;

    if(rowStart > rowEnd){
      for(let j = rowStart; j >= rowEnd; --j){
        colCounter = 1;
        let tr = mkEl('TR', {"class":"famt__tr"});

        let num = j;
        if(num % 1 != 0){
          num = parseFloat(num).toFixed(1);
        }
        tr.appendChild(mkEl('TH', {"class":`famt__th row${rowCounter} col${colCounter}`}, `${num}`));
        colCounter++;

        if(colStart > colEnd){
          for(let k = colStart; k >= colEnd; --k){
            let num = j * k;
            if(num % 1 != 0){
              num = parseFloat(num).toFixed(1);
            }
            tr.appendChild(mkEl('TD', {"class":`famt__td row${rowCounter} col${colCounter}`}, `${num}`));
            ++colCounter
          } // end of for()
        } else {
          for(let k = colStart; k <= colEnd; ++k){
            let num = j * k;
            if(num % 1 != 0){
              num = parseFloat(num).toFixed(1);
            }
            tr.appendChild(mkEl('TD', {"class":`famt__td row${rowCounter} col${colCounter}`}, `${num}`));
            ++colCounter
          } // end of for()
        } // end of else{}

        tbody.appendChild(tr);
        tr = null;
        ++rowCounter;
      } // end of for()
      
      table.appendChild(tbody);
      outputEl.appendChild(table);
    } else {
      for(let j = rowStart; j <= rowEnd; ++j){ // idkJS()
        colCounter = 1;
        let tr = mkEl('TR', {"class":"famt__tr"});

        let num = j;
        if(num % 1 != 0){
          num = parseFloat(num).toFixed(1);
        }
        tr.appendChild(mkEl('TH', {"class":`famt__th row${rowCounter} col${colCounter}`}, `${num}`));
        colCounter++;

        if(colStart > colEnd){
          for(let k = colStart; k >= colEnd; --k){
            let num = j * k;
            if(num % 1 != 0){
              num = parseFloat(num).toFixed(1);
            }
            tr.appendChild(mkEl('TD', {"class":`famt__td row${rowCounter} col${colCounter}`}, `${num}`));
            ++colCounter
          } // end of for()
        } else {
          for(let k = colStart; k <= colEnd; ++k){
            let num = j * k;
            if(num % 1 != 0){
              num = parseFloat(num).toFixed(1);
            }
            tr.appendChild(mkEl('TD', {"class":`famt__td row${rowCounter} col${colCounter}`}, `${num}`));
            ++colCounter
          } // end of for()
        } // end of else{}

        tbody.appendChild(tr);
        tr = null;
        ++rowCounter;
      } // end of for()
      table.appendChild(tbody);
      outputEl.appendChild(table);
    } // end of else{}
    return true;
  } catch(e){
    return false;
  }
} // end of createTableJS()

// ==== createTablePHP() ======================================================
//
// This function creates the multiplication table using PHP through the 
// fetch() API call. The response is evaluated to display errors or the reponse
// data is then appended to the output area in the DOM.
//
// Parameters:
//   none
//
// Return:
//   true            -- function execution succeded
//   false           -- function execution failed
//
// ============================================================================
async function createTablePHP(){
  try {
    clearOutput();
    let form = new FormData(formEl);
    form.append('jsValid', true);

    let res = await fetch("/assets/php/handle/Adjustable-Multiplication-Table/CalculateTable.han.php", {
      method: 'POST',
      body: form,
      headers: {
        "Accept": "application/json"
      },
    });

    if(res.status !== 200 || !res.ok){
      throw new Error("Server response error");
    }

    let data = await res.json();

    if(data['errMsg'].length > 0){
      dispErr(data['errMsg']);
      return false;
    }

    let tableEl = mkEl('TABLE', {'id':'famtTableOutput','class':'famt__table famt__table--output'});

    tableEl.addEventListener("mouseover", dispColHighlight, false);
    tableEl.addEventListener("mouseleave", hideColHighlight, false);

    tableEl.innerHTML = data['data'];
    outputEl.appendChild(tableEl);
    return true;

  } catch(e){
    console.error(e);
    return false;
  }
} // end of createTablePHP()

// ==== hideColHighlight() ====================================================
//
// This function fixes an unintended vertical background color effect. This 
// happens when the user is not hovering over the multiplication table yet the
// last known element that was hovered still contains the background color.
//
// Parameters:
//  none
//
// Return:
//   undefined       -- no return statement
//
// ============================================================================
function hideColHighlight(){
  var colHighlightEl = document.getElementById("colHighlight");
  var styleSheet = colHighlightEl.sheet;
  if(styleSheet.cssRules.length > 0){
    styleSheet.deleteRule(styleSheet.cssRules.length - 1);
  }
} // end of hideColHighlight()

// ==== dispColHighlight() ====================================================
//
// This function adds a rule to the internal style element to create the
// vertical background color hover effect in the multiplication table. If a
// rule already exists, that rule is deleted before add the new rule.
//
// Parameters:
//   ev              -- the hovered element in the the multiplication table
//
// Return:
//   undefined       -- no return statement
//
// ============================================================================
function dispColHighlight(ev){
  var colHighlightEl = document.getElementById("colHighlight");
  var styleSheet = colHighlightEl.sheet;
  for(let i = 0; i < ev.target.classList.length; ++i){
    if(ev.target.classList[i].match(/col[0-9]*/)){
      if(styleSheet.cssRules.length > 0){
        styleSheet.deleteRule(styleSheet.cssRules.length - 1);
      }
      styleSheet.insertRule("." + ev.target.classList[i] + "{ background-color: #ccc; }", styleSheet.cssRules.length);
    }
  }
} // end of dispColHighlight()

// ==== dispErr() =============================================================
//
// Given an array of strings, create elements for each error message and append
// them to a container. The output area is cleared of all other elements and 
// the container is then added to the output area.
// 
// Parameters:
//   msgArr          -- array of error messages
//
// Return:
//   undefined       -- no return statement
//
// ============================================================================
function dispErr(msgArr){
  let div = mkEl('DIV', {'class':'famt__info famt__info--error'});
  for(let i = 0; i < msgArr.length; ++i){
    let p = mkEl('P', {'class':'famt__paragraph famt__paragraph--error'}, msgArr[i]);
    div.appendChild(p);
  } // end of for()
  clearOutput();
  outputEl.appendChild(div);
} // end of dispErr()

// ==== clearOutput() =========================================================
//
// Remove any HTML elements in the output area of the website.
// 
// Parameters:
//   none
//
// Return:
//   undefined       -- no return statement
// 
// ============================================================================
function clearOutput(){
  while(outputEl.firstChild) {
    outputEl.removeChild(outputEl.lastChild);
  }
} // end of clearOutput

// ==== mkEl() ================================================================
//
// Create and return an element.
//
// Parameters:
//   elName       -- HTML tag name
//   atr          -- object of attributes names and thier values
//   txt          -- text to be inserted in the element as a text node
//
// Return:
//   el            -- desired element
// ============================================================================
function mkEl(elName, atr = false, txt = false){
  let el = document.createElement(elName);
  if(atr){
    let atrObj = Object.entries(atr);
    for(let [atrKey, atrVal] of atrObj){
      el.setAttribute(atrKey, atrVal);
    }
  }
  if(txt){
    let txtNode = document.createTextNode(txt);
    el.appendChild(txtNode);
  }
  return el;
} // end of mkEl()

// ==== End of Function Declarations ==========================================
// ============================================================================

// ==== Variable Declarations =================================================
// ============================================================================

// The folloing determing how big the multiplication table can be
// in both column & row size.
const clientLimit = 25;
const serverLimit = 50;

// DOM elements that cache the form & output area elements
let formEl;
let outputEl;

// A flag that helps delay the next creation of the multiplication table
let submitDelay = false;

// The device that will calculate the multiplication table
let calcDevice;

// The valid devices to calculate the multiplication table
// This array is used to validate the value of an input radio button element
let validRdoVal = ["client", "server"];

// ==== End of Variable Declarations ==========================================
// ============================================================================