// ==UserScript==
// @name        Democracy Club downloads
// @namespace   sjorford@gmail.com
// @include     https://candidates.democracyclub.org.uk/help/api
// @version     2017-03-05
// @grant       none
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/PapaParse/4.1.4/papaparse.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/chosen/1.6.2/chosen.jquery.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.17.1/moment.min.js
// ==/UserScript==

// Testing parameters
var defaultElection = 'all';
//defaultElection = 'Copeland';
//defaultElection = '2017 Northern Ireland';
//defaultElection = '2015 General Election';

// Global variables
var data = null;
var maxTableRows = 100;
maxTableRows = 1000; // TODO: add options for this
var pageNo = 1;
var maxPageNo = 1;
var sortColumn, sortOrder;
var allCandidatesUrl = 'https://candidates.democracyclub.org.uk/media/candidates-all.csv';
var url = '';

// Styles
$('<style>\
	#sjo-api-wrapper {margin: 1rem;}\
	#sjo-api-select {width: auto;}\
	.sjo-api-disabled {color: #bbb; pointer-events:none;}\
	#sjo-api-status {font-style: italic; margin-right: 1rem;}\
	#sjo-api-error {font-weight: bold; color: red;}\
	#sjo-api-button-download {margin: 0 1rem;}\
	#sjo-api-button-truncate {margin-right: 1rem;}\
	#sjo-api-table {margin: 0.5rem 0;}\
	#sjo-api-table th, #sjo-api-table td, #sjo-api-table-dupes th, #sjo-api-table-dupes td {padding: 0.25rem; font-size: 0.75rem !important;}\
	#sjo-api-table th {user-select: none; -moz-user-select: none; text-align: center; background-repeat: no-repeat; background-position: center right;}\
	#sjo-api-table th.sjo-api-th-sort-up {background-image:url(//en.wikipedia.org/w/resources/src/jquery/images/sort_up.png);}\
	#sjo-api-table th.sjo-api-th-sort-down {background-image:url(//en.wikipedia.org/w/resources/src/jquery/images/sort_down.png);}\
	#sjo-api-row-filter td {font-weight: normal;}\
	#sjo-api-row-filter ul {font-size: 0.75rem !important;}\
	.sjo-api-filter-width-auto {min-width: 4rem; max-width: 20rem;}\
	#sjo-api-row-filter .chosen-results .sjo-api-filter-unavailable {color: #ccc;}\
	#sjo-api-table td.sjo-cell-icon {font-size: 1rem !important; text-align: center;}\
	.sjo-api-cell-party_list_position, .sjo-api-cell-_elected_icon {display: none;}\
	.sjo-api-table-has-party-lists .sjo-api-cell-party_list_position {display: table-cell;}\
	.sjo-api-table-has-results .sjo-api-cell-_elected_icon {display: table-cell;}\
	#sjo-api-table-dupes tbody {border-top: 1px black solid;}\
</style>').appendTo('head');

// Import stylesheet for dropdowns
$('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/chosen/1.6.2/chosen.css"></style>').appendTo('head');

// Available fields
var dataFields = {
	
	'id':							{'display': 'ID',			'sort': '#',			},
	'name':							{'display': 'Name',			'filter': true,			'link': '/person/@@id@@'},
	'honorific_prefix':				{},
	'honorific_suffix':				{},
	'gender':						{},
	'birth_date':					{'display': 'DOB',									},
	'election':						{'display': 'Election',		'filter': true, 		},
	'party_id':						{'display': 'ID',									},
	'party_name':					{'display': 'Party',		'filter': true, 		'link': '/election/@@election@@/party/@@party_id@@/'},
	'post_id':						{'display': 'ID',									},
	'post_label':					{'display': 'Post',			'filter': true, 		'link': '/election/@@election@@/post/@@post_id@@/'},
	'mapit_url':					{},
	'elected':						{},
	
	// TODO: generate computed fields
	'email':						{							'abbr': '@',			},
	'twitter_username':				{							'abbr': 'tw',			'link': '//twitter.com/@@twitter_username@@'},
	'facebook_page_url':			{							'abbr': 'fbc',			'link': '@@facebook_page_url@@'},
	'party_ppc_page_url':			{							'abbr': 'ppc',			'link': '@@party_ppc_page_url@@'},
	'facebook_personal_url':		{							'abbr': 'fbp',			'link': '@@facebook_personal_url@@'},
	'homepage_url':					{							'abbr': 'hp',			'link': '@@homepage_url@@'},
	'wikipedia_url':				{							'abbr': 'wp',			'link': '@@wikipedia_url@@'},
	'linkedin_url':					{							'abbr': 'li',			'link': '@@linkedin_url@@'},
	
	'image_url':					{},
	'proxy_image_url_template':		{},
	'image_copyright':				{},
	'image_uploading_user':			{},
	'image_uploading_user_notes':	{},
	'twitter_user_id':				{'display': 'Twitter',								},
	'election_date':				{'display': 'Date',			'filter': true, 		},
	'election_current':				{},
	'party_lists_in_use':			{},
	'party_list_position':			{'display': 'Pos',									'sort': '#',			},
	'gss_code':						{},
	'parlparse_id':					{},
	'theyworkforyou_url':			{},
	'party_ec_id':					{},
	
	// Computed fields
	'_row':							{'display': '#',									'sort': '#',			},
	'_election_type':				{'display': 'Type',			'filter': true, 		},
	'_election_group':				{'display': 'Group',		'filter': true, 		},
	'_year':						{'display': 'Year',			'filter': true, 		'sort': '#',			},
	'_age':							{'display': 'Age',									}, // TODO: fix sorting of ages outside the range 10-99
	'_gender_icon':					{													'icon': true,			},
	'_image_icon':					{													'icon': true,			},
	'_elected_icon':				{													'icon': true,			},
	'_country':						{'display': 'Co',			'filter': true, 		},
	'_region':						{'display': 'Region',		'filter': true, 		},
	'_first_name':					{'display': 'First Name',	'filter': true, 		},
	'_middle_name':					{'display': 'Middle Names',	'filter': true, 		},
	'_last_name':					{'display': 'Surname',		'filter': true, 		},
	'_suffix':						{'display': 'Suffix',		'filter': true, 		},
	
};

