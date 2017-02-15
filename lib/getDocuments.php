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
					$resAry["type"][$k] = "key";
					$val = ['$oid' => (string)$val];
				}else if(get_class($val) == "MongoDB\BSON\UTCDateTime") {
					$resAry["type"][$k] = "date";
					$val = ['$date' => ['$numberLong' => (string)$val]];
				}else {
					$resAry["type"][$k] = $val -> __toString();
				}
			} else {
				foreach ($val as $key => &$value) {
					fixObject($value, $resAry["type"][$k][$key]);

					// if(get_class($value) == "MongoDB\BSON\ObjectID") {
					// 	$resAry["type"][$k][$key] = "_id";
					// 	$value = ['$oid' => (string)$value];
					// }else if(get_class($value) == "MongoDB\BSON\UTCDateTime") {
					// 	$resAry["type"][$k][$key] = "date";
					// 	$value = ['$date' => ['$numberLong' => (string)$value]];
					// }else {
					// 	$resAry["type"][$k][$key] = gettype($value);
					// }
					
				}
			}
		}else {
			if(array_search($k, $resAry["type"]) === false) {
				$resAry["type"][$k] = gettype($val);
			}
		}
	}
	$resAry["data"][] = $v;
	// var_dump(json_encode($v, JSON_FORCE_OBJECT));
}
function fixObject(&$value, &$type) {
	if(get_class($value) == "MongoDB\BSON\ObjectID") {
		$type = "_id";
		$value = ['$oid' => (string)$value];
	}else if(get_class($value) == "MongoDB\BSON\UTCDateTime") {
		$type = "date";
		$value = ['$date' => ['$numberLong' => (string)$value]];
	}else if(gettype($value) == "object" && !method_exists($val, "__toString")){
		foreach ($value as $k => &$v) {
			fixObject($v, $type[$k]);
		}
	}else {
		$type = gettype($value);
	}
}
// var_dump($res);
echo json_encode($resAry);