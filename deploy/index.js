$(function()
{
	if (baremetal_selected || vdc_selected || blockstorage_selected)
	{
		selectAvailableDC();
	}

	updateServerLocation();
	updateDCIDSelected();
	// Since server type versions are a custom GUI component, they will need to be manually reselected after POST
	var tempcomponent = $('span[data-componentid=' + selectedCOMPONENTID + ']');
	var tempapp = $('span[data-appid=' + selectedAPPID + ']');
	if (tempapp.length > 0)
	{
		updateAPPIDSelected(tempapp);
	}
	else if (tempcomponent.length > 0)
	{
		updateCOMPONENTIDSelected(tempcomponent);
	}
	updateUploadISO();
	updateInstanceCount('');
	refreshPlanDisplay('');

	$('input[name=user_data]').change(function ()
	{
		if ($('input[name=user_data]').prop('checked'))
		{
			$('#userdatainput').show();
		}
		else
		{
			$('#userdatainput').hide();
		}
	});

	$('input[name=private_network]').change(function ()
	{
		if (!$(this).prop('disabled'))
		{
			if ($(this).prop('checked'))
			{
				$('#multiple_private').show();

				var deployBlock = $('.deploy_block:visible');
				for(i=0; i < deployBlock.length; i++)
				{
					$(deployBlock).eq(i).children('.deploy_block_step').html(i+1);
				}
			}
			else
			{
				$('#multiple_private').hide();

				var deployBlock = $('.deploy_block:visible');
				for(i=0; i < deployBlock.length; i++)
				{
					$(deployBlock).eq(i).children('.deploy_block_step').html(i+1);
				}
			}
		}
	});


	$('body').click(function(event)
	{
		$('.deploy_osversioncontainer').hide();
		hideVersionStyle();
	});

	$('#confirmodersubmit').click(function()
	{
		// Submit for IE11 (does not support "form" attribute for inputs)
		$('#confirmodersubmit').prop({'disabled':true});
		$('#orderform').submit();
		return false;
	});

	function checkHostname(elem) {
		var v = $(elem).val();
		if (v.match(/[ ]/g, "") != null) {
	        $(elem).val(v.replace(/[ ]/g, "_"));
	    }
	}

	for (var i = 1; i <= 10; i++) {
		$('input[name="vm_hostname' + i + '"]').keyup(function()
		{
			checkHostname(this);
			var hostNum = $(this).prop('name').slice(-1);
			var label = $('input[name="label' + hostNum + '"]');
			label.val($(this).val());
			floatingLabelUpdate(label);
		});
	}
});





// Called when "Disk Type" or "Server Location Filter" change
// Will update the "Server Location" section to only show valid choices based on currently selected disk type and locations filters
// Will auto-select the first valid DCID if the currently selected DCID becomes invalid
function updateServerLocation()
{
	// Disable all Locations
	$('input[name=DCID]').prop({'disabled':true});

	var diskType = $('input[name=disk_type]:checked').val();
	if (diskType == 'SSD' || diskType == 'SATA' || diskType == 'DEDICATED' || diskType == 'BAREMETAL' || diskType == 'CUSTOM')
	{
		if(availabilityMap.hasOwnProperty(diskType))
		{
			for (var DCID in availabilityMap[diskType])
			{
				if (!availabilityMap[diskType].hasOwnProperty(DCID))
				{
					continue;
				}
				if (!availabilityMap[diskType][DCID].hasOwnProperty('0'))
				{
					continue;
				}

				if (!$.isArray(availabilityMap[diskType][DCID]['0']))
				{
					$('input[name=DCID][value=' + DCID + ']').prop({'disabled':false});
					$('input[name=DCID][value=' + DCID + ']').removeClass('deploylocationsoldout');
				}
				else
				{
					// If plan is backordered we'll get back an empty array instead of an object with key/value pairs
					$('input[name=DCID][value=' + DCID + ']').prop({'disabled':false});
					$('input[name=DCID][value=' + DCID + ']').addClass('deploylocationsoldout');
				}
			}
		}
	}

	// Only show location filters with available options
	var locationAmericaCount = 0;
	var locationEuropeCount = 0;
	var locationOceaniaCount = 0;
	var locationAsiaCount = 0;
	$('input[name=DCID]').each(function()
	{
		if($(this).prop('disabled'))
			return;
		if($(this).data('continent') == 'North America' || $(this).data('continent') == 'Central America' || $(this).data('continent') == 'South America')
		{
			++locationAmericaCount;
		}
		else if($(this).data('continent') == 'Europe')
		{
			++locationEuropeCount;
		}
		else if($(this).data('continent') == 'Oceania')
		{
			++locationOceaniaCount;
		}
		else if($(this).data('continent') == 'Asia')
		{
			++locationAsiaCount;
		}
	});
	$('input[name=locationfilter]').prop({'disabled':false});
	if(locationAmericaCount == 0)
	{
		$('#locationfilter_america').prop({'disabled':true});
	}
	if(locationEuropeCount == 0)
	{
		$('#locationfilter_europe').prop({'disabled':true});
	}
	if(locationOceaniaCount == 0)
	{
		$('#locationfilter_oceania').prop({'disabled':true});
	}
	if(locationAsiaCount == 0)
	{
		$('#locationfilter_asia').prop({'disabled':true});
	}
	if(locationAmericaCount == 0 && locationEuropeCount == 0 && locationOceaniaCount == 0 && locationAsiaCount == 0)
	{
		$('#locationfilter_all').prop({'disabled':true});
		$('#locations_filters').hide();
		$('#location_unavailable_message').show();
	}
	else
	{
		$('#locations_filters').show();
		$('#location_unavailable_message').hide();
	}

	// If selected location filter is invalid, select first valid location filter
	if($('input[name=locationfilter]:checked').length == 0 || $('input[name=locationfilter]:checked').prop('disabled'))
	{
		$('input[name=locationfilter]:not(:disabled)').first().prop({'checked':true});
	}

	// Disable filtered locations
	var locationFilter = $('input[name=locationfilter]:checked').val();
	$('input[name=DCID]').each(function()
	{
		//Africa
		if(locationFilter == 'america')
		{
			if($(this).data('continent') != 'North America' && $(this).data('continent') != 'Central America' && $(this).data('continent') != 'South America')
			{
				$(this).prop({'disabled':true});
			}
		}
		else if(locationFilter == 'europe')
		{
			if($(this).data('continent') != 'Europe')
			{
				$(this).prop({'disabled':true});
			}
		}
		else if(locationFilter == 'oceania')
		{
			if($(this).data('continent') != 'Oceania')
			{
				$(this).prop({'disabled':true});
			}
		}
		else if(locationFilter == 'asia')
		{
			if($(this).data('continent') != 'Asia')
			{
				$(this).prop({'disabled':true});
			}
		}
	});

	// If selected DCID is invalid, select first valid DCID
	if($('input[name=DCID]:checked').length == 0 || $('input[name=DCID]:checked').prop('disabled'))
	{
		$('input[name=DCID]:not(:disabled)').first().prop({'checked':true});
	}
}