// Fields to be displayed
var tableFields = [
	'id',
	'name',
	//'_first_name',
	//'_middle_name',
	//'_last_name',
	//'_suffix',
	'election_date',
	'_year',
	'_country',
	'_election_type',
	'post_label',
	'party_list_position',
	//'party_id',
	'party_name',
	
/*	'email',
	'twitter_username',
	'facebook_personal_url',
	'facebook_page_url',
	'homepage_url',
	'wikipedia_url',
	'linkedin_url',
	'party_ppc_page_url', */
	
	//'birth_date',
	//'_age',
	'_gender_icon',
	'_image_icon',
	'_elected_icon',
];

// Initialize page
$(function() {
	window.console.log('initialize');
		
	// Insert wrapper at top of page
	var wrapper = $('<div id="sjo-api-wrapper"></div>').prependTo('.content');
	
	// Add extract dropdown and button
	var dropdown = $('<select id="sjo-api-select"></select>').appendTo(wrapper)
		.change(event => dropdownWrapper.toggle(event.target.value == allCandidatesUrl));
	$('<input type="button" id="sjo-api-button-download" value="Extract">')
		.appendTo(wrapper).click(startDownload);
	var dropdownWrapper = $('<span></span>').appendTo(wrapper).hide();
	$('<input type="checkbox" id="sjo-api-current" value="current" checked><label for="sjo-api-current">Current only</label>')
		.appendTo(dropdownWrapper).change(applyFilters);
	$('<input type="checkbox" id="sjo-api-autotruncate" value="truncate" checked><label for="sjo-api-autotruncate">Auto truncate</label>')
		.appendTo(dropdownWrapper);
	
	// Build list of download options
	var dropdownHtml = '';
	$('a[href$=".csv"]').closest('ul').each(function(index, element) {
		var list = $(element);
		
		// Find headings
		var h3 = list.prevAll('h3').first();
		var h4 = list.prevUntil(h3, 'h4').first();
		var h5 = list.prevUntil(h4, 'h5').first();
		var groupName = 
			h5.length > 0 ? h5.text() + ' (' + h4.text().substr(-4) + ')' :
			h4.length > 0 ? h4.text() :
			h3.text();
		
		// Build list of options in this group
		var groupHtml = list.find('a').toArray().map(element => 
			'<option value="' + element.href + '">' +
				element.innerHTML.trim().match(/^Download of the (The )?(.*?)( local election)? candidates$/)[2] + 
			'</option>').join('');
		
		// Add group to dropdown
		groupHtml = '<optgroup label="' + groupName + '">' + groupHtml + '</option>';
		dropdownHtml += groupHtml;
		
	});
	
	// Add all downloads to dropdown
	dropdown.html(dropdownHtml);
	
	// Flag default for testing
	if (defaultElection) {
		dropdown.find('option:contains("' + defaultElection + '")').first().prop({selected: true});
		dropdown.trigger('change');
	}
	
	dropdown.chosen();
	
	// Add other options
	$('<span id="sjo-api-status"></span>').appendTo(wrapper).wrap('<div></div>').hide();
	$('<input type="button" id="sjo-api-button-truncate" value="Truncate">').insertAfter('#sjo-api-status').hide().click(truncateDataTable);
	$('<div id="sjo-api-error"></div>').appendTo(wrapper).hide();
	$('<input type="button" id="sjo-api-button-dupes" value="Find duplicates">').appendTo(wrapper).hide().click(findDuplicates).after('<span id="sjo-api-status-dupes"></span>');
	$('<table id="sjo-api-table-dupes"></table>').appendTo(wrapper).hide();
	
	// Create table
	// TODO: specify fixed widths to stop table from jumping
	window.console.log('initialize', tableFields);
	var table = $('<table id="sjo-api-table"><thead>' +
		'<tr id="sjo-api-row-header">' + tableFields.map(fieldName => 
			'<th class="sjo-api-cell-' + fieldName + '">' + 
				(dataFields[fieldName].display ? escapeHtml(dataFields[fieldName].display) : '\u00B7') + '</th>').join('') + '</tr>' +
		'<tr id="sjo-api-row-filter">' + tableFields.map(fieldName => '<td class="sjo-api-cell-' + fieldName + '"></td>').join('') + '</tr>' +
		'</thead><tbody></tbody></table>').appendTo(wrapper).hide();
	
	// Paging buttons
	table.before('<div class="sjo-api-paging"></div>');
	table.after('<div class="sjo-api-paging"></div>');
	$('.sjo-api-paging').append('<a class="sjo-api-paging-prev" role="button">Previous</a> <span class="sjo-api-paging-pages"></span> <a class="sjo-api-paging-next" role="button">Next</a>').hide();
	$('.sjo-api-paging-prev').click(event => gotoPage(pageNo - 1));
	$('.sjo-api-paging-next').click(event => gotoPage(pageNo + 1));
	$('.sjo-api-paging-pages').on('click', 'a', event => gotoPage(parseInt(event.target.innerHTML)));

	function gotoPage(newPageNo) {
		window.console.log('gotoPage', newPageNo);
		if (newPageNo < 1 || newPageNo > maxPageNo) return;
		pageNo = newPageNo;
		renderTable();
	}
	
	// Hide rest of page
	var helpWrapper = $('.help-api').hide();
	$('<input type="button" id="#sjo-api-button-help" value="Show/hide API help">')
		.appendTo(wrapper).click(event => $(helpWrapper).toggle());
	
	// Re-render table on filter change
	$('body').on('change', 'select.sjo-api-filter', function(event) {
		applyFilters();
	});
	
	// Click on column header to sort
	$('body').on('click', '#sjo-api-row-header th', function() {
		sortData($(this).prop('cellIndex'));
		renderTable();
	});
		
	// Select table body on click
	$('body').on('click', '#sjo-api-table tbody, #sjo-api-table-dupes tbody', function(event) {
		if (event.ctrlKey || event.shiftKey || event.altKey || event.target.tagName == 'A') return;
		$(this).selectRange();
	});
	
	// Resize dropdowns on window resize
	$(window).resize(event => $('select.sjo-api-filter').trigger('chosen:updated'));
	
});

