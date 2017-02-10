<?php

include_once 'lib/getMongo.php';

$mongo = mongo_getDB();

$databases = $mongo -> listDatabases();

?>

<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<title>mongoEditor</title>
	<link rel="stylesheet" href="css/main.css">
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
	<link rel="stylesheet" type="text/css" href="datetimepicker/jquery.datetimepicker.css"/ >
	<script src="datetimepicker/jquery.js"></script>
	<script src="datetimepicker/jquery.datetimepicker.js"></script>
	<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css" rel="stylesheet">
	<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap-theme.min.css" rel="stylesheet">
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
	<script src="js/main.js" type="text/javascript" charset="utf-8" async defer></script>
</head>
<body>

	<div id="header">
		<div id="searchBar">
			<div id="normalSearch">
				<h3 class="inline"> Search</h3>
				<input type="text" name="search" id="search" placeholder="Search fields in documents(Did not work before choose a collection)" />
				<span id="advanced" class="inline">Advanced</span>
			</div><!-- END: #normalSearch -->
			<div id="advancedSearch" style="display: none">
			</div><!--END: . #advancedInput-->
		</div><!-- END: #searchBar -->
	</div>
	<div id="Databases">
<?php

foreach ($databases as $v) {

	?>
	<div class="db" id='<?=$v -> getName();?>'>
		<div class="dbName"><?=$v -> getName()?></div>
		<br>
		<div class="Collections" style="display: none;"></div>
	</div>
	<?
} //End foreach of $databases

?>
	</div>

	<div id="DocumentsDiv">

	</div>

	<div id="editModel" class="invisible model">
		<div id="editInputDiv">
			<textarea type="" name="" id="editInput"></textarea>
			<input id="datepicker" class="invisible"/>
			<button type="" id="editInputBtn">Update</button>
		</div>
		<div id="editAssignDiv">
			<div id="assignCollections"></div>
		</div>
	</div>
<!--
	<div id="loadingModel" class="invisible model">
		<div class="progress">
		  <div id="loadingBar" class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>
		</div>
	</div>
 -->
</body>
</html>