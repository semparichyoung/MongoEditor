<?php

include_once 'getMongo.php';

$DB = $_POST["DB"];
$CL = $_POST["CL"];
$id = $_POST["ID"];
$key = $_POST["key"];
$val = $_POST["val"];
$type = $_POST["type"];

$mongo = mongo_getDB();

$mongo = $mongo -> $DB -> $CL;


switch ($type) {
	case "date":
		$val = createBsonTime((int)$val);
		break;
	case "_id":
		$val = createMongoID($val);
		break;
	case "double":
		$val = (int)$val;
		break;
	case "string":
		$val = (string)$val;
		break;
}

$mongoUpd = $mongo -> updateOne(
	array("_id" => createMongoID($id)),
	array(
		'$set' => [
			$key => $val
		]
	)
);

return json_encode((array)$mongoUpd);