function startDownload() {
	
	// Get URL from dropdown
	url = $('#sjo-api-select').val();
	window.console.log('startDownload', url);

	// Download and parse CSV
	Papa.parse(url, {
		'download': true,
		'header': true,
		'delimiter': ',',
		'newline': '\r\n',
		'quoteChar': '"',
		'skipEmptyLines': true,
		'complete': parseComplete,
	});
		
}

function parseComplete(results) {
	window.console.log('parseComplete', results);
	
	// Reset page
	$('#sjo-api-error').empty().hide();
	$('#sjo-api-table-dupes').empty().hide();
	$('#sjo-api-status-dupes').empty();
	
	// Display errors
	if (results.errors.length > 0) {
		$('#sjo-api-error').append(results.errors.map(error => '<div>' + error + '</div>').join('')).show();
	}
	
	// Check for new fields in metadata
	var newFields = $.grep(results.meta.fields, fieldName => !dataFields[fieldName]);
	if (newFields.length > 0) {
		$('#sjo-api-error').append('<div>New fields found: ' + newFields.join(', ') + '</div>').show();
	}
	
	// Clean data
	data = results.data;
	window.console.log('cleanData');
	$.each(data, (index, candidate) => cleanData(index, candidate));
	
	// Auto truncate based on current elections flag
	if ($('#sjo-api-autotruncate').is(':checked') && $('#sjo-api-current').is(':checked') && url == allCandidatesUrl) {
		data = $.grep(data, candidate => candidate.election_current);
	}
	
	// Set initial sort
	sortColumn = tableFields.indexOf('_row');
	sortOrder = 1;
	window.console.log('parseComplete', sortColumn, sortOrder);
	updateSortIcon();
	
	// Render table
	buildFilters();
	
}

