<?php

include_once 'getMongo.php';

$DB = $_POST["DB"];

$mongo = mongo_getDB();

$mongo = $mongo -> $DB;

$collections = $mongo -> listCollections();

$reAry = [];
foreach ($collections as $v) {
	$reAry[] = ["name" => ($v -> getName())];
	// $reAry[] = $v -> getName();
}

sort($reAry);

echo json_encode($reAry);