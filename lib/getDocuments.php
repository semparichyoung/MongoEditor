<?php

include_once 'getMongo.php';

$DB = $_POST["DB"];
$CL = $_POST["CL"];

$mongo = mongo_getDB() -> $DB -> $CL;


$res = $mongo -> find([], ['limit' => 7000]);

$resAry = [];
$resAry["type"] = [];

function isAssoc(array $arr)
{
    if (array() === $arr) return false;
    return array_keys($arr) !== range(0, count($arr) - 1);
}

foreach ($res as $v) {
	foreach ($v as $k => &$val) {
		if(gettype($val) == "object") {
			if(method_exists($val, "__toString")) {
				if($k == "_id") {
					// $v["fieldMongoDataType"] = "key";
					$resAry["type"][$k] = "key";
					// $val = $val -> __toString();
				}else if(get_class($val) == "MongoDB\BSON\UTCDateTime") {
					// $v["fieldMongoDataType"] = "date";
					$resAry["type"][$k] = "date";
					// $val = getDateByFormat($val);
				}else {
					$resAry["type"][$k] = $val -> __toString();
					// $val = $val -> __toString();
				}
			} else {
				// $v["fieldMongoDataType"] = "array";
				$tmp = (array)$val;
				// if(count($resAry["type"][$k]) <= count($tmp)) {
					if(isAssoc($tmp)) {
						// $resAry["type"][$k] = [];
						foreach ($tmp as $key => $value) {
							if(get_class($value) == "MongoDB\BSON\ObjectID") {
								$resAry["type"][$k][$key] = "_id";
							}else if(get_class($value) == "MongoDB\BSON\UTCDateTime") {
								$resAry["type"][$k][$key] = "date";
							}else {
								$resAry["type"][$k][$key] = gettype($value);
							}
						}
					}else {
						if(get_class($tmp[0]) == "MongoDB\BSON\ObjectID") {
							$resAry["type"][$k] = "_id";
						}else if(get_class($tmp[0]) == "MongoDB\BSON\UTCDateTime") {
							$resAry["type"][$k] = "date";
						}else {
							$resAry["type"][$k] = gettype($tmp[0]) . "/" . get_class($tmp[0]);
						}
					}
				// }
			}
		}else {
			// $v["fieldMongoDataType"] = gettype($val);
			if(array_search($k, $resAry["type"]) === false) {
				$resAry["type"][$k] = gettype($val);
			}
		}
	}
	$resAry["data"][] = $v;
}


echo json_encode($resAry);