// TODO: make a class
function cleanData(index, candidate) {
	//window.console.log('cleanData', candidate);
	
	// Row number
	candidate._row = index + 1;
	
	// Parse integer values
	candidate.id = candidate.id === '' ? '' : parseInt(candidate.id);
	candidate.party_list_position = candidate.party_list_position === '' ? '' : parseInt(candidate.party_list_position);
	
	// Parse boolean values
	// TODO: parse party_list_position here?
	candidate.election_current = candidate.election_current == 'True';
	candidate.party_lists_in_use = candidate.party_lists_in_use == 'True';
	candidate.elected = 
		candidate.elected == 'True' ? true : 
		candidate.elected == 'False' ? false : 
		null;
	
	// Tweak general election IDs for consistency
	candidate.election = 
		candidate.election == '2010' ? 'parl.2010-05-06' :
		candidate.election == '2015' ? 'parl.2015-05-07' :
		candidate.election;
		
	// Election type
	//candidate._election_type = candidate.election.match(/^(local\.[^\.]+|[^\.]+)\./)[1];
	candidate._election_type = candidate.election.match(/^(parl|pcc|nia|(local|sp|naw|gla|mayor)\.[^\.]+)\./)[1];
	candidate._election_group = candidate._election_type.split('.')[0];
	
	// Country
	// TODO: group election filters by country?
	var location = candidate._election_type + (candidate._election_type == candidate._election_group ? '.' + candidate.post_label.toLowerCase().trim().replace(/\s+/g, '-') : '');
	if (location.match(/^sp\.|^(local|parl)\.[^.]*(aberdeen|airdrie|angus|argyll|ayrshire|banff|berwick|caithness|carrick|clackmannan|coatbridge|cumbernauld|dumfries|dundee|du[mn]barton|east-kilbride|edinburgh|eilean-siar|eileanan-an-iar|falkirk|fife|glasgow|glenrothes|gordon|hamilton|highland|inverclyde|inverness|kilmarnock|kirkcaldy|lanark|livingston|lothian|moray|motherwell|orkney|perth|renfrew|scottish-borders|shetland|skye|stirling)/)) {
		candidate._country = 'SC';
	} else if (location.match(/^naw\.|^(local|parl|pcc)\.[^.]*(aberavon|anglesey|arfon|brecon|bridgend|caerphilly|cardiff|carmarthen|ceredigion|clwyd|conwy|cynon|deeside|delyn|denbigh|flint|glamorgan|gower|gwent|gwynedd|islwyn|llanelli|meirionnydd|merthyr|monmouth|montgomery|neath|newport|ogmore|pembroke|pontypridd|powys|rhondda|swansea|torfaen|wales|wrexham|ynys-m)/)) {
		candidate._country = 'WA';
	} else if (location.match(/^nia\.|^(local|parl)\.[^.]*(antrim|armagh|belfast|causeway|derry|(north|south)-down([^s]|$)|fermanagh|foyle|lagan-valley|lisburn|newry|strangford|tyrone|ulster|upper-bann)/)) {
		candidate._country = 'NI';
	} else {
		candidate._country = 'EN';
	}
	
	// TODO: region
	
	// Election year and age at election
	candidate._year = parseInt(candidate.election_date.substr(0, 4));
	if (candidate.birth_date) {
		if (candidate.birth_date.length == 4) {
			var ageThisYear = candidate._year - candidate.birth_date;
			candidate._age = (ageThisYear - 1) + '-' + ageThisYear;
		} else {
			candidate._age = '' + moment(candidate.election_date).diff(moment(candidate.birth_date), 'years');
		}
	} else {
		candidate._age = '';
	}
	
	// Icon columns
	candidate._elected_icon = candidate.elected ? '\u2605' : '';
	candidate._image_icon = candidate.image_url ? '\u263A' : '';
	candidate._gender_icon = 
		candidate.gender === '' ? '' : 
		candidate.gender.toLowerCase() == 'male'   ? '\u2642' :
		candidate.gender.toLowerCase() == 'female' ? '\u2640' :
		'?';
	
	// Split name
	// TODO: deal with peerage titles like Lord Cameron of Roundwood
	var name = candidate.name.trim(), nameMatch;
	
	// Suffix
	nameMatch = name.match(/^(.*?)\s+([JS]n?r\.?)$/);
	if (nameMatch) {
		candidate._suffix = nameMatch[2];
		name = nameMatch[1];
	} else {
		candidate._suffix = '';
	}
	
	// Surname
	nameMatch = name.match(/^(.*?)\s+(((st\.?|de|de la|le|van|van de|van der|von|di|da|ab|ap|\u00D3|N\u00ED|al|el)\s+.*?)|\S+)$/i);
	candidate._last_name = nameMatch[2];
	name = nameMatch[1];
	
	// First names
	nameMatch = name.match(/^(\S+)(\s+(.*?))?$/);
	candidate._first_name = nameMatch[1];
	candidate._middle_name = nameMatch[3] ? nameMatch[3] : '';
	
	// Party group
	candidate._party_group = 
		partyGroups[candidate.party_id] ? partyGroups[candidate.party_id] : 
		candidate.party_id == 'ynmp-party:2' ? null :
		candidate.party_name;
	
	// Initialise filter status array
	candidate.__filters = [];
	
}

var partyGroups = {
	'party:53':				'Lab/TUSC',
	'party:804':			'Lab/TUSC',
	'party:2045':			'Lab/TUSC',
	'party:4087':			'Lab/TUSC',
	'joint-party:53-119':	'Lab/TUSC',
	'joint-party:804-2045':	'Lab/TUSC',
	'party:51':				'Con/UUP/TUV',
	'party:52':				'Con/UUP/TUV',
	'party:83':				'Con/UUP/TUV',
	'party:680':			'Con/UUP/TUV',
	'party:84':				'UKIP',
	'party:85':				'UKIP',
	'party:63':				'Green',
	'party:130':			'Green',
	'party:305':			'Green',
	'party:2552':			'Cista',
	'party:2724':			'Cista',
	'party:6335':			'Cista',
};

