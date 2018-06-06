
//
// Prototypes
//

if (!Array.prototype.indexOf)
{
	Array.prototype.indexOf = function(elt /*, from*/)
	{
	var len = this.length >>> 0;

	var from = Number(arguments[1]) || 0;
	from = (from < 0)
		? Math.ceil(from)
		: Math.floor(from);
	if (from < 0)
	from += len;

	for (; from < len; from++)
	{
	if (from in this &&
		this[from] === elt)
		return from;
	}
	return -1;
	};
}

//
// Classes
//

// Base64 encode / decode - http://www.webtoolkit.info/
var Base64 = {
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
		input = Base64._utf8_encode(input);
		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if(isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if(isNaN(chr3)) {
				enc4 = 64;
			}
			output = output +
				this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
				this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
		}
		return output;
	},
	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		while (i < input.length) {
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output = output + String.fromCharCode(chr1);
			if(enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if(enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
		}
		output = Base64._utf8_decode(output);
		return output;
	},
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if(c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	},
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
		while ( i < utftext.length ) {
			c = utftext.charCodeAt(i);
			if(c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	}
};

//
// Script logic
//

$(document).ready(function()
{
	// scrolling for page reload
	var scrollTopPos = readCookie('scrollTop')
	if(scrollTopPos!=null && scrollTopPos !='')
	{
		createCookie('scrollTop',"",-1);
		$(window).scrollTop(scrollTopPos);
	}

	// HOVER POPUP
	$('*[data-popup]').css({'margin-left':'2px'}).mousemove(function(event)
	{
		var popup = $('#HOVERPOPUP');
		if(popup.length == 0)
		{
			$('body').prepend('<div id="HOVERPOPUP" style="display:none; position:absolute; z-index:1000; font-size:14px; background-color:white; border:2px solid black; border-radius:3px; padding:6px 10px;"></div>\n');
			popup = $('#HOVERPOPUP');
		}
		if(popup.css('display') == 'none')
			popup.html(Base64.decode($(this).attr('data-popup')));
		popup.css('top', event.pageY - 10 + 'px');
		popup.css('left', event.pageX + 10 + 'px');
		popup.show();
	}).mouseout(function(event)
	{
		$('#HOVERPOPUP').hide();
	});

	// custom component - floating label
	$('.floatinglabel input').each(function()
	{
		if($(this).val() == '')
		{
			$(this).prev().hide();
			$(this).css('padding-top', '');
		}
		else
		{
			$(this).prev().show();
			$(this).css('padding-top', '14px');
		}
	}).keyup(function()
	{
		if($(this).val() == '')
		{
			$(this).prev().hide();
			$(this).css('padding-top', '');
		}
		else
		{
			$(this).prev().show();
			$(this).css('padding-top', '14px');
		}
	});

	$('.floatinglabel textarea').each(function()
	{
		if($(this).val() == '')
		{
			$(this).prev().hide();
			$(this).css('padding-top', '');
		}
		else
		{
			$(this).prev().show().css({'background-color':'white', 'width':'calc(100% - 40px)', 'padding-top':'1px solid white', 'top': '4px'});
			$(this).css('padding-top', '24px');
		}
	}).keyup(function()
	{
		if($(this).val() == '')
		{
			$(this).prev().hide();
			$(this).css('padding-top', '');
		}
		else
		{
			$(this).prev().show().css({'background-color':'white', 'width':'calc(100% - 40px)', 'padding-top':'1px solid white', 'top': '4px'});
			$(this).css('padding-top', '24px');
		}
	});

	$('.floatinglabel select').each(function()
	{
		$(this).prev().show();
		$(this).css('padding-top', '14px');
	});

	// If there is an active submenu option scroll it into view (responsive view)
	var activeTab = $('.nav-tabs li.active');
	if (activeTab.length)
	{
		$('ul.nav-tabs').scrollLeft(activeTab.position().left);
	}

	// INLINE EDITOR LOGIC.
	$('.editable').click(function()
	{
		showEditor();
	});

	$('.editable-tag').click(function()
	{
		showTagEditor();
		initializeCustomSelect();
	});

	$('.editable-cancel').click(function()
	{
		hideEditor();
	});

	$('.editable-cancel-tag').click(function()
	{
		hideTagEditor();
	});

	// HOVER POPUP
	registerPopups();

	// Data URLs
	registerDataUrls();

	// HOVER POPUP 2
	$('*[data-popup3]').click(function(event)
	{
		var popup = $('#HOVERPOPUP2');
		if(popup.length == 0)
		{
			$('body').prepend('<div id="HOVERPOPUP2"></div>\n');
			popup = $('#HOVERPOPUP2');
		}
		if(popup.css('display') == 'none')
		{
			popup.html(Base64.decode($(this).attr('data-popup3')));
		}

		popup.show();
		popup.fadeOut(1000);
		var offset = $(event.currentTarget).offset();
		popup.css('top', offset.top - popup.height() - 20);
		popup.css('left', offset.left + ($(event.currentTarget).width() / 2) - ((popup.width() + 20)/2)); // add padding

		return true;
	});

	// DROPDOWNPOPUP
	$('*[data-dropdownpopup]').click(function(event)
	{
		var popup = $('#DROPDOWNPOPUP');
		if(popup.length == 0)
		{
			$('body').append('<div id="DROPDOWNPOPUP"></div>\n');
			popup = $('#DROPDOWNPOPUP');
		}
		if(typeof dropdownpopuplastclicked !== 'undefined' && dropdownpopuplastclicked != event.currentTarget)
		{
			$('#DROPDOWNPOPUP').css({'opacity':'0', 'margin-top':'20px'}).hide();
		}
		if(popup.css('display') == 'none')
		{
			var target_jq = $(event.currentTarget);
			var target_offset = target_jq.offset();
			var target_width = target_jq.width();
			var target_height = target_jq.height();

			var popup_width = popup.width();
			var popup_height = popup.height();

			var popup_offset_x = 0;
			var popup_offset_y = 0;

			if (target_jq.data('offset-x') !== undefined)
			{
				popup_offset_x = parseInt(target_jq.data('offset-x'));
			}
			if (target_jq.data('offset-y') !== undefined)
			{
				popup_offset_y = parseInt(target_jq.data('offset-y'));
			}

			popup.css('left', ((target_offset.left + target_width) - popup_width) + popup_offset_x);
			popup.css('top', (target_offset.top + target_height) + popup_offset_y);

			popup.html(Base64.decode($(this).attr('data-dropdownpopup')));
			popup.show().animate(
			{
				'opacity':'1',
				'margin-top':'0px'
			}, 200);

			if (!isScrolledIntoView(popup))
			{
				$('html, body').animate({
					scrollTop: target_offset.top - popup.height()*3
				}, 1500);
			}

			var popup_child = popup.find(':first-child');
			if (popup_child.length > 0)
			{
				popup_child.focus();
			}

			popup.focus();
			event.stopPropagation();
		}
		dropdownpopuplastclicked = event.currentTarget;
	});
	$('body').click(function(event)
	{
		if ($('#DROPDOWNPOPUP').css('display') == 'block')
		{
			$('#DROPDOWNPOPUP').animate(
			{
				'opacity':'0',
				'margin-top':'20px'
			}, 200, function()
			{
				$(this).hide();
			});
		}
		notificationsHide();
		menusidebarHide();
	});

	// select2 init
	var select2_list_jq = $("select[data-xselect2=yes]");
	select2_list_jq.each(function()
	{
		var select2 = $(this);

		if (select2.prop('style').width == '')
		{
			select2.css('width', '100%');
		}

		select2.select2();
	});

	// Clipboard copy
	$('*[data-clicktoclipboard]').click(function(event)
	{
		var item = $(this);
		var popup_text = Base64.decode(item.attr('data-popup2'));
		var popup = $('#HOVERPOPUP2');
		popup.text('Copied!');
		var offset = $(event.currentTarget).offset();
		popup.css('top', offset.top - popup.height() - 20);
		var left = offset.left + ($(event.currentTarget).width() / 2) - ((popup.width() + 20)/2)
		if(left < 0)
			left = 0;
		popup.css('left', left);
		var temp = $('<input>').css('opacity', '0');
		$('body').append(temp);
		temp.val($(this).attr('data-clicktoclipboard')).select();
		document.execCommand('copy');
		return false;
	});

	// back button handling
	var refTag = 'referrer=';
	if (window.location.hash && window.location.hash.toLowerCase().includes(refTag)) {
		var u = window.location.hash.substr(window.location.hash.indexOf(refTag) + refTag.length);
		if (u && u.length > 0) {
			$('#btn-vultr-back').each(function() {
				$(this).prop('href', u);
			});
		}
	}

	// #status notifications
	if (window.location.hash == '#status')
	{
		notificationsShow();
	}

	// custom component - accordion
	setupAccordions();

	// custom component - responsive tabs
	setupResponsiveTabs();

	// Prevent non-numeric input.
	$('.numbers_only').keypress(function(event)
	{
		var k = event.which;
		// Digits [0-9]
		if (k >= 48 && k <= 57)
		{
			return;
		}
		// Backspace
		if (k == 8)
		{
			return;
		}
		// Decimal
		if (k == 46)
		{
			return;
		}
		event.preventDefault();
	});

	// Custom input filter for dest_port #26712
	// Prevent non-numeric input.
	// Allow backspace, '-', and ':'
	$('.dest_port_filter').keypress(function(event)
	{
		var k = event.which;
		// Digits [0-9]
		if (k >= 48 && k <= 57)
		{
			return;
		}
		// Backspace
		if (k == 8)
		{
			return;
		}
		// -
		if (k == 45)
		{
			return;
		}
		// :
		if (k == 58)
		{
			return;
		}
		event.preventDefault();
	});
});

$(document).ajaxComplete(function (e, xhr, settings)
{
	// HOVER POPUP
	registerPopups();

	// Data URLs
	registerDataUrls();
});

//
// Global routines
//

function bytesFormatter(bytes, axis)
{
	var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	if (bytes <= 2) return 0;
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

function bpsFormatter(bits, axis)
{
	var sizes = ['Tbps', 'Gbps', 'Mbps', 'kbps'];
	for (var i=0;i<sizes.length;i++)
	{
		size = Math.pow(1024,(12-(i*3))/3);
		if (bits > size)
		{
			return (bits.toFixed(2) / size).toFixed(2) + ' ' + sizes[i];
		}
	}
	return bits + ' bps';
}

function percentFormatter(val, axis)
{
	return val.toFixed(2) + '%';
}

function nl2br(str, is_xhtml)
{
	var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
	return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

function viewConsole(SUBID)
{
	window.open('/subs/vps/novnc/?SUBID=' + SUBID,'','scrollbars=yes,menubar=no,height=450,width=750,left=0,top=0,screenX=0,screenY=0,resizable=no,toolbar=no,location=no,status=no');
}

function viewConsoleBM(SUBID)
{
	window.open('/subs/baremetal/novnc/?SUBID=' + SUBID,'','scrollbars=yes,menubar=no,height=450,width=750,left=0,top=0,screenX=0,screenY=0,resizable=no,toolbar=no,location=no,status=no');
}

function initializeCustomSelect()
{
	var select = $('select[name=tag]');

	if (select.prop('style').width == '') {
		select.css('width', '100%');
	}

	select.select2({
		minimumResultsForSearch: -1
	});
}

function showEditor()
{
	$('.editable-container').show();
	$('span[class=label_link]').hide();
	$('input[name=description], input[name=label]').focus();
	// For firewall/manage
	$('i.edit-button').hide();

	$(document).keyup(function(e)
	{
		var ESCAPE_KEYPRESS = (e.keyCode == 27);
		if (ESCAPE_KEYPRESS)
		{
			hideEditor();
		}
	});
}

function showTagEditor()
{
	var select = $('select[name=tag]');

	if (select.prop('style').width == '') {
		select.css('width', '100px');
	}

	select.select2({
		minimumResultsForSearch: -1
	});

	$('.editable-container-tag').show();
	$('.editable-tag').hide();
	$('input[name=customtag]').hide();

	$(document).keyup(function(e)
	{
		var ESCAPE_KEYPRESS = (e.keyCode == 27);
		if (ESCAPE_KEYPRESS)
		{
			hideTagEditor();
		}
	});
}

function checkTagValue()
{
	var select = $('select[name=tag]');
	var selected_custom_tag = select.val().toLowerCase() == 'custom';
	var custom_tag = $('div.editable-input-tag');
	var custom_tag_input = $('input[name=customtag]');

	if (selected_custom_tag)
	{
		custom_tag_input.show();
		if (select.data('select2'))
		{
			select.select2('destroy');
		}
		select.hide();
		custom_tag.show();
		custom_tag_input.focus();
	}
}

function hideEditor()
{
	$('.editable-container').hide();
	$('span[class=label_link]').show();
	$('i.edit-button').show();
}

function hideTagEditor()
{
	var select = $('select[name=tag]');

	$('.editable-container-tag').hide();
	$('.editable-tag').show();
	if (select.data('select2'))
	{
		select.select2('destroy');
	}
	select.hide();
}

function floatinglabelInputAttach(node)
{
	if($(node).val() == '')
	{
		$(node).prev().hide();
		$(node).css('padding-top', '');
	}
	else
	{
		$(node).prev().show();
		$(node).css('padding-top', '14px');
	}
	$(node).keyup(function()
	{
		if($(this).val() == '')
		{
			$(this).prev().hide();
			$(this).css('padding-top', '');
		}
		else
		{
			$(this).prev().show();
			$(this).css('padding-top', '14px');
		}
	});
}

function floatingLabelUpdate(n)
{
	if(n.val() == '')
	{
		n.prev().hide();
		n.css('padding-top', '');
	}
	else
	{
		n.prev().show();
		n.css('padding-top', '14px');
	}
}

function xhrFormSubmitAlertSetViewed(form, location)
{
	var formData = new FormData(form);
	var ALERTID = $(form).children('input[name=ALERTID]').val();
	var xhr = new XMLHttpRequest();
	xhr.open('POST', location, true);
	xhr.responseType = 'json';
	xhr.onload = function(e)
	{
		if(this.status == 200)
		{
			if(this.response.result == 'SUCCESS')
			{
				$('#alert' + ALERTID).hide();
			}
			else
			{
				alert(Base64.decode(this.response.result_string));
			}
		}
	};
	xhr.send(formData);
}

function xhrLabelUpdate(form, location)
{
	var formData = new FormData(form);
	var xhr = new XMLHttpRequest();
	xhr.open('POST', location, true);
	xhr.responseType = 'json';
	xhr.onload = function(e)
	{
		if(this.status == 200)
		{
			if(this.response.result == 'ERROR')
			{
				alert(Base64.decode(this.response.result_string));
			}
			else
			{
				newLabel = Base64.decode(this.response.result_string);
				if (newLabel == '')
				{
					$('div.editable').html('[Click here to set]');
				}
				else
				{
					$('div.editable').html(newLabel);
				}
			}
			$('span.label_link').show();
			$('.editable-container').hide();
			$('div.editable').addClass('editable-bg-transition');
			$('i.edit-button').show();
		}
	};
	xhr.send(formData);
}

function xhrDynamicLabelUpdate(form, location, main_ip)
{
	// We have to decode this and then re-encode it later in the logic for it to render correctly.
	var main_ip = Base64.decode(main_ip);
	var formData = new FormData(form);
	var xhr = new XMLHttpRequest();
	xhr.open('POST', location, true);
	xhr.responseType = 'json';
	xhr.onload = function(e)
	{
		if(this.status == 200)
		{
			if(this.response.result == 'ERROR')
			{
				alert(Base64.decode(this.response.result_string));
			}
			else
			{
				newLabel = Base64.decode(this.response.result_string);
				if (newLabel == '')
				{
					$('div.editable').html('[Click here to set]');
					// Blank out server information header on blank submit.
					$('span#header_label')
						.removeClass()
						.html('')
					;
				}
				else
				{
					$('div.editable').html(newLabel);

					// Append label to server information header.
					$('span#header_label')
						.removeClass()
						.html('('+newLabel+')')
						.addClass('editable-bg-transition')
					;
				}

				// Alter dropdown info to reflect new label.
				var dropdown_info = Base64.encode(main_ip + ' ' + newLabel);
				$('.server_actions').children('button').each(function()
				{
					if ($(this).attr('id') == 'has-dropdown')
					{
						$(this).attr('dropdown-info', dropdown_info);
					}
				});
			}
			$('span.label_link').show();
			$('.editable-container').hide();
			$('div.editable').addClass('editable-bg-transition');
			$('i.edit-button').show();
		}
	};
	xhr.send(formData);
}

function xhrTagUpdate(form, location)
{
	var formData = new FormData(form);
	var xhr = new XMLHttpRequest();
	var defaultTags = ['Cache', 'Custom', 'Database', 'DNS', 'Mail', 'Storage', 'Web'];
	xhr.open('POST', location, true);
	xhr.responseType = 'json';
	xhr.onload = function(e)
	{
		if(this.status == 200)
		{
			if(this.response.result == 'ERROR')
			{
				alert(Base64.decode(this.response.result_string));
			}
			else
			{
				newLabel = Base64.decode(this.response.result_string);
				if (newLabel == '')
				{
					$('div.editable-tag').html('[Click here to set]');
				}
				else
				{
					if ($.inArray(newLabel, defaultTags) == -1)
					{
						if ($('option.custom_tag').length)
						{
							$('option.custom_tag').html(newLabel);
							$('option.custom_tag').val(newLabel);
							$('select[name=tag]').val(newLabel);
						}
						else
						{
							$('select[name=tag]').find('option.dynamic_option').remove();
							$('select[name=tag]').prepend($('<option>').val(newLabel).html(newLabel).addClass('dynamic_option'));
							$('select[name=tag]').val(newLabel);
						}
					}
					$('div.editable-tag').html(newLabel);
				}
			}
			hideTagEditor();
			$('div.editable-tag').addClass('editable-bg-transition');
		}
	};
	xhr.send(formData);
}

function xhrSetNotifications(form, location)
{
	var formData = new FormData(form);
	var xhr = new XMLHttpRequest();
	xhr.open('POST', location, true);
	xhr.responseType = 'json';
	xhr.onload = function(e)
	{
		if(this.status == 200)
		{
			if(this.response.result == 'ERROR')
			{
				alert(Base64.decode(this.response.result_string));
			}
			else
			{
				// console.log(Base64.decode(this.response.result_string));
			}
		}
	};
	xhr.send(formData);
}

function xhrFormSubmit(form, location)
{
	var formData = new FormData(form);
	var xhr = new XMLHttpRequest();
	xhr.open('POST', location, true);
	xhr.responseType = 'json';
	xhr.onload = function(e)
	{
		if(this.status == 200)
		{
			if(this.response.result_string && this.response.result_string!='')
			{
				alert(Base64.decode(this.response.result_string));
			}
			if(this.response.result_redirectURL && this.response.result_redirectURL!='')
			{
				window.location = Base64.decode(this.response.result_redirectURL);
				return;
			}
			if(this.response.page_reload)
			{
				createCookie('scrollTop', $(window).scrollTop(), 5)
				window.location.reload(true);
			}
		}
	};
	xhr.send(formData);
}

function formDialogShow(content)
{
	var dialog = $('#FORMDIALOG');
	if(dialog.length == 0)
	{
		var html = '\n';
		html += '<div id="FORMDIALOG" class="dialogPopupBackground" tabindex="0">\n';
		html += '	<div class="dialogPopup">\n';
		html += '		<div class="dialogclosebutton" onclick="formDialogHide();"></div>\n';
		html += '		<div id="FORMDIALOGCONTENT">\n';
		html += '		</div>\n';
		html += '	</div>\n';
		html += '</div>';
		$('body').prepend(html);
		dialog = $('#FORMDIALOG');
		dialog.keyup(function(event)
		{
			if(event.which == 27)
			{
				formDialogHide();
			}
		});
	}
	$('#FORMDIALOGCONTENT').html(Base64.decode(content));
	dialog.fadeIn(250).focus();
	setTimeout(function(){dialog.find('input[type=text]:first').focus();}, 300);
}

function formDialogHide()
{
	$('#FORMDIALOG').fadeOut(250);
}

function okDialogShow(content)
{
	var html = '\n';
	html += '<div class="dialogContent">\n';
	html += '	' + Base64.decode(content) + '\n';
	html += '</div>\n';
	html += '<div class="dialogButtons">\n';
	html += '	<input type="button" value="OK" class="btn_primary" onclick="formDialogHide();"/>\n';
	html == '</div>\n';
	formDialogShow(Base64.encode(html));
}

function confirmDialogShow(content, form, formtype)
{
	formtype = typeof formtype !== 'undefined' ? formtype : 'form';
	var dialog = $('#CONFIRMDIALOG');
	if(dialog.length == 0)
	{
		var html = '\n';
		html += '<div id="CONFIRMDIALOG" class="dialogPopupBackground" tabindex="0">\n';
		html += '	<div class="dialogPopup">\n';
		html += '		<div class="dialogclosebutton" onclick="$(\'#CONFIRMDIALOG\').hide();"></div>\n';
		html += '		<div class="dialogContent">\n';
		html += '		</div>\n';
		html += '		<div class="dialogButtons">\n';
		html += '			<input type="button" value="OK" class="btn_primary"/>\n';
		html += '			<input type="button" value="CANCEL" class="btn_primary" onclick="$(\'#CONFIRMDIALOG\').hide();"/>\n';
		html += '		</div>';
		html += '	</div>';
		html += '</div>';
		$('body').prepend(html);
		dialog = $('#CONFIRMDIALOG');
		dialog.keyup(function(event)
		{
			if(event.which == 27)
			{
				formDialogHide();
			}
		});
	}
	$('#CONFIRMDIALOG .dialogContent').html(Base64.decode(content));
	dialog.show();
	dialog.focus();
	if (formtype == "form")
	{
		dialog.find('input[value=OK]').unbind('click').click(function(){form.submit(); dialog.hide();});
	}
	else if (formtype == "function")
	{
		dialog.find('input[value=OK]').unbind('click').click(function(){eval(form); dialog.hide();});
	}
}

function superConfirmDialogShow(content, form, formtype)
{
	formtype = typeof formtype !== 'undefined' ? formtype : 'form';
	var dialog = $('#SUPERCONFIRMDIALOG');
	if(dialog.length == 0)
	{
		var html = '\n';
		html += '<div id="SUPERCONFIRMDIALOG" class="dialogPopupBackground" tabindex="0">\n';
		html += '	<div class="dialogPopup">\n';
		html += '		<div class="dialogclosebutton" onclick="$(\'#SUPERCONFIRMDIALOG\').hide();"></div>\n';
		html += '		<div class="dialogContent">\n';
		html += '		</div>\n';
		html += '		<div class="dialogButtons">\n';
		html += '			<label class="floatinglabel">';
		html += '				<span>Type "YES" to confirm</span>';
		html += '				<input type="text" name="superconfirm_yes" size="3" style="width:175px;" placeholder="Type &quot;YES&quot; to confirm">\n';
		html += '			</label>';
		html += '			<input type="button" value="OK" class="btn_primary"/>\n';
		html += '			<input type="button" value="CANCEL" class="btn_primary" onclick="$(\'#SUPERCONFIRMDIALOG\').hide();"/>\n';
		html += '		</div>';
		html += '	</div>';
		html += '</div>';
		$('body').prepend(html);
		floatinglabelInputAttach($('input[name=superconfirm_yes]'));
		dialog = $('#SUPERCONFIRMDIALOG');
		dialog.keyup(function(event)
		{
			if(event.which == 27)
			{
				formDialogHide();
			}
		});
	}
	$('#SUPERCONFIRMDIALOG  .dialogContent').html(Base64.decode(content));
	dialog.show();
	dialog.focus();
	if (formtype == "form")
	{
		dialog.find('input[value=OK]').unbind('click').click(function(){ if ($('input[name=superconfirm_yes]').val().toUpperCase() == 'YES') { form.submit(); dialog.hide(); } else { alert('Please type "YES" to confirm'); } });
	}
	else if (formtype == "function")
	{
		dialog.find('input[value=OK]').unbind('click').click(function(){ if ($('input[name=superconfirm_yes]').val().toUpperCase() == 'YES') { eval(form); dialog.hide(); } else { alert('Please type "YES" to confirm'); } });
	}
}

function overdueDialogShow()
{
	var dialog = $('#OVERDUEDIALOG');
	if(dialog.length == 0)
	{
		var html = '\n';
		html += '<div id="OVERDUEDIALOG" class="dialogPopupBackground" tabindex="0">\n';
		html += '	<div class="dialogPopup">\n';
		html += '		<div class="dialogclosebutton" onclick="overdueDialogHide();"></div>\n';
		html += '		<div class="dialogContent">\n';
		html += '			We have been having trouble recharging your payment methods on file and your account is significantly overdue.\n';
		html += '			<hr class="hr10"/>To prevent account suspension, please <span class="label_link" onclick="closeNoticeAndRedirect(\'overdue\', \'/billing/\');">make a deposit</span> or <span class="label_link" onclick="closeNoticeAndRedirect(\'overdue\', \'/support/create_ticket/\');">contact our support team</span> as soon as possible!\n';
		html += '		</div>\n';
		html += '		<div class="dialogButtons">\n';
		html += '			<input type="button" value="Close Notice" onclick="overdueDialogHide();"/>';
		html += '		</div>';
		html += '	</div>\n';
		html += '</div>';
		$('body').prepend(html);
		dialog = $('#OVERDUEDIALOG');
		dialog.keyup(function(event)
		{
			if(event.which == 27)
			{
				overdueDialogHide();
			}
		});
	}
	dialog.fadeIn(250).focus();
}

function overdueDialogHide()
{
	closeNotice('overdue');
	$('#OVERDUEDIALOG').fadeOut(250);
}

function mmd()
{
	eval(function(p,a,c,k,e,d){e=function(c){return c.toString(36)};if(!''.replace(/^/,String)){while(c--){d[c.toString(a)]=k[c]||c.toString(a)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('h="i";(7(){6 1=7(){6 2=3.c(\'d\');2.e=(\'5:\'==3.j.k?\'5:\':\'q:\')+\'//4.o.n/8/4.8\';3.p.f(2)};b(0.a){0.a(\'r\',1,m)}l b(0.9){0.9(\'g\',1)}})();',28,28,'window|loadDeviceJs|element|document|device|https|var|function|js|attachEvent|addEventListener|if|createElement|script|src|appendChild|onload|maxmind_user_id|15054|location|protocol|else|false|com|maxmind|body|http|load'.split('|'),0,{}))
}

function confirmDestroy2(SUBID, description, disk_type, auto_backups)
{
	var html = '';
	html += '<form method="post" action="/subs/?SUBID=' + SUBID + '" style="max-width:500px;" onsubmit="if($(this).find(\'input[name=confirm_destroy_yes]\').val().toLowerCase() == \'yes\'){ return true; } alert(\'Please type YES to confirm\'); return false;">\n';
	html += '	<input type="hidden" name="csrf_token" value="' + htmlencode(csrf_token) + '">\n';
	html += '	<input type="hidden" name="SUBID" value="' + htmlencode(SUBID) + '">\n';
	html += '	<input type="hidden" name="action" value="destroy">\n';

	html += '	Server: ' + htmlencode(description) + '\n';
	if(disk_type == 'SATA')
	{
		html += '	<hr class="hr10"/>\n';
		html += '	<input type="checkbox" name="wipe_instance" id="wipe_instance" class="checkboxcheckmark">\n';
		html += '	<label for="wipe_instance">Perform secure SATA wipe</label>\n';
	}
	html += '	<hr class="hr20"/>\n';

	html += '	Are you sure you want to destroy this server? Any data on your server will be permanently lost!<br/>\n';
	if(auto_backups == 'yes')
	{
		html += '	Note that any automatic backups will be deleted after 48 hours.<br/>\n';
	}
	html += '	<hr class="hr10"/>\n';
	html += '	Please type "YES" to confirm: <input type="text" name="confirm_destroy_yes" size="3"><br/>\n';

	html += '	<input type="submit" value="OK"/>&nbsp;\n';
	html += '	<input type="button" value="CANCEL" onclick="formDialogHide()"/>\n';
	html += '</form>\n';

	formDialogShow(Base64.encode(html));
}

function htmlencode(str)
{
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

function closeNotice(notice_type)
{
	$.ajax({
		data: {
			'csrf_token': csrf_token,
			'notice_type': notice_type,
		},
		url: '/_ajax/close_alert.php',
		type: 'POST',
	});
	$('#notice_'+notice_type).hide();
}

function closeNoticeAndRedirect(notice_type, url)
{
	$.ajax({
		data: {
			'csrf_token': csrf_token,
			'notice_type': notice_type,
		},
		url: '/_ajax/close_alert.php',
		type: 'POST',
		success: function(data, textStatus, jqXHR){
			window.location = url;
		}
	});
	$('#notice_'+notice_type).hide();
}

function createCookie(name, value, hours)
{
	if(hours == 'never')
	{
		var expires = '; expires=Tue, 19 Jan 2038 03:14:07 GMT';
	}
	else if(hours)
	{
		var date = new Date();
		date.setTime(date.getTime() + (hours*60*60*1000));
		var expires = '; expires=' + date.toGMTString();
	}
	else
	{
		var expires = '';
	}
	document.cookie = name + '=' + value + expires + '; path=/';
}

function readCookie(name)
{
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if(c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name)
{
	createCookie(name,"",-1);
}

function subscriptionCheckMassAction()
{
	var SUBID = [];
	$('div[data-checkMassAction]').each(function()
	{
		SUBID.push($(this).attr('data-checkMassAction'));
	});

	if(SUBID.length < 1)
		return;

	$.ajax
	({
		type: 'POST',
		dataType: 'json',
		url: '/ajaj_get.php',
		data: {'function':'subscriptionGetMassAction', 'SUBID':SUBID, 'massaction_started_at': massaction_started_at, 'csrf_token': csrf_token},
		success: function(response, textStatus, xhr)
		{
			if(response.result == 'SUCCESS')
			{
				for(var index in response.subscriptions)
				{
					SUBID = response.subscriptions[index];
					var row = $('div[data-checkMassAction=' + SUBID + ']');
					console.log(row);

					$(row.children()[5]).html(massaction_finished_desc);

					// Remove "data-checkMassAction" attribute (Will not send another check status request for this row)
					row.removeAttr('data-checkMassAction');
				}
			}

			setTimeout(subscriptionCheckMassAction, 15000);

			return;
		},
		error: function(response)
		{
			return;
		}
	});
}

function subscriptionsCheckStatus()
{
	var SUBID = [];
	$('div[data-checkSubscriptionStatus]').each(function()
	{
		SUBID.push($(this).attr('data-checkSubscriptionStatus'));
	});
	if(SUBID.length < 1)
		return;

	$.ajax
	({
		type: 'POST',
		dataType: 'json',
		url: '/ajaj_get.php',
		data: {'function':'subscriptionGetStatus', 'SUBID':SUBID, 'csrf_token': csrf_token},
		success: function(response)
		{
			if(response.result == 'SUCCESS')
			{
				for(var SUBID in response.subscriptions)
				{
					if (response.subscriptions[SUBID]['status'] == 'closed')
					{
						var row = $('div[data-checkSubscriptionStatus=' + SUBID + ']');
						row.remove();
					}
					else if (response.subscriptions[SUBID]['status'] == 'active')
					{
						var row = $('div[data-checkSubscriptionStatus=' + SUBID + ']');

						if (response.subscriptions[SUBID]['type'] == 'vps' || response.subscriptions[SUBID]['type'] == 'baremetal')
						{
							// Update "Description" column
							row.children().eq(1).children('.tablesecondline').html(Base64.decode(response.subscriptions[SUBID]['description']));

							// Update "Status" column
							var html = '';
							var warning_states = ['Restoring', 'Snapshot', 'Resizing', 'Upgrading', 'Provisioning', 'Installing', 'Unknown'];
							friendly_state = response.subscriptions[SUBID]['friendly_state'];
							if (friendly_state != "")
							{
								if ($.inArray(friendly_state, warning_states) !== -1)
								{
									html += '<i class="sp-orange"></i> <span class="status_warning_2"> ' + friendly_state + '</span>';
								}
								else if (friendly_state == "Destroying")
								{
									html += '<i class="sp-red"></i> <span class="status_error_2"> ' + friendly_state + '</span>';
								}
								else if (friendly_state == "Running")
								{
									html += '<span class="status_success"> ' + friendly_state + '</span>';
								}
								else
								{
									html += '<span class="status_disabled"> ' + friendly_state + '</span>';
								}
							}
							row.children().eq(5).html(html);

							if (response.subscriptions[SUBID]['state_pending'] == "no")
							{
								// Update "Actions" column
								row.children().eq(6).html('<a href="/subs/?SUBID=' + SUBID + '">Manage</a>');

								// Remove "data-checkSubscriptionStatus" attribute (Will not send another check status request for this row)
								row.removeAttr('data-checkSubscriptionStatus');
							}
						}
						else if (response.subscriptions[SUBID]['type'] == 'block')
						{
							row.children().eq(2).html('active');
							row.children().eq(4).html('<a href="/subs/?SUBID=' + SUBID + '">Manage</a>');
							// Remove "data-checkSubscriptionStatus" attribute (Will not send another check status request for this row)
							row.removeAttr('data-checkSubscriptionStatus');
						}
					}
				}
				if (response.hasOwnProperty('subscriptions_closed'))
				{
					for (var i = 0; i < response.subscriptions_closed.length; i++)
					{
						var SUBID = response.subscriptions_closed[i];
						var row = $('div[data-checkSubscriptionStatus=' + SUBID + ']');
						row.remove();
					}
				}
			}

			setTimeout(subscriptionsCheckStatus, 15000);

			return;
		},
		error: function(response)
		{
			//alert('Your request could not be processed at this time.');
			return;
		}
	});
}

function removeHash()
{
    var scrollV, scrollH, loc = window.location;
    if ("pushState" in history)
        history.pushState("", document.title, loc.pathname + loc.search);
    else {
		// legacy method
        sv = document.body.scrollTop;
        sh = document.body.scrollLeft;
        loc.hash = "";
        document.body.scrollTop = sv;
        document.body.scrollLeft = sh;
    }
}

function registerPopups()
{
	$('*[data-popup2]').tooltip({
		container: 'body',
	});

	var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	if (!mobile) {
		$('*[no-mobile-data-popup]').tooltip({
			container: 'body',
		});
	}
}

function registerDataUrls()
{
	$('[data-url]').off('click').click(function() {
		var url = $(this).data('url');
		location.href = url;
	});

	$(document).off('mouseup', '[data-url]').on('mouseup', '[data-url]', function(e) {
		if (e.which == 2) {
			var url = $(this).data('url');
			e.preventDefault();
			e.stopPropagation();
			window.open(url, '_blank');
		}
	});
}

/**
 * Detect if element is in the viewport
 * @param elem
 * @returns {boolean}
 */
function isScrolledIntoView(elem)
{
	var elementTop     = elem.offset().top;
	var elementBottom  = elementTop + elem.outerHeight();
	var viewportTop    = $(window).scrollTop();
	var viewportBottom = viewportTop + $(window).height() - 200;

	return elementBottom > viewportTop && elementTop < viewportBottom;
}

function menusidebarHide()
{
	$('#menusidebar_block').css('left', '');
}
function menusidebarShow()
{
	$('#menusidebar_block').css('left', '0px');
}
function notificationsHide()
{
	$('#notifications_block').css('right', '');
}
function notificationsShow()
{
	$('#notifications_block').css('right', '0px');
}

function hidePostMessages()
{
	$('.success_message').hide();
	$('.error_message').hide();
}

function changeTabSubmenu(tabid, cb)
{
	//$('#tabl_' + tabid).addClass('header3_1active').siblings().removeClass('header3_1active');
	$('#tabl_' + tabid).addClass('active').siblings().removeClass('active');
	$('#tabc_' + tabid).css('display', '').siblings('.submenutabcontent').css('display','none');

	if (arguments.length == 2)
	{
		cb();
	}
	else
	{
		if (tabid == 'subsusage')
		{
			setTimeout('onGraphsShow()', 0);
		}
		if (tabid == 'subsddos' && $('#ddosAttackHistory').length > 0)
		{
			var xhr = new XMLHttpRequest();
			xhr.open('GET', '/_ajax/ddosAttackHistory.php?SUBID=' + $('#ddosAttackHistory').attr('data-SUBID'), true);
			xhr.onload = function(e)
			{
				if(this.status == 200)
				{
					$('#ddosAttackHistory').html(this.responseText);
				}
			};
			xhr.send();
		}
	}
}

function changeSideTab(node, base)
{
	var i = $(node).index();
	i = (i/2);
	$(node).prop('checked', true);
	$(node).parent().next().children().eq(i).show().siblings().hide();

	// for pages where we have a sub-tab and want to update the hash
	if (base) {
		var tabname = $(node).prop('id').split('_');
		tabname = tabname[1] || tabname[0];
		var hash = '#' + base + '-' + tabname;
		if (history.pushState)
		{
		    history.pushState(null, null, hash);
		}
		else
		{
		    location.hash = hash;
		}
	}
}

// Create select style nav for mobile devices. (#25717)
function mobilizeSubmenu(submenu)
{
	var radios = submenu.find('input[type=radio]');
	var select = $('select[name=mobile-submenu]');

	// Select all radios of selected input.
	$.each(radios, function(index)
	{
		var radio = $(radios[index]);
		var label = $('label[for='+radio.attr('id')+']').html().trim();
		var onchange = radio.attr('onchange');

		// Grab important attributes and translate them to the select.
		select.append($('<option>')
			.text(label)
			.attr('value', radio.attr('id'))
			.attr('onchange', onchange)
		);
	});

	select.change(function()
	{
		// Build the initial functioning of the radio buttons.
		var node     = $('#' + $(this).val());
		var selector = '$("#'+$(this).val()+'")';
		var fn       = node.attr('onchange').replace('this', selector);
		// Run these functions on the select change.
		eval(fn);
	});
}

function setupAccordions()
{
	$('.accordion .acc-title').on('click', function()
	{
		if (!$(this).parent().hasClass('open'))
		{
			$('.accordion .collapse.in').collapse('hide');
			$('.accordion li').removeClass('open');
			$(this).parent().find('.collapse').collapse('toggle');
			$(this).closest('li').addClass('open');
		} else
		{
			$('.accordion li').removeClass('open');
			$(this).parent().find('.collapse').collapse('toggle');
		}
	});
}

function setupResponsiveTabs()
{
	var container_array_jq = $('.tabs-responsive > .tabs-container');

	container_array_jq.each(function()
	{
		var container_jq = $(this);
		var tabs_jq = container_jq.find('ul.nav-tabs');

		if (tabs_jq.length > 0)
		{
			// Button clicks
			var btn_prev = container_jq.find('.btn-prev');
			var btn_next = container_jq.find('.btn-next');

			var scrollNav = function(obj_jq, val)
			{
				var obj = obj_jq[0];
				obj.scrollLeft += val;

				if (obj.scrollLeft < 0)
				{
					obj.scrollLeft = 0;
				}
				else if (obj.scrollLeft > obj.scrollWidth)
				{
					obj.scrollLeft = obj.scrollWidth;
				}
			};

			var scroll_px = 40;

			btn_prev.click(function()
			{
				scrollNav(tabs_jq, -scroll_px);
			});
			btn_prev.on('tap', function()
			{
				scrollNav(tabs_jq, -scroll_px);
			});
			btn_next.click(function()
			{
				scrollNav(tabs_jq, scroll_px);
			});
			btn_next.on('tap', function()
			{
				scrollNav(tabs_jq, scroll_px);
			});
		}
	});
}

function clamp(min, max, val)
{
	if (min > max)
	{
		var temp = max;
		max = min;
		min = temp;
	}

	if (val < min)
	{
		val = min;
	}
	if (val > max)
	{
		val = max;
	}

	return val;
}

function inactivity_check(cookie_name)
{
	var expire = 0;

	var cookie_val = readCookie(cookie_name);
	if (cookie_val !== null)
	{
		cookie_val = parseInt(cookie_val);

		if ((typeof cookie_val === 'number') && ((cookie_val % 1) === 0))
		{
			expire = cookie_val;
		}
	}

	if (expire > 0)
	{
		var local_time = Math.floor(new Date().getTime() / 1000);
		if (local_time < expire)
		{
			var remain = expire - local_time;
			if (remain <= (60 * 10))
			{
				inactivity_show();
			}
			else
			{
				inactivity_hide();
			}
		}
		else
		{
			// session has expired
			inactivity_hide();
		}
	}
	else
	{
		// session has been terminated
		inactivity_hide();
	}
}

function inactivity_show()
{
	$('#header1_session').show();
	$('#header1_session').addClass('grow');
	$('html, body').animate({ scrollTop: 0 }, 'slow');
}

function inactivity_hide()
{
	$('#header1_session').removeClass('grow');
}

function inactivity_continue()
{
	$.ajax({
		url: '/_ajax/touch_session.php',
		cache: false,
		dataType: 'json',
		type: 'GET',
		success: function (data, textStatus, jqXHR)
		{
			// ...
		},
		error: function (jqXHR, textStatus, errorThrown)
		{
			// ...
		}
	});

	inactivity_hide();
}
