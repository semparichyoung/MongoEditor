$(function () {
	$("#DocumentsDiv").on("click", ".documentHeader .field", function(e) {
		var $t = $(this);
		if($t.find("input").length > 0 || $t.find("button").length > 0) return true;
		var $s = $t.find(".glyphicon");
		var index = $t.index();
		var inverse;
		if($s.hasClass("glyphicon-triangle-bottom")) {
			inverse = true;
		}else {
			inverse = false;
		}
		$t.closest('table')
			.find('.document .field')
			.filter(function(){
				return $(this).index() === index;
			})
		.sortElements(function(a, b){
			return inverse ? naturalCompare($(a).text(), $(b).text()) : 
				naturalCompare($(b).text(), $(a).text());

		}, function(){
			return this.parentNode;
		});

		$(".documentHeader span").removeClass("glyphicon-triangle-top glyphicon-triangle-bottom");
		if(!inverse) {
			$s.addClass("glyphicon-triangle-bottom");
		}else {
			$s.addClass("glyphicon-triangle-top");
		}
	});
});



/**
 * jQuery.fn.sortElements
 * --------------
 * @param Function comparator:
 *   Exactly the same behaviour as [1,2,3].sort(comparator)
 *   
 * @param Function getSortable
 *   A function that should return the element that is
 *   to be sorted. The comparator will run on the
 *   current collection, but you may want the actual
 *   resulting sort to occur on a parent or another
 *   associated element.
 *   
 *   E.g. $('td').sortElements(comparator, function(){
 *      return this.parentNode; 
 *   })
 *   
 *   The <td>'s parent (<tr>) will be sorted instead
 *   of the <td> itself.
 *
 * 	 
 *   from:http://james.padolsey.com/snippets/sorting-elements-with-jquery/
 */
jQuery.fn.sortElements = (function(){

	var sort = [].sort;

	return function(comparator, getSortable) {

		getSortable = getSortable || function(){return this;};

		var placements = this.map(function(){

			var sortElement = getSortable.call(this),
			parentNode = sortElement.parentNode,

			// Since the element itself will change position, we have
			// to have some way of storing its original position in
			// the DOM. The easiest way is to have a 'flag' node:
			nextSibling = parentNode.insertBefore(
					document.createTextNode(''),
					sortElement.nextSibling
					);

			return function() {

				if (parentNode === this) {
					throw new Error(
							"You can't sort elements if any one is a descendant of another."
							);
				}

				// Insert before flag:
				parentNode.insertBefore(this, nextSibling);
				// Remove flag:
				parentNode.removeChild(nextSibling);

			};

		});

		return sort.call(this, comparator).each(function(i){
			placements[i].call(getSortable.call(this));
		});

	};

})();