// Truncate the data table
function truncateDataTable() {
	window.console.log('truncateDataTable');
	
	// Reduce the data table to just the filtered rows
	data = $.grep(data, candidate => candidate.__filters.every(value => value));
	
	// Rebuild the filters
	buildFilters();

}

// Display filters on selected columns
// TODO: add wildcard filters for elections (local.*, sp.* etc.)
// TODO: distinguish between two parties with the same name? (e.g. re-registered or on different registers)
function buildFilters() {
	window.console.log('buildFilters');
	
	// Remove existing filters
	var cells = $('#sjo-api-row-filter td').empty();
	
	// Don't build filters on short data set
	// TODO: parameterise this
	if (data.length >= 30) {
			
		// Loop through filterable fields
		var values;
		$.each(tableFields, (column, fieldName) => {
			var field = dataFields[fieldName];
			if (!field.filter) return;
			
			// Build list of filter options
			values = [];
			$.each(data, (index, candidate) => {
				if (values.indexOf(candidate[fieldName]) < 0) {
					values.push(candidate[fieldName]);
					
					// Add wildcard options
					if (fieldName == '_election_type' && url == allCandidatesUrl && candidate._election_group != candidate._election_type) {
						if (values.indexOf(candidate._election_group + '.*') < 0) {
							values.push(candidate._election_group + '.*');
						}
					}
					
				}
			});
			
			// Don't show filter for only one value
			window.console.log('buildFilters', field, values);
			if (values.length <= 1) return;
			
			// Add dropdown to table header
			$('<select multiple class="sjo-api-filter' + 
				(!field['filter-width'] ? ' sjo-api-filter-width-auto' : '') + 
				'" id="sjo-api-filter-' + fieldName + '">' + 
					values.sort().map(value => '<option>' + escapeHtml(value) + '</option>').join('') + 
				'</select>')
				.appendTo(cells[column]);
			
		});
			
	}
	
	// Apply the new filters
	applyFilters(true);
	
}

// Apply a filter selection
function applyFilters(init) {
	if (data === null) return;
	window.console.log('applyFilters', data);
	
	$('select.sjo-api-filter').each(function(index, element) {
		
		// Get filter parameters
		var filter = $(element);
		var values = filter.val();
		var column = filter.closest('td').prop('cellIndex');
		var fieldName = tableFields[column];
		window.console.log('applyFilters', column, fieldName, values, filter);
		
		// Parse numeric values
		// TODO: rename "sort" as something like "type"
		if (values && dataFields[fieldName].sort == '#') {
			values = values.map(value => value === '' ? '' : parseInt(value));
		}
		
		// Update the data set with the filter value
		$.each(data, (index, candidate) => {
			candidate.__filters[column] = values === null || values.indexOf(candidate[fieldName]) >= 0 || 
				(fieldName == '_election_type' && values.indexOf(candidate[fieldName].split('.')[0] + '.*') >= 0);
		});
		
		// Hide extra space in dropdowns
		// TODO: this makes it impossible to type a second search term
		filter.closest('td').find('.search-field').toggle(!values);
		
	});
	
	// Apply the current elections filter
	var current = $('#sjo-api-current').is(':checked') && url == allCandidatesUrl;
	window.console.log('applyFilters', current);
	$.each(data, (index, candidate) => {
		candidate.__filters[tableFields.length] = current ? candidate.election_current : true;
	});
	
	// Render table
	renderTable(init);
	
}

// Sort data on selected column
function sortData(column) {
	window.console.log('sortData', column);
	
	var fieldName = tableFields[column];
	var field = dataFields[fieldName];
	
	// Check if field should be sorted by another field
	if (field.sort && field.sort != '#') {
		fieldName = field.sort;
		column = tableFields.indexOf(fieldName);
		field = dataFields[fieldName];
	}
	
	// Reverse sort if column is already sorted
	sortOrder = column == sortColumn ? -sortOrder : 1;
	sortColumn = column;
	window.console.log('sortData', sortColumn, sortOrder, field);
	
	// Store current order to produce a stable sort
	$.each(data, (index, candidate) => candidate.__index = index);
	
	// Sort data
	data.sort(function(a, b) {
		
		// Sort blanks last
		if (a[fieldName] === '' && b[fieldName] === '') return a.__index - b.__index;
		if (a[fieldName] === '') return +1;
		if (b[fieldName] === '') return -1;
		
		// Don't sort abbreviation fields
		if (field.abbr) return a.__index - b.__index;
		
		if (a[fieldName] == b[fieldName]) return a.__index - b.__index;
		
		// Sort numbers correctly
		if (field.sort == '#') {
			return sortOrder * (a[fieldName] - b[fieldName]);
		} else {
			return sortOrder * a[fieldName].localeCompare(b[fieldName], {'sensitivity': 'base', 'ignorePunctuation': true});
		}
		
	});
	
	// Remove the temporary index column
	$.each(data, (index, candidate) => delete candidate.__index);
	
	// Update the column header
	updateSortIcon();
	
}

