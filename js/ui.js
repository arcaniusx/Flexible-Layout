/**
 * @file
 * @author              Filipe Araujo
 * @version             1.0
 */

if(typeof App === 'undefined'){
	App = {};
}
App.ui = {};

/**
 * ui expander
 * @namespace       BN.ui.expander
 */
App.ui.expander = (function($) {
	var

	/**
	 * Initiate SelectMenu
	 * @description             look for each select containing a data-app-role = ui-expander
	 *                          and create an expander for each
	 * @method                  init
	 * @private
	 * @params                  {Object} e event
	 */
	init = function(e){
		console.log($('[data-app-role^="ui-expander"]'));
		$.each($('[data-app-role^="ui-expander"]', (e && e.data) ? e.data.context : null), Expander);
	},

	/**
	 * Expander Constructor
	 * @memberOf                App.ui.expander
	 * @private
	 * @constructor
	 */
	Expander = function(){
		var defaults = {
				prefetch : false,
				type : 'toggle'
			},
			$expander = $(this),
			$items,
			options = {},
			$target,

		/**
		 * Builds expander and stores a reference to the data-app-bn-target,
		 * also binds events to the expander
		 * @memberOf                App.ui.expander.Expander
		 * @method                  buildExpander
		 * @private
		 */
		buildExpander = function(){

			$.extend(options, defaults, new Function('return ' +  $expander.attr('data-app-options'))());
			$target = $('[data-app-target="'+options.aim+'"]');
			$expander.attr('data-app-role', "ui-component:expander-"+options.type)
				.bind('open.app.events.ui.expander',expand)
				.bind('close.app.events.ui.expander',collapse)
				.bind('click', checkState);

			if(!!options.prefetch){
				$items = $target.find('[data-app-item]')
					.bind('fetched.app.events.ui.item', {
						fx : {
							height : 'toggle',
							opacity : 'toggle',
							width : 'toggle'
						}
					}, expand);
			}
		},

		/**
		 * Checks the state and triggers the correct event based on the type of expander
		 * @memberOf                App.ui.expander.Expander
		 * @method                  checkState
		 * @private
		 * @params                  {Object} e event
		 */
		checkState = function(e){
			var isOpen = $target.is(':visible');

			if(isOpen && options.type != 'open'){
				$expander.trigger('close.app.events.ui.expander');
				return false;
			}
			if(!isOpen && options.type != 'close'){
				$expander.trigger({
					callback : ($items) ? prefetchItems : null,
					$el : $target,
					type : 'open.app.events.ui.expander'
				});
				return false;
			}
		},

		/**
		 * Hides target
		 * @memberOf                App.ui.expander.Expander
		 * @method                  collapse
		 * @private
		 * @params                  {Object} e event
		 */
		collapse = function(e){
			$target.slideUp();
		},

		/**
		 * Progressively shift through items and trigger item fetching event passing
		 * callback element
		 * @memberOf                App.ui.expander.Expander
		 * @method                  loadItem
		 * @private
		 */
		prefetchItems = function(){
			var item;

			if($items.length > 0){
				$item = $items.eq(0);
				$items = $items.not(":eq(0)");
				$(window).trigger({
					callback : function(){
						$item.trigger({
							callback : prefetchItems,
							type : 'fetched.app.events.ui.item'
						});
					},
					$el : $item,
					type : 'prefetch.app.events.item'
				});
			}
		},

		/**
		 * Shows target
		 * @memberOf                App.ui.expander.Expander
		 * @method                  expand
		 * @private
		 * @params                  {Object} e event
		 */
		expand = function(e){
			var $el = e.$el || $(this),
				event = $.extend(event, e.data, e),
				fx = event.fx || { height : 'toggle' };

			$el.animate(fx, 400, event.callback);
		};

		buildExpander();
	};

	$(window).bind('loaded.app.events', init);

	return {
		init : init
	};
})(jQuery);


$(function(){
	$(window).trigger('loaded.app.events');
});