<?php
  // ==========================================================================
  // file: calculateTable.han.php
  // ==========================================================================
  // Developer: Kayevon Azuca
  // Date: 3/15/2021
  // Description: 
  //     Handle JavaScript's "fetch()" request to user the web server to create
  //     a multiplication table using form data values
  // ==========================================================================

  // Toggle this to change the type of environmnet being used
  define('DEBUG', FALSE);
  error_reporting(E_ALL);

  if(DEBUG) { // Development environment
    ini_set('display_errors', 1);
    ini_set('log_errors', 0);
  } else { // Production environment
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
  }

  // ==== Main Execution ======================================================
  //
  // Validate the incoming request form by certain values. If valid include
  // "CalculateTable.inc.php" file to create the multiplication table and send
  // back the results in a JSON file.
  //
  // ==========================================================================

  try {
    if(isset($_POST['jsValid']) && $_POST['msg'] === '' && $_POST['rdoCalcDevice'] === 'server'){
      $caculateTableHan = TRUE;
      $includeFullPath = realpath($_SERVER['DOCUMENT_ROOT'] . '/../protected_html/Adjustable-Multiplication-Table/php/include/calculateTable.inc.php');
      if(file_exists($includeFullPath)){
        include_once($includeFullPath);
      } else {
        throw new Exception('Resource Loading: Could not find file');
      }
    } else {
      throw new Exception('Form Data Check: Validation failed!');
    }
  } catch(Exception $e) {
    echo($e->getMessage());
    exit();
  }

  // ==== End of Main Execution ===============================================
  // ==========================================================================