function updateSortIcon() {
	
	// Display icon in header
	// TODO: prettify this
	if (sortColumn >= 0) {
		$('#sjo-api-row-header th')
			.removeClass('sjo-api-th-sort-down sjo-api-th-sort-up')
			.eq(sortColumn).addClass(sortOrder == 1 ? 'sjo-api-th-sort-up' : 'sjo-api-th-sort-down');
	}
	
}

// Rebuild table
function renderTable(init) {
	window.console.log('renderTable');
	
	// Build the table rows to be displayed
	var renderData = buildTableRows();
	window.console.log('renderTable', renderData);
	
	// Check that the selected page shows some rows
	maxPageNo = Math.ceil(renderData.numRowsMatched / maxTableRows);
	maxPageNo = maxPageNo < 1 ? 1 : maxPageNo;
	if (pageNo > maxPageNo) {
		pageNo = maxPageNo;
		if (renderData.numRowsMatched > 0) {
			renderData = buildTableRows();
		}
	}
	window.console.log('renderTable', pageNo, maxPageNo);
	
	// Replace the table body
	$('#sjo-api-table tbody').html(renderData.bodyHtml);
	$('#sjo-api-table').show();
	
	// Change status message
	$('#sjo-api-status').text('Matched ' + 
		(renderData.numRowsMatched == data.length ? '' : 
			renderData.numRowsMatched + ' of ') + data.length + ' rows' + 
		(renderData.numRowsDisplayed == renderData.numRowsMatched ? '' : 
			' (displaying ' + (renderData.startRowNo) + '-' + (renderData.startRowNo + renderData.numRowsDisplayed - 1) + ')')).show();
	
	// Display paging buttons
	// TODO: if there are a lot, only ... display ... selected ... pages
	$('.sjo-api-paging-pages').html((new Array(maxPageNo)).fill(0).map((value, index) => 
		index + 1 == pageNo ? '<span class="sjo-api-paging-current">' + (index + 1) + '</span>' : '<a role="button">' + (index + 1) + '</a>').join(' '));
	$('.sjo-api-paging-prev').toggleClass('sjo-api-disabled', pageNo == 1);
	$('.sjo-api-paging-next').toggleClass('sjo-api-disabled', pageNo == maxPageNo);
	$('.sjo-api-paging').toggle(renderData.numRowsDisplayed < renderData.numRowsMatched);
	
	// Toggle display of columns
	$('#sjo-api-table').toggleClass('sjo-api-table-has-party-lists', data.some(candidate => candidate.party_lists_in_use));
	$('#sjo-api-table').toggleClass('sjo-api-table-has-results', data.some(candidate => candidate.elected));
	
	// Toggle display of truncation button
	var current = $('#sjo-api-current').is(':checked');
	var currentSet = new Set(data.map(candidate => candidate.election_current));
	window.console.log('renderTable', current, currentSet);
	$('#sjo-api-button-truncate').toggle((current && currentSet.has(false)) || $('.sjo-api-filter option:selected').length > 0);
	
	// Display dupes button
	$('#sjo-api-button-dupes').show();
	
	if (init) {
		$('select.sjo-api-filter').chosen({
			'placeholder_text_multiple': ' ',
			'search_contains': true,
			'inherit_select_classes': true,
			//'width': field['filter-width'],
		});
	}
	
	// Clean up the filter lists
	tidyFilters();
	
}

// Build table as raw HTML for rendering speed
function buildTableRows() {
	window.console.log('buildTableRows');

	// Initialise row count
	var bodyHtml = '';
	var numRowsMatched = 0;
	var numRowsDisplayed = 0;
	var startRowNo = maxTableRows * (pageNo - 1) + 1;
	var endRowNo = startRowNo + maxTableRows;
	window.console.log('buildTableRows', pageNo, maxTableRows, startRowNo, endRowNo);
	
	// Loop through all data rows
	$.each(data, function(index, candidate) {
		
		// Check if this row passes all the filters
		if (!candidate.__filters.every(value => value)) return;
		numRowsMatched++;
		
		// Show only selected page
		if (numRowsMatched >= startRowNo && numRowsMatched < endRowNo) {
			
			// Build cells HTML
			var cellsHtml = tableFields.map(function(fieldName) {
				var field = dataFields[fieldName];
				var cellHtml;
				if (candidate[fieldName] === '' || candidate[fieldName] === null || candidate[fieldName] === undefined) {
					cellHtml = '';
				} else {
					cellHtml = field.abbr ? field.abbr : field.format == 'html' ? candidate[fieldName] : escapeHtml(candidate[fieldName]);
					if (field.link) {
						var href = field.link;
						var match;
						while (match = href.match(/^(.*?)@@(.*?)@@(.*)$/)) {
							href = match[1] + candidate[match[2]] + match[3];
						}
						cellHtml = '<a href="' + href + '">' + cellHtml + '</a>';
					}
				}
				cellHtml = '<td class="sjo-api-cell-' + fieldName + (field.icon ? ' sjo-cell-icon' : '') + '">' + cellHtml + '</td>';
				return cellHtml;
			}).join('');
			
			// Add row to table body
			bodyHtml += '<tr' + (candidate.elected ? ' class="sjo-api-row-elected"' : '') + '>' + cellsHtml + '</tr>';
			numRowsDisplayed++;
			
		}
		
	});
	
	// Calculate actual end row
	endRowNo = startRowNo + numRowsDisplayed;
	
	// Return values as an object
	return {
		'bodyHtml': 		bodyHtml,
		'numRowsMatched': 	numRowsMatched,
		'numRowsDisplayed': numRowsDisplayed,
		'startRowNo': 		startRowNo,
		'endRowNo': 		endRowNo,
	};
	
}

