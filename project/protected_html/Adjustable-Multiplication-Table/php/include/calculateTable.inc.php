<?php
	// ==========================================================================
	// file: calculateTable.php
	// ==========================================================================
	// Developer: Kayevon Azuca
	// Date: 03/01/2020
	//
	// Description:
	//    This script validates form data & calculates/creates a multiplication
  //    table and sent back as JSON data. If an error occurs, an exception is
  //    throw with the error information as JSON which is to be handled by the
  //    handler file that has "inculde()" this script.
	// ==========================================================================

  // ==== Function Declarations ===============================================
  // ==========================================================================

	// ==== isInt() =============================================================
	//
	// Checks if the parameter variable can be a integer type.
	// If it can, convert it into an integer before returning a true value.
	//
	// Input:
	//   &$int		-- a reference to the potential integer value
	//
	// Output:
	//   true     -- parameter can be a integer type
	//   false    -- parameter is not an integer type
  //
	// ==========================================================================
	function isInt(&$int){
		if(filter_var($int, FILTER_VALIDATE_INT) === false) {
    		return false;
		} else {
			$int = (int) $int;
		    return true;
		}
	} // end of isInt()

	// ==== isFloat() ===========================================================
	//
	// Checks if the parameter variable can be a flaot type.
	// If it can, convert it into an float before returning a true value.
	//
	// Parameters:
	//   &$float		-- a reference to the potential flaot value
	//
	// Return:
	//   true     -- parameter can be a flaot type
	//   false    -- parameter is not an flaot type
	//
	// ==========================================================================
	function isFloat(&$float){
		if(filter_var($float, FILTER_VALIDATE_FLOAT) === false) {
    		return false;
		} else {
			$float = (float) $float;
		    return true;
		}
	} // end of isFloat()

	// ==== chkParam() ==========================================================
	//
	// This function checks and converts its parameter variable into a integer
	// or a float. 
	//
	// Parameters:
	//   $urlParam		-- a URL parameter to verify
	//	 $dataName		-- name of the parameter being checked
	//
	// Return:
	//   $res         -- array of the results of "urlParam" validation
	//
	// ==========================================================================
	function chkParam($urlParam, $dataName){
		$res = array(
			'valid' => FALSE,
			'data' => NULL,
		);

		if(isInt($urlParam) === TRUE){
			$res['valid'] = TRUE;
			$res['data'] = $urlParam;
			return $res;
		} else if (isFloat($urlParam) === TRUE){
			$res['valid'] = TRUE;
			$res['data'] = $urlParam;
			return $res;
		} else {
			$res['valid'] = FALSE;
			$res['data'] = $dataName . ' value is not a number!';
			return $res;
		}
	} // end of chkParam()

	// ==== chkStartEndDiff() ===================================================
	//
	// Checks if the start and end range is not greater then "MAX_DIFFERENCE".
	//
	// Parameters:
	//   $start			  -- the starting number of a column or row
	//	 $end		    	-- the ending number of a column or row
	//	 $startName		-- the start input name of the parameter being checked
	//	 $endName		  -- the end input name of the parameter being checked
	//
	// Return:
	//   $res         -- array of the results of difference validation
	//
	// ==========================================================================
	function chkStartEndDiff($start, $end, $startName, $endName){
		$res = array(
			'valid' => FALSE,
			'data' => ""
		);

		if($start > $end){
			$diff = ($start - $end) + 1;
		} else {
			$diff = ($end - $start) + 1;
		}

		if(abs($diff) > MAX_DIFFERENCE){
			$res['valid'] = FALSE;
			$res['data'] = 'The table you are trying to create is too large! The range between ' . 
      $startName . ' and ' . $endName . ' is ' . abs($diff) .
      ' The maximum difference is ' . MAX_DIFFERENCE;
			return $res;
		} else {
			$res['valid'] = TRUE;
			return $res;
		}
	} // end of chkStartEndDiff()

  // ==== End of Function Declarations ========================================
  // ==========================================================================

  // ==== Main Execution ======================================================
  // ==========================================================================

  // Check if the "$caculateTableHan" variable was declared as "TRUE" by
  // the handler file that has "include()" this script.
  if(!$caculateTableHan){exit();}
  unset($caculateTableHan);

	define("MAX_DIFFERENCE", 50);
  
  $res = array(
    'errMsg' => array(),
    'data' => NULL
  );

  try {

    // ==== Validate Each Starting/Ending Values as a Number/Float  ===========
    // ========================================================================

    $colStart = chkParam($_POST["colStart"], "Column Start");
    $colEnd = chkParam($_POST["colEnd"], "Column End");
    $rowStart = chkParam($_POST["rowStart"], "Row Start");
    $rowEnd = chkParam($_POST["rowEnd"], "Row End");

    if(!$colStart['valid']){
      array_push($res['errMsg'], $colStart['data']);
    }

    if(!$colEnd['valid']){
      array_push($res['errMsg'], $colEnd['data']);
    }

    if(!$rowStart['valid']){
      array_push($res['errMsg'], $rowStart['data']);
    }

    if(!$rowEnd['valid']){
      array_push($res['errMsg'], $rowEnd['data']);
    }

    if(count($res['errMsg']) > 0){
      throw new Exception(json_encode($res));
    }

    // ==== Validate the Size of the Multiplication Table  ====================
    // ========================================================================
    
    $colDiff = chkStartEndDiff($colStart['data'], $colEnd['data'], "Column Start", "Column End");
    $rowDiff = chkStartEndDiff($rowStart['data'], $rowEnd['data'], "Row Start", "Row End");

    if(!$colDiff['valid']){
      array_push($res['errMsg'], $colDiff['data']);
    }

    if(!$rowDiff['valid']){
      array_push($res['errMsg'], $rowDiff['data']);
    }

    if(count($res['errMsg']) > 0){
      throw new Exception(json_encode($res));
    }

    // ==== Calculate & Create Multiplication Table ===========================
    // ========================================================================
  
    $colStart = $colStart['data'];
    $colEnd = $colEnd['data'];
    $rowStart = $rowStart['data'];
    $rowEnd = $rowEnd['data'];

    $colCounter = 1;
    $rowCounter = 1;

    $res['data'] .= '<thead class="famt__thead"><tr id="tr" class="famt__tr">';
    $res['data'] .= '<th class="famt__th row' . $rowCounter . 
      ' col' . $colCounter . ' famt--php">Server</th>';
    ++$colCounter;

    // Check whether to increment or decrement starting at $colStart value.
    if($colStart > $colEnd){
      for($i = $colStart; $i >= $colEnd; --$i){
        $res['data'] .= '<th class="famt__th row' . $rowCounter . 
          ' col' . $colCounter . '">' . $i . '</th>';
        ++$colCounter;
      } // end of for()
    } else {
      for($i = $colStart; $i <= $colEnd; ++$i){
        $res['data'] .= '<th class="famt__th row' . $rowCounter . 
          ' col' . $colCounter . '">' . $i . '</th>';
        ++$colCounter;
      } // end of for()
    }

    ++$rowCounter;
    $res['data'] .= '</tr></thead>';
    $res['data'] .= '<tbody id="famtBody" class="famt__tbody">';

    // Check whether to increment or decrement starting at $rowStart.
    if($rowStart > $rowEnd){
      for($j = $rowStart; $j >= $rowEnd; --$j){
        $colCounter = 1;
        $res['data'] .= '<tr class="famt__tr">';
        $res['data'] .= '<th class="famt__th row' . $rowCounter . 
          ' col' . $colCounter . '">' . $j . '</td>';
        ++$colCounter;

        if($colStart > $colEnd){
          for($k = $colStart; $k >= $colEnd; --$k){
            $res['data'] .= '<td class="famt__td row' . 
              $rowCounter . ' col' . $colCounter . '">' . $j * $k . '</td>';
            ++$colCounter;
          } // end of for()
        } else {
          for($k = $colStart; $k <= $colEnd; ++$k){
            $res['data'] .= '<td class="famt__td row' . 
              $rowCounter .' col' . $colCounter . '">' . $j * $k . '</td>';
            ++$colCounter;
          } // end of for()
        }
        ++$rowCounter;
        $res['data'] .= '</tr>';
      } // end of for()
      $res['data'] .= '</tbody>';
    } else {
      for($j = $rowStart; $j <= $rowEnd; ++$j){
        $colCounter = 1;
        $res['data'] .= '<tr class="famt__tr">';
        $res['data'] .= '<th class="famt__th row' . $rowCounter . 
          ' col' . $colCounter . '">' . $j . '</td>';
        ++$colCounter;

        if($colStart > $colEnd){
          for($k = $colStart; $k >= $colEnd; --$k){
            $res['data'] .= '<td class="famt__td row' . $rowCounter
              . ' col' . $colCounter . '">' . $j * $k . '</td>';
            ++$colCounter;
          } // end of for()
        } else {
          for($k = $colStart; $k <= $colEnd; ++$k){
            $res['data'] .= '<td class="famt__td row' . $rowCounter
              . ' col' . $colCounter . '">' . $j * $k . '</td>';
            ++$colCounter;
          } // end of for()
        }
        ++$rowCounter;
        $res['data'] .= '</tr>';
      } // end of for()
      $res['data'] .= '</tbody>';
    } // end of else{}

    // ==== Send Back Results  ================================================
    // ========================================================================
    $json = json_encode($res);
    echo($json);
  } catch(Exception $e){
    throw new Exception($e->getMessage());
  }
// ==== End of Main Execution =================================================
// ============================================================================