////	jQuery.leanModal2.js v2.3.2
// MIT Licensed by eustasy https://eustasy.org
// Based on leanModal v1.1 by Ray Stone - http://finelysliced.com.au

// ANONFUNC Wrap in an anonymous function.
(function($){

	////	Close the Modal
	// FUNCTION: Fade out the overlay and a passed identifier.
	function leanModal_Close(modal_id) {
		$('.js-leanmodal-overlay').fadeOut(300);
		$(modal_id).fadeOut(200);
	}

	////	Extend jQuery
	// EXTENDFUNC
	$.fn.extend({
		// EXTENDFUNC_LEANMODAL
		leanModal: function(options) {

			////	Default Options
			// Set some Defaults.
			var defaults = {
				top: 100,
				overlayOpacity: 0.5,
				closeButton: '.js-leanmodal-close',
				disableCloseOnOverlayClick: false,
				disableCloseOnEscape: false,
			};
			// Merge in any passed options.
			options = $.extend(defaults, options);

			////	There can be only one.
			// Overlay. If there isn't an overlay, add one.
			if ( $('.js-leanmodal-overlay').length == 0 ) {
				var style = 'background: #000; display: none; height: 100%; left: 0; position: fixed; top: 0; width: 100%; z-index: 100;';
				var overlay = $('<div class="js-leanmodal-overlay" style="' + style + '"></div>');
				$('body').append(overlay);
			}

			////	Everything is Linked
			// FOREACHLINK For each targeted link.
			return this.each(function() {
				// Force this to look like a link.
				$(this).css({ 'cursor': 'pointer' });

				////	Command Override
				// Override the existing click command,
				// and insert this new one.
				// CLICKOVERRIDE
				$(this).unbind('click').click(function(e) {

					////	Select the Modal Identifier
					// IFHREF Use data-open-modal if available
					if ( $(this).attr('data-modal-id') ) {
						var modal_id = $(this).attr('data-modal-id');
					// IFHREF Fall back to href
					} else if ( $(this).attr('href') ) {
						var modal_id = $(this).attr('href');
					// IFHREF Fail entirely.
					} else {
						return false;
					} // IFHREF

					////	Close with closeButton
					// If `closeButton` is set,
					// use it to call the close command.
					if ( options.closeButton ) {
						$(options.closeButton).click(function() {
							leanModal_Close(modal_id);
						});
					}

					////	Escape with `Esc`
					// Close the modal when someone presses `Esc`,
					// except when `disableCloseOnEscape` is set to `true`
					if ( !options.disableCloseOnEscape ) {
						$(document).on('keyup', function(evt) {
							if ( evt.keyCode == 27	) {
								leanModal_Close(modal_id);
							}
						});
					}

					////	Envelope in Darkness
					// Close the modal when someone clicks on the overlay,
					// except when `disableCloseOnOverlayClick` is set to `true`
					if ( !options.disableCloseOnOverlayClick ) {
						$('.js-leanmodal-overlay').click(function() {
							leanModal_Close(modal_id);
						});
					}

					////	Modal Positioning
					// Position the modal centrally using JavaScript, because CSS sucks.
					// Actually it doesn't, but it is hard to globally position.
					var modal_height = $(modal_id).innerHeight();
					var modal_width = $(modal_id).innerWidth();
					$(modal_id).css({
						'display': 'block',
						'left': 50 + '%',
						'margin-left': - ( modal_width / 2 ) + 'px',
						'opacity': 0,
						'position': 'fixed',
						'top': options.top + 'px',
						'z-index': 11000,
					});

					////	Curtain Up
					// Fade in the modal and overlay.
					$('.js-leanmodal-overlay').css({ 'display': 'block', opacity: 0 });
					$('.js-leanmodal-overlay').fadeTo(300, options.overlayOpacity);
					$(modal_id).fadeTo(200, 1);

					////	Default Prevention
					// Prevent whatever the default was (probably scrolling).
					e.preventDefault();
					
				}); // CLICKOVERRIDE
			}); // FOREACHLINK
		} // EXTENDFUNC_LEANMODAL
	}); // EXTENDFUNC
})(jQuery); // ANONFUNC This passes in `jQuery` as `$`