// Sort available filters at the top, and grey out others
function tidyFilters() {
	window.console.log('tidyFilters');
	
	// Go through all filterable fields
	$.each(tableFields, (fieldIndex, fieldName) => {
		var field = dataFields[fieldName];
		if (!field.filter) return;
		
		// Get the dropdown for this field
		var dropdown = $('#sjo-api-filter-' + fieldName);
		if (dropdown.length === 0) return;
		window.console.log('tidyFilters', dropdown.val(), dropdown);
		
		// Reset all options for this dropdown
		var options = dropdown.find('option');
		options.removeClass('sjo-api-filter-unavailable');
		dropdown.append(options.toArray().sort((a, b) => a.innerHTML > b.innerHTML));
		options = dropdown.find('option');
		
		// Only sort this dropdown if other dropdowns are selected
		if ($('.sjo-api-filter').not(dropdown).find(':checked').length > 0) {
			
			// Go through data and find values that are valid when accounting for other filters
			var values = [];
			$.each(data, function(index, candidate) {
				if (candidate.__filters.every((value, filterIndex) => filterIndex == fieldIndex || value)) {
					values.push(candidate[fieldName]);
				}
			});
			
			// Sort the available options at the top
			var validOptions = options.filter((index, element) => values.indexOf(element.value) >= 0);
			dropdown.prepend(validOptions);
			options.not(validOptions).addClass('sjo-api-filter-unavailable');
		}
		
		// Refresh the fancy dropdown
		dropdown.trigger('chosen:updated');
		
	});
	
}

// Find likely duplicates
// TODO: weight by region
// TODO: include party ID
function findDuplicates() {
	window.console.log('findDuplicates');
	
	// Clear previous results
	var table = $('#sjo-api-table-dupes').empty();
	
	// Loop through 2017 candidacies
	var groups = 0;
	var processed = [];
	var unmatched = data.map(candidate => ({'candidate': candidate}));
	var index = 0;
	checkData();
	
	function checkData() {
		var element = unmatched[index];
		//window.console.log(index, element);
		
		$('#sjo-api-status-dupes').text('Checking ' + (index + 1) + ' of ' + (data.length) + '; ' + groups + ' groups found');
		
		var candidate = element.candidate;
		if (!element.matched && candidate._year == 2017) {
			
			// Add this candidate to pending list
			element.matched = true;
			var pending = [element];
			var matches = [];
			var found = false;
			//window.console.log(candidate);
			
			// Process each candidate matching this one
			while (pending.length > 0) {
				var element1 = pending.pop();
				var c1 = element1.candidate;
				matches.push(element1);
				
				// Loop through all unprocessed candidacies
				$.each(unmatched, (index2, element2) => {
					if (element2.matched) return;
					var c2 = element2.candidate;
					
					// If the ID matches, add it
					if (c2.id == c1.id) {
						element2.matched = true;
						pending.push(element2);
					} else {
							
						// Calculate name similarity
						var shortName1 = c1._first_name + ' ' + c1._last_name;
						var shortName2 = c2._first_name + ' ' + c2._last_name;
						var jw = jaroWinkler(c1.name, c2.name);
						var jwShort = jaroWinkler(shortName1, shortName2);
						
						// Check party similarity
						var partyWeight = c1._party_group == c2._party_group ? 1 : c1._party_group == null || c2._party_group == null ? 0.95 : 0.90;
						
						// Check location similarity
						var countryWeight = c1._country == c2._country ? 1 : 0.90;
						
						// Calculate overall score
						var score = Math.max(jw, jwShort) * partyWeight * countryWeight;
						if (score >= 0.93) {
								
							// Add this candidacy
						/*	window.console.log('findDuplicates', round(jw, 2), round(jwShort, 2), partyWeight, countryWeight, round(score, 2));
							window.console.log('findDuplicates              ', c1.id, c1.name, c1._year, c1._election_type, c1._party_group, c1._country);
							window.console.log('findDuplicates              ', c2.id, c2.name, c2._year, c2._election_type, c2._party_group, c2._country); */
							element2.score = score;
							element2.matched = true;
							pending.push(element2);
							found = true;
						
						}
						
					}
					
				});

			}
			
			// Add to the table
			if (found) {
				groups++;
				matches.sort((a, b) => a.candidate.id > b.candidate.id || (a.candidate.id == b.candidate.id && a.candidate.election_date > b.candidate.election_date));
				var rowGroup = $('<tbody></tbody>').appendTo(table);
				$.each(matches, (index, match) => 
					$('<tr></tr>')
						.addCell(groups)
						.addCell(match.candidate.id)
						.addCell('')
						.addCell(match.candidate.name)
						.addCell(match.candidate.election_date)
						.addCell(match.candidate._election_type)
						.addCell(match.candidate.post_label)
						.addCell(match.candidate.party_name)
						.addCell(match.candidate.party_id) // *****
						.addCell(match.score ? match.score.toFixed(2) : '') // *****
						.appendTo(rowGroup));
				table.show();
			}
			
		}
		
		index++;
		if (index < unmatched.length) {
			window.setTimeout(checkData, 10);
		} else {
			$('#sjo-api-status-dupes').text('Search complete; ' + groups + ' groups found');
		}
		
	}
	
	function round(number, places) {
		return Math.round(number * Math.pow(10, places)) / Math.pow(10, places);
	}
	
}