// Called when a DCID is selected
// Displays the "Sold out" prompt if the selected location is sold out (backordered)
function updateDCIDSelected()
{
	if ($('input[name=DCID]:checked').hasClass('deploylocationsoldout'))
	{
		if (!capacity_message_disabled)
		{
			$('#vpsLocationNotifyDCID input[name=backorder_DCID]').val($('input[name=DCID]:checked').val());
			$('#vpsLocationNotifyDCID input[name=backorder_disk_type]').val($('input[name=disk_type]:checked').val());
			confirmDialogShow(Base64.encode('This location is currently sold out.  We anticipate additional capacity within the next one to two weeks.  Would you like to be notified when we have additional capacity?'), $('#vpsLocationNotifyDCID'));
		}
	}

	var selected_DCID = $('input[name=DCID]:checked').val();
	$('label[data-DCID]').each(function (index, cur) {
		if ($(cur).data('dcid') != selected_DCID)
		{
			$(cur).hide();
		}
		else
		{
			$(cur).show();
		}
	});
}


// Called when a COMPONENTID is selected (this is only for special GUI components for OS's that have multiple versions)
// Will update the parent node with the data for the selected component
function updateCOMPONENTIDSelected(n)
{
	$('.osversionselectmultiple').html('Select Version');

	var COMPONENTID_input = $(n).parent().parent().prev();
	COMPONENTID_input.prop({'checked':true});
	COMPONENTID_input.attr('data-ostype', $(n).data('ostype'));
	COMPONENTID_input.attr('data-surcharge_vps', $(n).data('surcharge_vps'));
	COMPONENTID_input.attr('data-surcharge_baremetal', $(n).data('surcharge_baremetal'));
	COMPONENTID_input.attr('data-userdata', $(n).data('userdata'));
	COMPONENTID_input.attr('data-title', $(n).data('title'));
	COMPONENTID_input.attr('data-min_cpu_count', $(n).data('min_cpu_count'));
	COMPONENTID_input.attr('data-min_mem_mb', $(n).data('min_mem_mb'));
	COMPONENTID_input.attr('data-min_disk_gb', $(n).data('min_disk_gb'));
	COMPONENTID_input.attr('data-mdisk_mode_array', $(n).data('mdisk_mode_array'));
	COMPONENTID_input.val($(n).data('componentid'));

	$(n).parent().prev().html($(n).html());
	$(n).parent().hide();
}

function updateAPPIDSelected(n)
{
	$('.app_os_line').html('');
	$('.osversionselectmultiple').html('Select Version');

	var APPID_input = $(n).parent().parent().prev();
	APPID_input.prop({'checked':true});
	APPID_input.attr('data-ostype', $(n).data('ostype'));
	APPID_input.attr('data-surcharge_vps', $(n).data('surcharge_vps'));
	APPID_input.attr('data-surcharge_baremetal', $(n).data('surcharge_baremetal'));
	APPID_input.attr('data-shortname', $(n).data('shortname'));
	APPID_input.attr('data-title', $(n).data('title'));
	APPID_input.attr('data-min_cpu_count', $(n).data('min_cpu_count'));
	APPID_input.attr('data-min_mem_mb', $(n).data('min_mem_mb'));
	APPID_input.attr('data-min_disk_gb', $(n).data('min_disk_gb'));
	APPID_input.attr('data-mdisk_mode_array', $(n).data('mdisk_mode_array'));
	APPID_input.attr('data-version', $(n).data('version'));
	APPID_input.val($(n).data('appid'));

	//$(n).parent().prev().html($(n).html());
	$(n).parent().prev().prev().text('On ' + $(n).data('parent_os_title'));
	$(n).parent().prev().text($(n).data('version'));
	$(n).parent().hide();
}


// Called when an "Upload ISO" option is selected
// Will update GUI to display correct form fields for the seleced "Upload ISO" option
function updateUploadISO()
{
	$('#iso_typeISO_content').slideUp();
	$('#iPXE_custom_content').slideUp();
	$('#iPXE_script_content').slideUp();
	if ($('input[name=iso_type]:checked').val() == 'ISO')
	{
		$('#iso_typeISO_content').slideDown();
	}
	else if ($('input[name=iso_type]:checked').val() == 'iPXE_custom')
	{
		$('#iPXE_custom_content').slideDown();
	}
	else
	{
		$('#iPXE_script_content').slideDown();
	}
}


// Called when the instance count is changed (incremented/decremented)
function updateInstanceCount(change)
{
	var instanceCount = parseInt($('#instanceCountInput').val());
	if(change == '-')
	{
		instanceCount -= 1;
	}
	else if (change == '+')
	{
		instanceCount += 1;
	}
	if(instanceCount < 1)
	{
		instanceCount = 1;
	}
	else if (instanceCount > 10)
	{
		instanceCount = 10;
	}
	$('#instanceCountInput').val(instanceCount);
	$('#instanceCount').html(instanceCount);
}


