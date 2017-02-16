$(function() {
	var DB = "";
	var CL = "";

	var editModel = $("#editModel");
	var editID = "";
	var editKey = "";
	var editField;

	var keyAry = [];

	var loading = false;
	var totalNum = 0;
	var loadNum = 0;
	var loadingModel = $("#loadingModel");
	var loadingBar = $("#loadingBar");

	$(".db").on("click", ".dbName", function(e) {
		if(loading) {
			return;
		}
		var $this = $(this).parent();
		DB = $this.attr("id");
		if($this.find(".collection").length < 1) {
			nowLoading(true);
			$.post("lib/getCollections.php", {DB: DB}, function(res) {
				res = JSON.parse(res);
				// console.log(res);
				var HTML = "";
				var agnHtml = "";
				for (var i = res.length - 1; i >= 0; i--) {
					var col = "";
					var agnCol = "";
					col = "<div id='" + res[i].name + "'class='collection'>" + res[i].name;
					col += "<div class='reloadCollection'><span class='glyphicon glyphicon-refresh'></span></div></div>";
					HTML = col + HTML;

					agnCol = "<div id='" + res[i].name + "'class='assignCol'>" + res[i].name + "</div>";
					agnHtml = agnCol + agnHtml;
				}
				HTML = "<input class='searchCollection' placeholder='Search Collections'>" + HTML;
				agnHtml = "<div id='assignBackToCollections'><span class='glyphicon glyphicon-arrow-left'></div>" + agnHtml;
				$this.find(".Collections").html(HTML).fadeIn(150, function(e) {
					nowLoading(false);
				});

				$("#assignCollections").html(agnHtml);
			});
		}else if($this.find(".Collections").is(":visible")){
			$this.find(".Collections").fadeOut(150);
		}else {
			$this.find(".Collections").fadeIn(150);
		}
	});

	$(".db").on("click", ".collection", function(e) {
		if(loading) {
			return;
		}
		// console.log("click collection");
		var $this = $(this);
		CL = $this.attr("id");
		$(".Documents").addClass("invisible");
		if($("#dc_" + CL).length < 1) {
			$("#DocumentsDiv").append("<table id=dc_" + CL + " class='Documents table table-striped table-hover table-bordered'></table>");
			var documents = $("#dc_" + CL);
			nowLoading(true);
			getDocuments(documents);
		}else {
			$("#dc_" + CL).removeClass("invisible");
			window.scrollTo(0, 0);
		}
	});

	$(".db").on("click", ".reloadCollection", function(e) {
		e.stopPropagation();
		var $this = $(this);
		var collection = $this.parent();
		var t = $("#dc_" + collection.attr("id")).remove();
		collection.click();
	});
	
	function makeField(val, key, type) {
		var field = "";
		var fieldClass = "fieldValue ";
		if(val === null || val === "" || typeof val == "undefined") {
			field = "<div class='" + fieldClass + "' key='" + key + "' type='" + type + "'>";
			field += "<span class='glyphicon glyphicon-plus'></div>";
			return field;
		}
		switch(typeof val) {
			case "string":
			case "number":
				if(key == "_id") {
					fieldClass += "noEdit";
				}
				field = "<div class='" + fieldClass + "' key='" + key + "' type='" + type + "'>" + val + "</div>";
				break;
			case "object":
				if(typeof val.$oid != "undefined") {
					val = val.$oid;
					if(key == "_id") {
						fieldClass += "noEdit";
					}
					field = "<div class='" + fieldClass + "' key='" + key + "' type='" + type + "' mongoID>" + val + "</div>";
				}else if(typeof val.$date != "undefined") {
					val = getFormatDate(val.$date.$numberLong);
					// fieldClass += "noEdit";
					field = "<div class='" + fieldClass + "' key='" + key + "' type='" + type + "' mongoDate>" + val + "</div>";
				}else {
					field = makeAryField(val, key, type);
				}
				break;
			default:
				// field = "<div class='" + fieldClass + "' key='" + key + "' type='" + type + "'>";
				// field += "<span class='glyphicon glyphicon-plus'></div>";
				break;
		}
		return field;
	}
	function makeAryField(val, key, type) {
		var field = "<div class='fieldValue noEdit folder' key='" + key + "' type='" + type + "'>array(" + Object.keys(val, key).length + ")<br>";
		var fieldClass = "invisible";
		for(var i in val) {
			var tmpType = type;
			if(typeof type == "object" && typeof type[i] != "undefined") {
				tmpType = type[i];
				// fieldClass += " noEdit";
			}
			field += "<div class='" + fieldClass + "' key='" + key + "' type='" + tmpType + "' ary><div class='fieldKey'>" + i + "</div> => " + makeField(val[i], key, tmpType) + "</div>";
		}
		field += "</div>";
		return field;
	}

	$("#DocumentsDiv").on("click", ".fieldValue:not(.noEdit)", function(e) {
		e.stopPropagation();
		if(loading) {
			return;
		}
		// console.log("click");
		var $this = $(this);
		var editDocument = $this.closest(".document");

		if(editModel.hasClass("invisible")) {
			editModel.removeClass("invisible");
			editKey = $this.attr("key");

			getEditKey($this);

			$("#editInput").addClass("invisible");
			$("#datepicker").addClass("invisible");
			$("#editAssignDiv").addClass("invisible");
			$("#editInputDiv").addClass("invisible");
			if(typeof $this.attr("mongoDate") != "undefined") {
				$("#datepicker").val($this.html()).removeClass("invisible");
				$("#editInputDiv").removeClass("invisible");
			}else if(typeof $this.attr("mongoID") != "undefined") {
				$("#assignTargetHeader").html(editDocument.siblings(".documentHeader").html());
				$("#assignTargetBody").html(editDocument.html());

				$("#editAssignDiv").removeClass("invisible");
			}else {
				$("#editInput").val($this.text()).removeClass("invisible");
				$("#editInputDiv").removeClass("invisible");
			}
			editField = $this;
			editType = $this.attr("type");

			editID = editDocument.attr("id");
		}else {
			editDocument.toggleClass("active");
		}
	});

	function getEditKey($this) {
		var tmpPrt = $this.parent();
		var keyAry = [];
		while(typeof tmpPrt.attr("ary") != "undefined") {
			keyAry.push(tmpPrt.children(".fieldKey").text());
			$this = tmpPrt;
			tmpPrt = $this.parent().parent();
		}
		keyAry.push(editKey);
		editKey = keyAry.reverse().join(".");
		// console.log(editKey);
	}

	$("#DocumentsDiv").on("click", ".fieldValue.folder", function(e) {
		e.stopPropagation();
		$(this).children().toggleClass("invisible");
	});

	$("#assignCollections").on("click", ".assignCol", function(e) {
		var $this = $(this);
		CL = $this.attr("id");
		$("#assignDocuments").html("<table id=ag_" + CL + " class='Documents table table-striped table-hover table-bordered'></table>");
		var documents = $("#ag_" + CL); 
		nowLoading(true);
		getDocuments(documents, function() {

		});

		$("#assignCollections").fadeOut(150);
	});

	$("#assignBackToCollections").on("click", function(e) {
		$("#assignDocuments").html("");
		$("#assignCollections").fadeIn(150);
	});

	function getDocuments(documents, callback) {
		$.ajax({
			url: "lib/getDocuments.php",
			data: {DB: DB, CL: CL},
			dataType: "json",
			type: "POST",
			success: function(res) {
				// console.log(res);
				if(typeof res == "string") {
					try {
						res = JSON.parse(res);
					}catch(e) {
						console.log("can't json:", res);
						documents.html("<h2>Oops, there are some problem here. (success but not JSON)</h2>");
						nowLoading(false);
						return;
					}
				}
				console.log(res);
				var data = res.data;
				var type = res.type;
				keyAry = [];

				if(typeof data == "undefined") {
					documents.html("<h2>No Data</h2>");
					nowLoading(false);
					return;
				}

				var index = 1;
				documents.append("<tr class='documentHeader'></tr>");
				var headerF = false;
				var documentHeader = "<td class='field fieldIndex'><div class='fieldValue noEdit'>No<span class='glyphicon'></span></div></td>";
				$.each(type, function(k, v) {
					documentHeader += "<td class='field'><div class='fieldValue noEdit' title='" + v + "'>" + k + "<span class='glyphicon'></span></div></td>";
					keyAry.push(k);
				});
				documents.find(".documentHeader").append(documentHeader);
				documents = documents.find("tbody");

				var dataLen = data.length;
				for(var k = 0; k < dataLen; k++) {
					// nowLoading(k, dataLen);   //too lag to use this.
					var v = data[k];
					var HTML = "<tr class='document' id='" + v._id.$oid + "'>";
					HTML += "<td class='field fieldIndex'>" + index + "</td>";
					for(var i in type) {
						HTML += "<td class='field'>" + makeField(v[i], i, type[i]) + "</td>";
					}
					HTML += "</tr>";
					index++;
					documents.append(HTML);
				}
				window.scrollTo(0, 0);
				nowLoading(false);
			},
			statusCode: {
				500: function() {
					documents.html("<h2>Oops, there are some problem here. By statusCode</h2>");
					nowLoading(false);
				}
			},
			error: function() {
				documents.html("<h2>Oops, there are some problem here. By error</h2>");
				nowLoading(false);
			}
		});
	}

	$("#editInputBtn").on("click", function(e) {
		if(loading) {
			return;
		}
		var input;
		var val;
		if($("#editInput").hasClass("invisible")) {
			input = $("#datepicker");
			val = Math.floor((new Date(input.val())).getTime() / 1000);
		}else {
			input = $("#editInput");
			val = input.val();
		}

		var postData = {
			DB: DB,
			CL: CL,
			ID: editID,
			val: val,
			key: editKey,
			type: editType,
		};
		console.log("save:", postData);
		$.post("lib/saveData.php", postData, function(e) {
			if(editType == "date") {
				var tmp = val * 1000;
				val = {"$date" : {"$numberLong" : tmp}};
			}
			if(editField.siblings(".fieldKey").length > 0) {
				editField.html(val);
			}else {
				editField.html(makeField(val, editKey, editType));
			}
			editModel.addClass("invisible");
		});
	});

	$("body").on("keyup", function(e) {
		if(e.keyCode == 27 && !editModel.hasClass("invisible")) {
			editModel.addClass("invisible");
		}
		if(e.keyCode > 48 && e.keyCode < 58) {
			// $.moveColumn($(".Documents:visible"), 1, e.keyCode - 48);
		}
	});


	function getFormatDate(d) {
		var date = new Date(parseInt(d));
		var year = date.getFullYear();
		var month = date.getMonth() < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
		var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
		var hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
		var minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
		var second = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

		return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
	}

	function nowLoading(val, total) {
		if(val === true || val === false) {
			loading = val;
			if(loading) {
				$("#Databases").addClass("alpha");
			}else {
				$("#Databases").removeClass("alpha");
				// loadingModel.addClass("invisible");
			}
			return;
		}
		// console.log(val + " / " + total);
		// Too lag to use this
		loading = val < total - 1;
		if(loading) {
			loadingModel.removeClass("invisible");
			var pa = Math.floor((val / total) * 100);
			loadingBar.attr("aria-valuenow", pa).css("width", pa + "%").html(val + " / " + total);
		}else {
			loadingModel.addClass("invisible");
		}
	}
	
	$("#datepicker").datetimepicker({
		format: "Y-m-d H:m:s"
	});
});

$.moveColumn = function (table, from, to) {
    var rows = jQuery('tr', table);
    var cols;
    rows.each(function() {
        cols = jQuery(this).children('th, td');
        cols.eq(from).detach().insertBefore(cols.eq(to));
    });
};