// Escape angle brackets in values
function escapeHtml(string) {
	return string ? ('' + string).replace(/</g, '&lt;').replace(/>/g, '&gt;') : string;
}

// ================================================================
// Calculate difference between two strings
// ================================================================

// Based on http://en.wikipedia.org/wiki/Levenshtein_distance
function levenshtein(s, t) {
	if (s == t) return 0;
	if (s.length == 0) return t.length;
	if (t.length == 0) return s.length;
	var v0 = new Array(t.length + 1);
	var v1 = new Array(t.length + 1);
	var i, j;
	for (i = 0; i < v0.length; i++) {
		v0[i] = i;
	}
	for (i = 0; i < s.length; i++) {
		v1[0] = i + 1;
		for (j = 0; j < t.length; j++) {
			var cost = (s[i] == t[j]) ? 0 : 1;
			v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
		}
		for (j = 0; j < v0.length; j++) {
			v0[j] = v1[j];
		}
	}
	return v1[t.length];
}

// Based on https://github.com/jordanthomas/jaro-winkler/blob/master/index.js
function jaroWinkler(s1, s2) {
	var m = 0;
	var i, j;
	if (s1.length === 0 || s2.length === 0) return 0;
	if (s1 === s2) return 1;
	var range = (Math.floor(Math.max(s1.length, s2.length) / 2)) - 1;
	var s1Matches = new Array(s1.length);
	var s2Matches = new Array(s2.length);
	for (i = 0; i < s1.length; i++) {
		var low  = (i >= range ? i - range : 0);
		var high = (i + range <= s2.length - 1 ? i + range : s2.length - 1);
		for (j = low; j <= high; j++) {
			if (s1Matches[i] !== true && s2Matches[j] !== true && s1[i] === s2[j]) {
				m++;
				s1Matches[i] = true;
				s2Matches[j] = true;
				break;
			}
		}
	}
	if (m === 0) return 0;
	var k = 0;
	var numTrans = 0;
	for (i = 0; i < s1.length; i++) {
		if (s1Matches[i] === true) {
			for (j = k; j < s2.length; j++) {
				if (s2Matches[j] === true) {
					k = j + 1;
					break;
				}
			}
			if (s1[i] !== s2[j]) numTrans++;
		}
	}
	var weight = (m / s1.length + m / s2.length + (m - (numTrans / 2)) / m) / 3;
	var l = 0;
	var p = 0.1;
	if (weight > 0.7) {
		while (s1[l] === s2[l] && l < 4) l++;
		weight = weight + l * p * (1 - weight);
	}

	return weight;
}

// ================================================================
// jQuery plugins
// ================================================================

// Add a new cell to a table row
(function($) {
	
	// Add text content
	$.fn.addCell = function(text, className, id) {
		return addCell(this, false, text, className, id);
	};
	
	// Add HTML content
	$.fn.addCellHTML = function(html, className, id) {
		return addCell(this, true, html, className, id);
	};
	
	// Internal function
	function addCell(obj, isHTML, content, className, id) {
		for (var i = 0; i < obj.length; i++) {
			var row = obj[i];
			if (row.tagName == 'TR') {
				var cell = $('<td></td>');
				if (content !== null && content !== undefined) {
					if (isHTML) cell.html(content); 
					else cell.text(content);
				}
				if (className) cell.addClass(className);
				if (id) cell.attr('id', id);
				cell.appendTo(row);
			}
		}
		return obj;
	}
	
})(jQuery);

// Select range
(function($) {
	
	$.fn.selectRange = function() {
		var range = document.createRange();
		range.selectNodeContents(this.get(0));
		var selection = window.getSelection();        
		selection.removeAllRanges();
		selection.addRange(range);
		return this;
	};
	
})(jQuery);
