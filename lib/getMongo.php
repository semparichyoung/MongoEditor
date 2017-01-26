<?php
require_once 'composer/vendor/autoload.php';

function mongo_getDB($connection_str = NULL) {
	global $config;
	$server = NULL;
	if(is_string($connection_str)) {
		$server = $connection_str;
	}

	try {
		$mongo = (new MongoDB\Client($server, array("replicaSet" => "cluster")));
	} catch (Exception $e) {
		$mongo = (new MongoDB\Client($server));
	}

	return $mongo;
}

function createMongoID($str) {
	if(gettype($str) == "string") {

		while(strlen($str) < 24) {
			$str = "0" . $str;
		}
		return new MongoDB\BSON\ObjectID($str);
	}else if(gettype($str) == "object"){
		return $str;
	}
}
function createBsonTime($microTime = true) {
	if(is_int($microTime)) {
		$microSec = date("U", $microTime) * 1000;
	}else if(is_string($microTime)) {
		$microSec = date("U", strtotime($microTime)) * 1000;
	}else if($microTime) {
		$microSec = floor(microtime(true) * 1000);
	}
	return new MongoDB\BSON\UTCDateTime($microSec);
}

function getDateByFormat($date, $format = "Y-m-d G:i:s") {
	try {
		$re = $date -> toDateTime();
	} catch (Exception $e) {
		return false;
	}

	if ($tz = date_default_timezone_get()) {
		$re = $re -> setTimezone(new DateTimeZone($tz));
	}else if ($tz = ini_get('date.timezone')) {
		$re = $re -> setTimezone(new DateTimeZone($tz));
	}

	return $re -> format($format);
}
?>
