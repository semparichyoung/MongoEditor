$(function() {

    var advSearch = $("#advancedSearch");
    
	$(".db").on("input", ".searchCollection", function(e) {
		// console.log("input search collections");
		var $this = $(this);
		var $tr = $this.siblings(".collection");
		if($this.val() === "") {
			$tr.removeClass("invisible");
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
		if($this.val() === "") {
			$tr.removeClass("invisible");
		}else {
			$tr.addClass("invisible");
		}
		$tr.each(function(e) {
			var $t = $(this);
			var str = $t.map(function(e) {
				return $(this).text();
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
				var rev = review.eq(j);
				if(ary[j] === false && andor == "and" || (ary[j] === true && andor == "or")) {
					if(i == l - 1) {
						if(ary[j] === false) {
							rev.fadeOut(100);
						}else {
							rev.fadeIn(100);
						}
					}
					continue;
				}else if(ary[j] === true || andor == "or"){
					var chil = rev.children().eq(loc);
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
						rev.fadeIn(100);
					}else {
						rev.fadeOut(100);
					}
				}
			}
		}

		function condResult(target, cond, val) {
			// console.log(target, cond, val);
			switch (cond) {
				case 'equal':
					return val == target;
				case 'greater':
					return val < target;
				case 'less':
					return val > target;
				case 'contain':
					return target.indexOf(val) >= 0;
				case 'notContain':
					return target.indexOf(val) < 0;
				case 'start':
					return target.indexOf(val) === 0;
				case 'end':
					return target.substr(-val.length) == val;
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
});