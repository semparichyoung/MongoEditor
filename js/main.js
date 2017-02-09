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

	var advSearch = $("#advancedSearch");

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
				for (var i = res.length - 1; i >= 0; i--) {
					var col = "";
					col = "<div id='" + res[i].name + "'class='collection'>" + res[i].name;
					col += "<div class='reloadCollection'><span class='glyphicon glyphicon-refresh'></span></div></div>";
					HTML = col + HTML;
				}
				HTML = "<input class='searchCollection' placeholder='Search Collections'>" + HTML;
				$this.find(".Collections").html(HTML).fadeIn(150, function(e) {
					nowLoading(false);
				});
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
					// console.log(res);
					var data = res["data"];
					var type = res["type"];
					keyAry = [];

					if(typeof data == "undefined") {
						documents.html("<h2>No Data</h2>");
						nowLoading(false);
						return;
					}

					var index = 1;
					documents.append("<tr class='documentHeader'></tr>");
					var headerF = false;
					var documentHeader = "<td class='field fieldIndex'><div class='fieldValue noEdit'>No</div></td>";
					$.each(type, function(k, v) {
						documentHeader += "<td class='field'><div class='fieldValue noEdit' title='" + v + "'>" + k + "</div></td>";
						keyAry.push(k);
					});
					documents.find(".documentHeader").append(documentHeader);
					documents = documents.find("tbody");

					var dataLen = data.length;
					for(var k in data) {
						// nowLoading(k, dataLen);   //too lag to use this.
						var v = data[k];
						var HTML = "<tr class='document' id='" + v["_id"]["$oid"] + "'>";
						HTML += "<td class='field fieldIndex'>" + index + "</td>";
						for(var i in type) {
							if(typeof i != "undefined") {
								HTML += "<td class='field'>" + makeField(v[i], i, type[i]) + "</td>";
							}else {
								HTML += "<td class='field'></td>";
							}
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
	var numb = 0;
	function makeField(val, key, type) {
		var field = "";
		var fieldClass = "fieldValue ";
		if(val == null) {
			field = "<div class='" + fieldClass + "' key='" + key + "' type='" + type + "'></div>";
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
				if(typeof val["$oid"] != "undefined") {
					val = val["$oid"];
					if(key == "_id") {
						fieldClass += "noEdit";
					}
					field = "<div class='" + fieldClass + "' key='" + key + "' type='" + type + "'>" + val + "</div>";
				}else if(typeof val["$date"] != "undefined") {
					val = getFormatDate(val["$date"]["$numberLong"]);
					fieldClass += "noEdit";
					field = "<div class='" + fieldClass + "' key='" + key + "' type='" + type + "'>" + val + "</div>";
				}else {
					field = makeAryField(val, key, type);
				}
/*
				field = "<div class='fieldAry'>"
				$.each(val, function(k, v) {
					field += "<div class='aryField'><div class='fieldKey'>" + k + "</div>" + makeField(v, key) + "</div>";
				})
				field += "</div>";
				*/
				break;
			default:
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
		editModel.removeClass("invisible");
		editKey = $this.attr("key");

		// if(typeof $this.parent().attr("ary") != "undefined") {
		// 	editKey = editKey + "." + $this.siblings('.fieldKey').text();
		// }
		getEditKey($this);

		$("#editInput").val($this.html()).removeClass("invisible");
		$("#datepicker").addClass("invisible");
		editField = $this;
		editType = $this.attr("type");

		editID = $this.closest(".document").attr("id");
	});

	$("#DocumentsDiv").on("click", ".fieldValue[type='date']", function(e) {
		e.stopPropagation();
		if(loading) {
			return;
		}
		var $this = $(this);
		editKey = $this.attr("key");

		// if(typeof $this.parent().attr("ary") != "undefined") {
		// 	editKey = editKey + "." + $this.siblings('.fieldKey').text();
		// }
		getEditKey($this);

		$("#datepicker").val($this.html()).removeClass("invisible");
		$("#editInput").addClass("invisible");
		editField = $this;
		editID = $this.closest(".document").attr("id");
		editType = $this.attr("type");

		editModel.removeClass("invisible");
		// $("#datepicker").datetimepicker("show");
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
		console.log(editKey);
	}

	$("#DocumentsDiv").on("click", ".fieldValue.folder", function(e) {
		e.stopPropagation();
		$(this).children().toggleClass("invisible");
	})

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
		}
		console.log("save:", postData);
		$.post("lib/saveData.php", postData, function(e) {
			if(editType == "date") {
				var tmp = val * 1000;
				val = {"$date" : {"$numberLong" : tmp}};
			}
			editField.html(makeField(val, editKey, editType));
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
		if(val === true || val == false) {
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
/*
===============================================================
==================== Search Function Start ====================
===============================================================
*/

	$(".db").on("input", ".searchCollection", function(e) {
		// console.log("input search collections");
		var $this = $(this);
		var $tr = $this.siblings(".collection");
		if($this.val() == "") {
			$tr.removeClass("invisible")
		}else {
			$tr.addClass("invisible");
		}
		$tr.each(function(e) {
			var $t = $(this);
			var str = $t.map(function(e) {
				return $(this).text().toLowerCase();
			}).get().join(",");
			if(str.indexOf($this.val().toLowerCase()) >= 0) {
				$t.removeClass("invisible");
			}
		});
	});

	$("#search").on("input", function(e) {
		var $this = $(this);
		var $tr = $("tbody tr");
		if($this.val() == "") {
			$tr.removeClass("invisible")
		}else {
			$tr.addClass("invisible");
		}
		$tr.each(function(e) {
			var $t = $(this);
			var str = $t.map(function(e) {
				return $(this).text()
			}).get().join(",");
			if(str.indexOf($this.val()) >= 0) {
				$t.removeClass("invisible");
			}
		});
	});


	$("#advanced").on("click touch", function(e) {
		var addCond = "<button id='addCond' class='btn btn-success'>＋</button>";
		addCond += "<button id='startAdvSearch' class='btn btn-success'>Search</button>";
		if(advSearch.is(":visible")) {
			advSearch.fadeOut(300);
		}else {
			advSearch.html(adSearch()).append(addCond).fadeIn(300);
		}
	});
	advSearch.on("click touch", "#addCond", function(e) {
		$(this).before(adSearch());
	});
	advSearch.on("click touch", ".glyphicon-minus-sign", function(e) {
		$(this).parent().fadeOut(150, function(e) {
			$(this).remove();
			if($(".advConds").length < 1) {
				$("#advancedSearch").fadeOut(300);
				$("tbody").children().fadeIn(100);
			}
		});
	});
	advSearch.on("click touch", "#startAdvSearch", function(e) {
		var addConds = $(".advConds");
		var review = $("tbody:visible").children(".document");
		var ary = [];
		for (var i = 0, l = addConds.length; i < l; i++) {
			var v = addConds.eq(i);
			var andor = v.find(".selAndor").val();
			var loc = v.find(".selTarget").val();
			var cond = v.find(".selCond").val();
			var val = v.find(".advancedInput").val();
			for (var j = 0, len = review.length; j < len; j++) {
				if(typeof ary[j] == "undefined") ary[j] = true;
				var v = review.eq(j);
				if(ary[j] === false && andor == "and" || (ary[j] === true && andor == "or")) {
					if(i == l - 1) {
						if(ary[j] === false) {
							v.fadeOut(100);
						}else {
							v.fadeIn(100);
						}
					}
					continue;
				}else if(ary[j] === true || andor == "or"){
					var chil = v.children().eq(loc);
					if(chil.children('.folder').length > 0) {
						chil = chil.children('.folder').children().children();
						ary[j] = false;
						for (var k = chil.length - 1; k >= 0; k--) {
							ary[j] = ary[j] || condResult(chil.eq(k).text(), cond, val);
						}
					}else {
						ary[j] = condResult(chil.text(), cond, val);
					}
				}
				if(i == l - 1) {
					if(ary[j]) {
						v.fadeIn(100);
					}else {
						v.fadeOut(100);
					}
				}
			}
		}

		function condResult(target, cond, val) {
			// console.log(target, cond, val);
			switch (cond) {
				case 'equal':
					return val == target;
					break;
				case 'greater':
					return val < target;
					break;
				case 'less':
					return val > target;
					break;
				case 'contain':
					return target.indexOf(val) >= 0;
					break;
				case 'notContain':
					return target.indexOf(val) < 0;
					break;
				case 'start':
					return target.indexOf(val) == 0;
					break;
				case 'end':
					return target.substr(-val.length) == val;
					break;
				default :
					return false;
			}
		}
	});
	function adSearch(f) {
		var html = ["<div class='advConds'>"];
		html.push(
			"<select name='selAndor' class='selAndor'>",
			"<option value='and'>And</option>",
			"<option value='or'>Or</option>",
			"</select>",
			"<select name='selTarget' class='selTarget'>"
		);
/*
		html.push(
				"<select name='selTarget' class='selTarget'>",
				"<option value='1'>" + lang['title'] + "</option>",
				"<option value='2'>" + lang['allCards'] + "</option>",
				"<option value='3'>" + lang['correct'] + "</option>",
				"<option value='4'>" + lang['wrong'] + "</option>",
				"<option value='5'>" + lang['skip'] + "</option>",
				"<option value='6'>" + lang['spend'] + "</option>",
				"<option value='7'>" + lang['date'] + "</option>",
				"</select>");
		*/
		var k = 1;
		for(var i in keyAry) {
			html.push("<option value='" + k + "'>" + keyAry[i] + "</option>");
			k++;
		}
		html.push(
			"</select>",
			"<select name='selCond' class='selCond'>",
			"<option value='equal'>Equal to</option>",
			"<option value='greater'>Greater</option>",
			"<option value='less'>Less than</option>",
			"<option value='contain'>Contain</option>",
			"<option value='notContain'>Not Contain</option>",
			"<option value='start'>Start With</option>",
			"<option value='end'>End With</option>"
		);
		html.push("<input type='text' name='advancedInput' class='advancedInput' />");
		html.push("<span class='glyphicon glyphicon-minus-sign'></span>");
		html.push("</div>");
		return html.join("");
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
}