function refreshPlanDisplay(refreshAction)
{
	//	formValid - indicates if any of the following are in an invalid state (up to the current point of execution):
	//		diskTypeNode
	//		datacenterNode
	//		serverTypeNode
	//			componentNode	(if serverTypeNode is 'x64' || 'i386')
	//			appNode			(if serverTypeNode is 'app')
	//			snapshotNode	(if serverTypeNode is 'snapshot')
	//		vpsPlanNode


	var formValid = true;


	// Disk Type
	var diskTypeNode = $('input[name=disk_type]:checked');


	// Message blocks
	$('div[id^="messages_disk_type"]').hide();
	$('div[id="messages_disk_type_' + diskTypeNode.val() + '"]').show();


	// Datacenter
	var datacenterNode = $('input[name=DCID]:checked');
	if(datacenterNode.length > 0 && datacenterNode.hasClass('deploylocationsoldout'))
	{
		formValid = false;
	}
	if (datacenterNode.length == 0)
	{
		formValid = false;
	}

	// Remove version style
	hideVersionStyle();


	// Server Type
	if (diskTypeNode.val() == 'BAREMETAL')
	{
		$('#servertype_upload').prop({'checked':false, 'disabled':true});
		$('#servertype_custom').prop({'checked':false, 'disabled':true});

		var show_backup = $('#servertype_backup').attr('data-baremetal') === 'yes';
		if (show_backup)
		{
			$('#servertype_backup').prop({'disabled':false});
		}
		else
		{
			$('#servertype_backup').prop({'checked':false, 'disabled':true});
		}
		var show_snapshot = $('#servertype_snapshot').attr('data-baremetal') === 'yes';
		if (show_snapshot)
		{
			$('#servertype_snapshot').prop({'disabled':false});
		}
		else
		{
			$('#servertype_snapshot').prop({'checked':false, 'disabled':true});
		}

		// #26195 - Hiding these options for bare metal.
		$('label[for=auto_backups]').hide();
		$('label[for=ddos_protection]').hide();
		$('label[for=user_data]').hide();
		$('label[for=private_network]').hide();
		$('label[for=dev_feature1]').hide();
	}
	else
	{
		$('label[for=auto_backups]').show();
		$('label[for=ddos_protection]').show();
		$('label[for=user_data]').show();
		$('label[for=private_network]').show();
		$('label[for=dev_feature1]').show();

		$('#servertype_upload').prop({'disabled':false});
		$('#servertype_custom').prop({'disabled':false});
		$('#servertype_backup').prop({'disabled':false});
		$('#servertype_snapshot').prop({'disabled':false});
	}

	var serverTypeNode = $('input[name=servertype]:checked');
	if (serverTypeNode.length == 0)
	{
		$('input[name=servertype]:not(:disabled)').first().prop({'checked':true});
	}
	serverTypeNode = $('input[name=servertype]:checked');
	$('.servertype_section').each(function()
	{
		var servertype_section = $(this);

		if (servertype_section.attr('id') == 'servertype_' + serverTypeNode.val() + '_section')
		{
			servertype_section.show();
		}
		else
		{
			servertype_section.hide();
		}

		servertype_section.find('input[name="COMPONENTID"]').each(function()
		{
			var COMPONENTID_input = $(this);
			var COMPONENTID_label = COMPONENTID_input.next();

			var os_name = COMPONENTID_label.attr('data-osname');
			if (os_name === undefined)
			{
				os_name = 'unknown';
			}

			if (os_name == 'Windows')
			{
				var win_available = 0;
				var VPSPLANID_available_map = {};
				if (availabilityMap.hasOwnProperty(diskTypeNode.val()) && availabilityMap[diskTypeNode.val()].hasOwnProperty(datacenterNode.val()))
				{
					var available_os = '0';
					if (availabilityMap[diskTypeNode.val()][datacenterNode.val()].hasOwnProperty('124'))
					{
						available_os = '124';
					}
					else if (availabilityMap[diskTypeNode.val()][datacenterNode.val()].hasOwnProperty('240'))
					{
						available_os = '240';
					}

					VPSPLANID_available_map = availabilityMap[diskTypeNode.val()][datacenterNode.val()][available_os];
					if ($.isArray(VPSPLANID_available_map))
					{
						// If plan is backordered we'll get back an empty array instead of an object with key/value pairs
						VPSPLANID_available_map = {};
					}
				}

				$('input[name=VPSPLANID]').each(function()
				{
					if (VPSPLANID_available_map.hasOwnProperty($(this).val()))
					{
						if (VPSPLANID_available_map[$(this).val()] == 'yes')
						{
							win_available++;
						}
					}
				});

				var win_soldout = windows_sold_out && (diskTypeNode.val() == 'DEDICATED' || diskTypeNode.val() == 'BAREMETAL');
				if (diskTypeNode.val() != 'BAREMETAL')
				{
					if (win_available == 0)
					{
						win_soldout = true;
					}
				}

				if (win_soldout)
				{
					COMPONENTID_label.attr('disabled', true);
					COMPONENTID_label.addClass('disabled_os');
					COMPONENTID_label.find('.osversionselectmultiple').html('Temporarily Sold Out');
				}
				else
				{
					COMPONENTID_label.removeAttr('disabled');
					COMPONENTID_label.removeClass('disabled_os');

					var osversionselectmultiple = COMPONENTID_label.find('.osversionselectmultiple');
					if (osversionselectmultiple.text() == 'Temporarily Sold Out')
					{
						osversionselectmultiple.html('Select Version');
					}
				}
			}
		});
	});
	if(serverTypeNode.val() == 'x64' || serverTypeNode.val() == 'i386')
	{
		var componentNode = $('input[name=COMPONENTID]:checked');
		// Fix page refresh bug
		if(componentNode.length == 1 && componentNode.val() == '')
		{
			componentNode.prop({'checked':false});
			componentNode = $('input[name=COMPONENTID]:checked');
		}
		if(componentNode.length == 0)
		{
			formValid = false;
		}
	}
	else if(serverTypeNode.val() == 'app')
	{
		var appNode = $('input[name=APPID]:checked');
		if (appNode.length == 0)
		{
			formValid = false;
		}
	}
	else if (serverTypeNode.val() == 'snapshot')
	{
		var snapshotNode = $('input[name=SNAPSHOTID]:checked');
		if (snapshotNode.length == 0)
		{
			formValid = false;
		}
	}
	else if (serverTypeNode.val() == 'backup')
	{
		var backupNode = $('input[name=BACKUPID]:checked');
		if (backupNode.length == 0)
		{
			formValid = false;
		}
	}
	else if (serverTypeNode.val() == 'custom')
	{
		var publicIsoNode = $('input[name=public_ISOID]:checked');
		if (publicIsoNode.length == 0)
		{
			formValid = false;
		}
	}

	// Server Type - License surcharge
	$('span.surcharge_tag').each(function()
	{
		var span = $(this);

		var price = 0;
		if (diskTypeNode.val() == 'BAREMETAL')
		{
			var data = span.data('surcharge_baremetal');
			if (data !== undefined)
			{
				price = parseFloat(data);
			}
		}
		else
		{
			var data = span.data('surcharge_vps');
			if (data !== undefined)
			{
				price = parseFloat(data);
			}
		}

		if (price > 0.01)
		{
			var text = '$' + price.toFixed(2) + '/mo';
			span.text(text);
			span.show();
		}
		else
		{
			span.hide();
		}
	});

	// OS Note
	if(!formValid)
	{
		$('#deployosnote').hide();
	}
	else if((serverTypeNode.val() == 'x64' || serverTypeNode.val() == 'i386') && componentNode.data('ostype') == 'windows')
	{
		$('#deployosnote').show();
	}
	else if(serverTypeNode.val() == 'app' && appNode.data('ostype') == 'windows')
	{
		$('#deployosnote').show();
	}
	else
	{
		$('#deployosnote').hide();
	}


	// Server Size
	if(!formValid)
	{
		$('input[name=METALPLANID]').prop({'disabled':true});
		$('input[name=VPSPLANID]').prop({'disabled':true});
	}
	else if (diskTypeNode.val() == 'BAREMETAL')
	{
		$('input[name=VPSPLANID]').prop({'disabled':true});
		var METALPLANID_available_map = {};
		if( availabilityMap.hasOwnProperty(diskTypeNode.val()) && availabilityMap[diskTypeNode.val()].hasOwnProperty(datacenterNode.val()))
		{
			var available_os = (serverTypeNode.val() == 'x64' || serverTypeNode.val() == 'i386') ? componentNode.val() : '0';
			if (!availabilityMap[diskTypeNode.val()][datacenterNode.val()].hasOwnProperty(available_os))
			{
				available_os = '0';
			}

			METALPLANID_available_map = availabilityMap[diskTypeNode.val()][datacenterNode.val()][available_os];
			if ($.isArray(METALPLANID_available_map))
			{
				// If plan is backordered we'll get back an empty array instead of an object with key/value pairs
				METALPLANID_available_map = {};
			}
		}
		$('input[name=METALPLANID]').each(function ()
		{
			if (!METALPLANID_available_map.hasOwnProperty($(this).val()))
			{
				$(this).prop({'disabled':true});
				return;
			}
			if(serverTypeNode.val() == 'x64' || serverTypeNode.val() == 'i386')
			{
				if (!checkRequirementsDisk(parseInt(componentNode.data('min_disk_gb')), parseInt($(this).data('disk')), $(this).prop('checked'), componentNode.data('title')))
				{
					$(this).prop({'disabled':true});
					return;
				}
				if (!checkRequirementsCPU(parseInt(componentNode.data('min_cpu_count')), parseInt($(this).data('cpu')), $(this).prop('checked'), componentNode.data('title')))
				{
					$(this).prop({'disabled':true});
					return;
				}
				if (!checkRequirementsMemory(parseInt(componentNode.data('min_mem_mb')), parseInt($(this).data('memory')), $(this).prop('checked'), componentNode.data('title')))
				{
					$(this).prop({'disabled':true});
					return;
				}
			}
			else if(serverTypeNode.val() == 'app')
			{
				if (!checkRequirementsDisk(parseInt(appNode.data('min_disk_gb')), parseInt($(this).data('disk')), $(this).prop('checked'), appNode.data('title')))
				{
					$(this).prop({'disabled':true});
					return;
				}
				if (!checkRequirementsCPU(parseInt(appNode.data('min_cpu_count')), parseInt($(this).data('cpu')), $(this).prop('checked'), appNode.data('title')))
				{
					$(this).prop({'disabled':true});
					return;
				}
				if (!checkRequirementsMemory(parseInt(appNode.data('min_mem_mb')), parseInt($(this).data('memory')), $(this).prop('checked'), appNode.data('title')))
				{
					$(this).prop({'disabled':true});
					return;
				}
			}
			$(this).prop({'disabled':false});
		});
		var bareMetalPlanNode = $('input[name=METALPLANID]:checked');
		// If currently selected plan is disabled, uncheck it
		if (bareMetalPlanNode.prop('disabled'))
		{
			bareMetalPlanNode.prop({'checked':false});
			bareMetalPlanNode = $('input[name=METALPLANID]:checked');
		}
		// If no valid plan is selected, then select the first valid plan.
		if(bareMetalPlanNode.length == 0)
		{
			$('input[name=METALPLANID]:not(:disabled)').first().prop({'checked':true});
			bareMetalPlanNode = $('input[name=METALPLANID]:checked');
		}
		if(bareMetalPlanNode.length == 0)
		{
			formValid = false;
		}
	}
	else
	{
		$('input[name=METALPLANID]').prop({'disabled':true});
		var VPSPLANID_available_map = {};
		if( availabilityMap.hasOwnProperty(diskTypeNode.val()) && availabilityMap[diskTypeNode.val()].hasOwnProperty(datacenterNode.val()))
		{
			var available_os = (serverTypeNode.val() == 'x64' || serverTypeNode.val() == 'i386') ? componentNode.val() : '0';
			if (!availabilityMap[diskTypeNode.val()][datacenterNode.val()].hasOwnProperty(available_os))
			{
				available_os = '0';
			}

			VPSPLANID_available_map = availabilityMap[diskTypeNode.val()][datacenterNode.val()][available_os];
			if ($.isArray(VPSPLANID_available_map))
			{
				// If plan is backordered we'll get back an empty array instead of an object with key/value pairs
				VPSPLANID_available_map = {};
			}
		}
		$('input[name=VPSPLANID]').each(function ()
		{
			if (!VPSPLANID_available_map.hasOwnProperty($(this).val()))
			{
				$(this).prop({'disabled':true});
				return;
			}

			if (VPSPLANID_available_map[$(this).val()] == 'soldout')
			{
				$(this).addClass('deployplansoldout');
			}
			else
			{
				$(this).removeClass('deployplansoldout');
			}
			if(serverTypeNode.val() == 'x64' || serverTypeNode.val() == 'i386')
			{
				if (!checkRequirementsDisk(parseInt(componentNode.data('min_disk_gb')), parseInt($(this).data('disk')), $(this).prop('checked'), componentNode.data('title')))
				{
					$(this).prop({'disabled':true});
					return;
				}
				if (!checkRequirementsCPU(parseInt(componentNode.data('min_cpu_count')), parseInt($(this).data('cpu')), $(this).prop('checked'), componentNode.data('title')))
				{
					$(this).prop({'disabled':true});
					return;
				}
				if (!checkRequirementsMemory(parseInt(componentNode.data('min_mem_mb')), parseInt($(this).data('memory')), $(this).prop('checked'), componentNode.data('title')))
				{
					$(this).prop({'disabled':true});
					return;
				}
			}
			else if(serverTypeNode.val() == 'app')
			{
				if (!checkRequirementsDisk(parseInt(appNode.data('min_disk_gb')), parseInt($(this).data('disk')), $(this).prop('checked'), appNode.data('title')))
				{
					$(this).prop({'disabled':true});
					return;
				}
				if (!checkRequirementsCPU(parseInt(appNode.data('min_cpu_count')), parseInt($(this).data('cpu')), $(this).prop('checked'), appNode.data('title')))
				{
					$(this).prop({'disabled':true});
					return;
				}
				if (!checkRequirementsMemory(parseInt(appNode.data('min_mem_mb')), parseInt($(this).data('memory')), $(this).prop('checked'), appNode.data('title')))
				{
					$(this).prop({'disabled':true});
					return;
				}
			}
			else if (serverTypeNode.val() == 'snapshot')
			{
				if (!checkRequirementsDisk(parseInt(snapshotNode.data('min_disk_gb')), parseInt($(this).data('disk')), $(this).prop('checked'), snapshotNode.data('title')))
				{
					$(this).prop({'disabled':true});
					return;
				}
			}
			$(this).prop({'disabled':false});
		});
		var vpsPlanNode = $('input[name=VPSPLANID]:checked');
		// If currently selected plan is disabled, uncheck it
		if (vpsPlanNode.prop('disabled'))
		{
			vpsPlanNode.prop({'checked':false});
			vpsPlanNode = $('input[name=VPSPLANID]:checked');
		}
		// If currently selected plan is sold out, uncheck it
		if (vpsPlanNode.hasClass('deployplansoldout'))
		{
			// show notify popup if the user clicked on this plan
			if(refreshAction == 'VPSPLANIDchange')
			{
				$('#vpsLocationNotifyVPSPLANID input[name=backorder_DCID]').val($('input[name=DCID]:checked').val());
				$('#vpsLocationNotifyVPSPLANID input[name=backorder_VPSPLANID]').val($('input[name=VPSPLANID]:checked').val());
				//okDialogShow(Base64.encode('The sandbox plan is currently sold out. Please choose a different plan size.'));
				//confirmDialogShow(Base64.encode('This plan is currently sold out at the selected location.  We anticipate additional capacity within the next one to two weeks.  Would you like to be notified when we have additional capacity?'), $('#vpsLocationNotifyVPSPLANID'));
			}
			else
			{
				//okDialogShow(Base64.encode('Selected plan is currently sold out at this location. Available plan options have changed.'));
			}
			vpsPlanNode.prop({'checked':false});
			vpsPlanNode = $('input[name=VPSPLANID]:checked');
		}
		// If no valid plan is selected, select the default plan (if valid)
		if (vpsPlanNode.length == 0)
		{
			$('input[name=VPSPLANID]').each(function ()
			{
				if ($(this).prop('disabled') || $(this).hasClass('deployplansoldout'))
				{
					return true;
				}
				if ($(this).attr('data-plandefault') == 'yes')
				{
					$(this).prop({'checked':true});
					return false;
				}
				return true;
			});
			vpsPlanNode = $('input[name=VPSPLANID]:checked');
		}
		// If no valid plan is selected, then select the first valid plan.
		if (vpsPlanNode.length == 0)
		{
			$('input[name=VPSPLANID]').each(function ()
			{
				if ($(this).prop('disabled') || $(this).hasClass('deployplansoldout'))
				{
					return true;
				}
				$(this).prop({'checked':true});
				return false;
			});
			vpsPlanNode = $('input[name=VPSPLANID]:checked');
		}
		if (vpsPlanNode.length == 0)
		{
			formValid = false;
		}
	}
	if (!formValid)
	{
		$('#dc_backordered').show();
	}
	else
	{
		$('#dc_backordered').hide();
	}


	// Additional Features - IPv6
	if(!formValid)
	{
		$('input[name=vm_ipv6_requested]').prop({'checked':false, 'disabled':true});
	}
	else
	{
		$('input[name=vm_ipv6_requested]').prop({'disabled':false});
	}

	// Additional Features - Private Network
	if(!formValid)
	{
		$('input[name=private_network]').prop({'checked':false, 'disabled':true});
		$('#multiple_private').hide();
	}
	else if (diskTypeNode.val() == 'BAREMETAL')
	{
		$('input[name=private_network]').prop({'checked':false, 'disabled':true});
		$('#multiple_private').hide();
	}
	else
	{
		$('input[name=private_network]').prop({'disabled':false});

		if ($('input[name=private_network]').prop('checked'))
		{
			$('#multiple_private').show();

			// Update numbering on visible configuration sections
			$('.deploy_block_step:visible').each(function(index)
			{
				$(this).html(index+1);
			});
		}
		else
		{
			$('#multiple_private').hide();
			// Update numbering on visible configuration sections
			$('.deploy_block_step:visible').each(function(index)
			{
				$(this).html(index+1);
			});
		}
	}


	// Additional Features - Auto Backups
	var monthlySurchangeForBackups = 0;
	if(!formValid)
	{
		$('input[name=auto_backups]').prop({'checked':false, 'disabled':true});
		$('#auto_backups_supported').hide();
	}
	else if (diskTypeNode.val() == 'SSD')
	{
		$('input[name=auto_backups]').prop({'disabled':false});
		monthlySurchangeForBackups = parseFloat(vpsPlanNode.data('monthly')) * (1.0 - parseFloat(vpsPlanNode.data('salediscount'))) * parseFloat($('#auto_backups').attr('data-cost'));
		$('#auto_backups_supported').html('$' + monthlySurchangeForBackups.toFixed(2).replace('.', '<span style="font-size:17px;">.</span>') + '/mo').show();
		if (!$('input[name=auto_backups]').prop('checked'))
		{
			monthlySurchangeForBackups = 0;
		}
	}
	else
	{
		$('input[name=auto_backups]').prop({'checked':false, 'disabled':true});
		$('#auto_backups_supported').hide();
	}


	// Additional Features - DDOS
	var monthlySurchangeForDDOS = 0.0;
	if (!formValid)
	{
		$('input[name=ddos_protection]').prop({'checked':false, 'disabled':true});
		$('#ddos_protection_cost').hide();
	}
	else if (diskTypeNode.val() == 'BAREMETAL')
	{
		$('input[name=ddos_protection]').prop({'checked':false, 'disabled':true});
		$('#ddos_protection_cost').hide();
	}
	else if (datacenterNode.data('ddos') != 'yes')
	{
		$('input[name=ddos_protection]').prop({'checked':false, 'disabled':true});
		$('#ddos_protection_cost').hide();
	}
	else if (diskTypeNode.val() == 'DEDICATED')
	{
		$('input[name=ddos_protection]').prop({'disabled':false});
		$('#ddos_protection_cost').html('FREE').show();
	}
	else
	{
		$('input[name=ddos_protection]').prop({'disabled':false});
		$('#ddos_protection_cost').html('$' + $('input[name=ddos_protection]').data('ddosprotectionmonthly') + '/mo').show();
		var ddosProtectionNode = $('input[name=ddos_protection]:checked');
		if(ddosProtectionNode.length > 0)
		{
			monthlySurchangeForDDOS = parseFloat(ddosProtectionNode.data('ddosprotectionmonthly'));
		}
	}


	// Additional Features - User Data (Cloud Init)
	if (!formValid)
	{
		$('input[name=user_data]').prop({'checked':false, 'disabled':true});
		$('textarea[name=userdata]').prop({'disabled':true});
	}
	else if (($('input[name=servertype]:checked').val() == 'i386' || $('input[name=servertype]:checked').val() == 'x64') && componentNode.data('userdata') != 'yes')
	{
		$('input[name=user_data]').prop({'checked':false, 'disabled':true});
		$('textarea[name=userdata]').prop({'disabled':true});
	}
	else
	{
		$('input[name=user_data]').prop({'disabled':false});
		$('textarea[name=userdata]').prop({'disabled':false});
	}
	if ($('input[name=user_data]').prop('checked'))
	{
		$('#userdatainput').show();
	}
	else
	{
		$('#userdatainput').hide();
	}


	// Additional Features - Block Storage
	if (!formValid || datacenterNode.val() != 1)
	{
		$('#block_storage_wanted').prop({'disabled':true});
		$('#blockstoragecompat').hide();
	}
	else if (diskTypeNode.val() == 'SSD')
	{
		$('#block_storage_wanted').prop({'disabled':false});
		$('#blockstoragecompat').show();
	}
	else
	{
		$('#block_storage_wanted').prop({'disabled':true});
		$('#blockstoragecompat').hide();
	}


	// Startup Script
	if (!formValid)
	{
		$('#startup_script').hide();
	}
	else if (serverTypeNode.val() == 'i386')
	{
		$('#startup_script').show();
	}
	else if (serverTypeNode.val() == 'x64')
	{
		$('#startup_script').show();
	}
	else if (serverTypeNode.val() == 'app')
	{
		$('#startup_script').show();
	}
	else if (serverTypeNode.val() == 'upload')
	{
		$('#startup_script').hide();
	}
	else if (serverTypeNode.val() == 'custom')
	{
		$('#startup_script').hide();
	}
	else if (serverTypeNode.val() == 'backup')
	{
		$('#startup_script').hide();
	}
	else if (serverTypeNode.val() == 'snapshot')
	{
		$('#startup_script').hide();
	}


	// SSH Keys
	if(!formValid)
	{
		$('#ssh_keys').hide();
	}
	else if((serverTypeNode.val() == 'x64' || serverTypeNode.val() == 'i386'))
	{
		if (componentNode.data('ostype') == 'windows')
		{
			$('#ssh_keys').hide();
		}
		else
		{
			$('#ssh_keys').show();
		}
	}
	else if(serverTypeNode.val() == 'app')
	{
		if (appNode.data('ostype') == 'windows')
		{
			$('#ssh_keys').hide();
		}
		else
		{
			$('#ssh_keys').show();
		}
	}
	else if (serverTypeNode.val() == 'upload')
	{
		$('#ssh_keys').hide();
	}
	else if(serverTypeNode.val() == 'custom')
	{
		$('#ssh_keys').hide();
	}
	else if(serverTypeNode.val() == 'backup')
	{
		$('#ssh_keys').hide();
	}
	else if(serverTypeNode.val() == 'snapshot')
	{
		$('#ssh_keys').hide();
	}
	else
	{
		$('#ssh_keys').show();
	}


	// Instance count
	var instanceCount = $('input[name=instanceCount]').val();
	if(instanceCount == 1)
	{
		$('input[name=label1]').attr('placeholder', 'Enter server label');
		$('input[name=label1]').prev().html('Enter server label');
		$('input[name=vm_hostname1]').attr('placeholder', 'Enter server hostname');
		$('input[name=vm_hostname1]').prev().html('Enter server hostname');
	}
	else
	{
		$('input[name=label1]').attr('placeholder', 'Enter server 1 label');
		$('input[name=label1]').prev().html('Enter server 1 label');
		$('input[name=vm_hostname1]').attr('placeholder', 'Enter server 1 hostname');
		$('input[name=vm_hostname1]').prev().html('Enter server 1 hostname');
	}
	for(var i=1; i <= 10; ++i)
	{
		if(i <= instanceCount)
		{
			$('input[name=label' + i + ']').parent().show();
			$('input[name=vm_hostname' + i + ']').parent().show();
		}
		else
		{
			$('input[name=label' + i + ']').parent().hide();
			$('input[name=vm_hostname' + i + ']').parent().hide();
		}
	}


	// IP Address
	if(!formValid || instanceCount != 1)
	{
		$('select[name=floating_v4]').prop({'disabled':true}).parent().hide();
	}
	else
	{
		$('select[name=floating_v4]').prop({'disabled':false}).parent().show();
		$('select[name=floating_v4] option').each(function ()
		{
			if ($(this).data('dcid') == 'all')
			{
				$(this).prop({'disabled':false});
			}
			else if ($(this).data('dcid') == datacenterNode.val())
			{
				$(this).prop({'disabled':false});
			}
			else
			{
				$(this).prop({'disabled':true});
			}
		});
		if($('select[name=floating_v4] option:selected').prop('disabled'))
		{
			$('select[name=floating_v4] option:not(:disabled):first').prop({'selected':true});
		}
		$('select[name=floating_v4]').select2();
	}


	// Disk Configuration
	var deploy_block_multidisk_jq =$('#deploy_block_multidisk');

	if (diskTypeNode.val() == 'BAREMETAL')
	{
		deploy_block_multidisk_jq.show();

		// Lookup supported modes
		var mode_array = [];

		var mode_array_csv = undefined;
		if (serverTypeNode.val() == 'x64' || serverTypeNode.val() == 'i386')
		{
			mode_array_csv = componentNode.attr('data-mdisk_mode_array');
		}
		else if (serverTypeNode.val() == 'app')
		{
			mode_array_csv = appNode.attr('data-mdisk_mode_array');
		}

		if (mode_array_csv === undefined || mode_array_csv === null)
		{
			mode_array_csv = '';
		}

		mode_array = mode_array_csv.split(',');

		// Update components
		for (var mode in mdisk_mode_enum)
		{
			if (!mdisk_mode_enum.hasOwnProperty(mode))
			{
				continue;
			}

			var component_has_mode = false;
			for (var i = 0; i < mode_array.length; i++)
			{
				if (mode == 'none' || mode == mode_array[i])
				{
					component_has_mode = true;
					break;
				}
			}

			var block_jq = deploy_block_multidisk_jq.find('#mdisk_mode_' + mode);
			if (component_has_mode)
			{
				block_jq.show();
			}
			else
			{
				block_jq.hide();
			}

			if (mode == 'none')
			{
				block_jq.find('input[type="radio"]').prop({'checked': true});
			}
			else
			{
				block_jq.find('input[type="radio"]').prop({'checked': false});
			}
		}
	}
	else
	{
		deploy_block_multidisk_jq.hide();
	}

	// Firewall Group
	if (diskTypeNode.val() == 'BAREMETAL')
	{
		$('#deploy_block_firewall_group').hide();
	}
	else
	{
		$('#deploy_block_firewall_group').show();
	}


	// Server Hostname & Label


	// Hardware Type
	if (diskTypeNode.val() == 'BAREMETAL')
	{
		$('#deploy_block_hardware_type').hide();
	}
	else
	{
		$('#deploy_block_hardware_type').show();
	}


	// Update numbering on visible configuration sections
	$('.deploy_block_step:visible').each(function(index)
	{
		$(this).html(index+1);
	});

	// Order Total / Order button
	if(!formValid)
	{
		$('#order_total').html('---');
		$('#order_total_hr').html('---');
		$('#confirmodersubmit').prop({'disabled':true});
	}
	else
	{
		var monthlyPriceFull = 0.0;
		var saleDiscount = 0.0;

		if (diskTypeNode.val() == 'BAREMETAL')
		{
			var planChecked = $('input[name=METALPLANID]:checked');
			monthlyPriceFull = parseFloat(planChecked.data('monthly'));
			if (instanceCount > 1)
			{
				monthlyPriceFull *= parseFloat(instanceCount);
			}
			saleDiscount = parseFloat(planChecked.data('salediscount'));
		}
		else
		{
			var planChecked = $('input[name=VPSPLANID]:checked');
			monthlyPriceFull = parseFloat(planChecked.data('monthly'));
			if (instanceCount > 1)
			{
				monthlyPriceFull *= parseFloat(instanceCount);
			}
			saleDiscount = parseFloat(planChecked.data('salediscount'));
		}

		var monthlyPriceSale = monthlyPriceFull * (1.0 - saleDiscount);

		var monthlySurchargeForServerType = 0.0;
		if (serverTypeNode.val() == 'x64' || serverTypeNode.val() == 'i386')
		{
			var surcharge = componentNode.attr('data-surcharge');
			var surcharge_vps = componentNode.attr('data-surcharge_vps');
			var surcharge_baremetal = componentNode.attr('data-surcharge_baremetal');

			if (diskTypeNode.val() == 'BAREMETAL')
			{
				if (surcharge_baremetal !== undefined)
				{
					monthlySurchargeForServerType += parseFloat(surcharge_baremetal);
				}
				else if (surcharge_vps !== undefined)
				{
					monthlySurchargeForServerType += parseFloat(surcharge_vps);
				}
				else if (surcharge !== undefined)
				{
					monthlySurchargeForServerType += parseFloat(surcharge);
				}
			}
			else
			{
				if (surcharge_vps !== undefined)
				{
					monthlySurchargeForServerType += parseFloat(surcharge_vps);
				}
				else if (surcharge !== undefined)
				{
					monthlySurchargeForServerType += parseFloat(surcharge);
				}
			}
		}
		else if (serverTypeNode.val() == 'app')
		{
			var surcharge = appNode.attr('data-surcharge');
			var surcharge_vps = appNode.attr('data-surcharge_vps');
			var surcharge_baremetal = appNode.attr('data-surcharge_baremetal');

			// #26937 - don't add plesk license cost to total.
			var app_name = appNode.attr('data-shortname');

			if ($.inArray(app_name, ['pleskonyx_webadmin', 'pleskonyx_webpro', 'pleskonyx_webhost']) !== -1)
			{
				// Plesk Onyx Web Admin is Free.
				if (app_name !== 'pleskonyx_webadmin')
				{
					if (diskTypeNode.val() == 'BAREMETAL')
					{
						var plesk_hourly_price = (surcharge_baremetal / 672).toFixed(3);
					}

					if (diskTypeNode.val() == 'SSD')
					{
						var plesk_hourly_price = (surcharge_vps / 672).toFixed(3);
					}

					$('span[class=plesk_hourly_price]').text(plesk_hourly_price);
					$('div[class=plesk_disclaimer]').show();
				}
				else
				{
					$('div[class=plesk_disclaimer]').hide();
				}

				surcharge = surcharge_vps = surcharge_baremetal = 0;
			}
			else
			{
				$('div[class=plesk_disclaimer]').hide();
			}

			if (diskTypeNode.val() == 'BAREMETAL')
			{
				if (surcharge_baremetal !== undefined)
				{
					monthlySurchargeForServerType += parseFloat(surcharge_baremetal);
				}
				else if (surcharge_vps !== undefined)
				{
					monthlySurchargeForServerType += parseFloat(surcharge_vps);
				}
				else if (surcharge !== undefined)
				{
					monthlySurchargeForServerType += parseFloat(surcharge);
				}
			}
			else
			{
				if (surcharge_vps !== undefined)
				{
					monthlySurchargeForServerType += parseFloat(surcharge_vps);
				}
				else if (surcharge !== undefined)
				{
					monthlySurchargeForServerType += parseFloat(surcharge);
				}
			}
		}
		else if (serverTypeNode.val() == 'snapshot')
		{
			monthlySurchargeForServerType += snapshotNode.data('license');
		}

		monthlyPriceSale += ((monthlySurchargeForServerType + monthlySurchangeForDDOS + monthlySurchangeForBackups) * parseFloat(instanceCount));

		$('#order_total').html('$' + monthlyPriceSale.toFixed(2));
		$('#order_total_hr').html('$' + (monthlyPriceSale / 672).toFixed(3));
		$('#confirmodersubmit').prop({'disabled':false});
	}
}

