// ============================================================================
// File: main.js
// ============================================================================
// Developer: Kayevon Azuca
// Date: 3/15/2021
// Description: Provide any features/services for the page loading this script.
// ============================================================================

// ==== Handle Multiplication Table Creation ==================================
//
// The following will handle the creation of the end-user's desired
// multiplication table. A module is imported and initialized to cache DOM
// elements and set an event listener on form submission (on table creation).
//
// ============================================================================
(async function(){
  try {
    // Obtain required DOM elements
    let formEl = document.getElementById("famtForm");
    let outputEl = document.getElementById("famtOutput");
    if(!formEl || !outputEl){throw "Could not find required DOM elements";}

    // Import and initialize module
    let CalculateTable = await import('./modules/CalculateTable/CalculateTable.mod.js');
    let init = CalculateTable.init(formEl, famtOutput);

    // Check the results of module initialization
    if(!init){throw "Module/initialization failed!";}
    console.log("Table creation module loaded!");
  } catch(e){
    console.error(e);
  }
})();
// ==== End of Handle Multiplication Table Creation ===========================
// ============================================================================

// ==== Interactive Radio Inputs ==============================================
//
// Add some interactive features for the radio inputs when clicking.
//
// ============================================================================
(function(){
  let myDevice = document.getElementById('famtLabelJS');
  let yourServer = document.getElementById('famtLabelPHP');
  let famtInputReset = document.getElementById('famtInputReset');

  myDevice.addEventListener('click', function(ev){
      ev.stopPropagation();
      ev.preventDefault();
      let input = document.getElementById('myDevice');
      if(input.checked === false){
          ev.currentTarget.classList.toggle('js-rdo');
          yourServer.classList.toggle('php-rdo');
          input.checked = true;
      }
  });
  yourServer.addEventListener('click', function(ev){
      ev.stopPropagation();
      ev.preventDefault();
      let input = document.getElementById('yourServer');
      if(input.checked === false){
          myDevice.classList.toggle('js-rdo');
          ev.currentTarget.classList.toggle('php-rdo');
          input.checked = true;
      }
  });
  famtInputReset.addEventListener('click', function(ev){
      myDevice.classList.add('js-rdo');
      yourServer.classList.remove('php-rdo');
  });
})();
// ==== End of Interactive Radio Inputs =======================================
// ============================================================================