function toggleStartupScripts(e)
{
	$('input[name=SCRIPTID]').each(function()
	{
		if (this != e)
		{
			$(this).prop({'checked':false});
		}
	});
}
function checkRequirementsDisk(minimum, value, showWarning, description)
{
	if (minimum <= 0)
	{
		return true;
	}
	if (value <= 0)
	{
		return true;
	}
	if (value >= minimum)
	{
		return true;
	}
	if (showWarning)
	{
		okDialogShow(Base64.encode(description + ' requires a plan with at least ' + minimum + 'GB disk space. Available plan options have changed.'));
	}
	return false;
}
function checkRequirementsCPU(minimum, value, showWarning, description)
{
	if (minimum <= 0)
	{
		return true;
	}
	if (value <= 0)
	{
		return true;
	}
	if (value >= minimum)
	{
		return true;
	}
	if (showWarning)
	{
		okDialogShow(Base64.encode(description + ' requires a plan with at least ' + minimum + ' CPU cores. Available plan options have changed.'));
	}
	return false;
}
function checkRequirementsMemory(minimum, value, showWarning, description)
{
	if (minimum <= 0)
	{
		return true;
	}
	if (value <= 0)
	{
		return true;
	}
	if (value >= minimum)
	{
		return true;
	}
	if (showWarning)
	{
		var memory = minimum;
		if (memory % 1000 == 0)
		{
			memory = (memory / 1000).toString() + 'GB';
		}
		else if (memory % 1024 == 0)
		{
			memory = (memory / 1024).toString() + 'GB';
		}
		else
		{
			memory = memory + 'MB';
		}
		okDialogShow(Base64.encode(description + ' requires a plan with at least ' + memory + ' of memory. Available plan options have changed.'));
	}
	return false;
}

function hideVersionStyle()
{
	$('.deploy_osversioncontainer').hide();
	$('.deploy_osversioncontainer').parent().removeClass('deploy_osversioncontainer_select');
}

function addVersionStyle(node)
{
	hideVersionStyle();
	node.addClass('deploy_osversioncontainer_select');
}

function selectAvailableDC()
{
	var diskType = $('input[name=disk_type]:checked').val();
	if (availabilityMap.hasOwnProperty(diskType))
	{
		for (var DCID in availabilityMap[diskType])
		{
			if (!availabilityMap[diskType].hasOwnProperty(DCID))
			{
				continue;
			}
			if (!availabilityMap[diskType][DCID].hasOwnProperty('0'))
			{
				continue;
			}
			if (!$.isArray(availabilityMap[diskType][DCID]['0']))
			{
				// If plan is backordered we'll get back an empty array instead of an object with key/value pairs
				$('input[name=DCID][value='+DCID+']').attr('checked', true);
				break;
			}
		}
	}
}
