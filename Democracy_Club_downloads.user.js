// ==UserScript==
// @name        Democracy Club downloads
// @namespace   sjorford@gmail.com
// @include     https://candidates.democracyclub.org.uk/help/api
// @version     2017-03-20
// @grant       none
// @require     https://cdnjs.cloudflare.com/ajax/libs/PapaParse/4.1.4/papaparse.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/chosen/1.6.2/chosen.jquery.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.17.1/moment.min.js
// @require     https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// @require     https://raw.githubusercontent.com/sjorford/fun-with-elections/master/dc-lib.js
// ==/UserScript==

// Defaults
var maxTableRows = 100; // TODO: add options for this
//maxTableRows = 1000;
//maxTableRows = 10000;
//maxTableRows = 100000;

// Global variables
var data = null;
var pageNo = 1, maxPageNo = 1;
var sortColumn = -1, sortOrder = 1;
var allCandidatesUrl = 'https://candidates.democracyclub.org.uk/media/candidates-all.csv';
var url = '';
var tableColumns = {};

// Styles
$(`<style>
	#sjo-api-wrapper {margin: 1rem;}
	#sjo-api-select {width: auto;}
	.sjo-api-disabled {color: #bbb; pointer-events:none;}
	.sjo-api-paging-current {color: black; pointer-events:none;}
	#sjo-api-status {font-style: italic; margin-right: 1rem;}
	#sjo-api-error {font-weight: bold; color: red;}
	#sjo-api-button-download {margin: 0 1rem;}
	#sjo-api-button-truncate {margin-right: 1rem;}
	#sjo-api-table {margin: 0.5rem 0;}
	#sjo-api-table th, #sjo-api-table td, #sjo-api-table-dupes th, #sjo-api-table-dupes td {padding: 0.25rem; font-size: 0.75rem !important;}
	#sjo-api-table th {user-select: none; -moz-user-select: none; text-align: center; background-repeat: no-repeat; background-position: center right;}
	#sjo-api-table th.sjo-api-th-sort-up {background-image:url(//en.wikipedia.org/w/resources/src/jquery/images/sort_up.png);}
	#sjo-api-table th.sjo-api-th-sort-down {background-image:url(//en.wikipedia.org/w/resources/src/jquery/images/sort_down.png);}
	#sjo-api-row-filter td {font-weight: normal; vertical-align: middle;}
	#sjo-api-row-filter ul {font-size: 0.75rem !important;}
	.sjo-api-filter-checkbox {margin: 0 !important;}
	.sjo-api-filter {min-width: 4rem; max-width: 20rem;}
	xxx#sjo_api_filter_election_date_chosen {min-width: 8rem; overflow; hidden;}
	#sjo-api-row-filter .chosen-results .sjo-api-filter-unavailable {color: #ccc;}
	#sjo-api-table td.sjo-api-cell-icon {font-size: 1rem !important; text-align: center;}
	xxx.sjo-api-cell-party_list_position, xxx.sjo-api-cell-_elected_icon {display: none;}
	xxx.sjo-api-table-has-party-lists .sjo-api-cell-party_list_position {display: table-cell;}
	xxx.sjo-api-table-has-results .sjo-api-cell-_elected_icon {display: table-cell;}
	.sjo-api-row-elected {background-color: #fbf2af !important;}
	.sjo-api-dupes-first {border-top: 1px black solid;}
	.sjo-api-dupes-verymuch {background-color: bisque !important;}
	.sjo-api-invalid {background-color: #fcc !important;}
	.sjo-api-col-name           {width: 12em; min-width: 12em; max-width: 12em;}
	.sjo-api-col-_election {width: 12em; min-width: 12em; max-width: 12em;}
	.sjo-api-col-post_label     {width: 12em; min-width: 12em; max-width: 12em;}
	.sjo-api-col-party_name     {width: 12em; min-width: 12em; max-width: 12em;}
</style>`).appendTo('head');

// Import stylesheet for dropdowns
$('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/chosen/1.6.2/chosen.css"></style>').appendTo('head');

// Validation functions
var isValid = {
	'fb': 		val => val.match(/^https?:\/\/(www\.)?facebook\.com\//),
	'wp': 		val => val.match(/^https?:\/\/en\.wikipedia\.org\//),
	'li': 		val => val.match(/^https?:\/\/((uk|www)\.)?linkedin\.com\//),
	'hp': 		val => !isValid.fb(val) && !isValid.wp(val) && !isValid.li(val),
	'ppc': 		val => !isValid.fb(val) && !isValid.wp(val) && !isValid.li(val),
	'gender': 	val => val !== '?',
	'party': 	(val, candidate) => !((candidate.party_id == 'party:130' && candidate._country != 'SC') || (candidate.party_id == 'party:63' && candidate._country == 'SC')),
};

// Available fields
var dataFields = {
	
	'id':							{'display': 'ID',									'sort': '#',			},
	'name':							{'display': 'Name',			'filter': true,			'link': '/person/@@id@@'},
	'honorific_prefix':				{},
	'honorific_suffix':				{},
	'gender':						{},
	'birth_date':					{'display': 'DOB',									},
	'election':						{'display': 'Election',		'filter': true, 		},
	'party_id':						{'display': 'ID',									'validate': isValid.party},
	'party_name':					{'display': 'Party',		'filter': true, 		'validate': isValid.party,		'link': '/election/@@election@@/party/@@party_id@@/'},
	'post_id':						{'display': 'ID',									},
	'post_label':					{'display': 'Post',			'filter': true, 		'link': '/election/@@election@@/post/@@post_id@@/'},
	'mapit_url':					{},
	'elected':						{							'abbr': '\u2605',		'icon': true,			},
	
	// Contact fields
	// TODO: highlight links that appear to be on the wrong domain
	// TODO: highlight gov.uk email addresses
	'email':						{'display': 'Email',		'abbr': '@',			},
	'twitter_username':				{'display': 'Twitter',		'abbr': 'tw',			'link': '//twitter.com/@@twitter_username@@'},
	'facebook_personal_url':		{'display': 'FB profile',	'abbr': 'fbp',			'link': '@@facebook_personal_url@@',			'validate': isValid.fb},
	'facebook_page_url':			{'display': 'FB page',		'abbr': 'fbc',			'link': '@@facebook_page_url@@',				'validate': isValid.fb},
	'homepage_url':					{'display': 'Homepage',		'abbr': 'hp',			'link': '@@homepage_url@@',						'validate': isValid.hp},
	'wikipedia_url':				{'display': 'Wikipedia',	'abbr': 'wp',			'link': '@@wikipedia_url@@',					'validate': isValid.wp},
	'linkedin_url':					{'display': 'LinkedIn',		'abbr': 'li',			'link': '@@linkedin_url@@',						'validate': isValid.li},
	'party_ppc_page_url':			{'display': 'Party page',	'abbr': 'ppc',			'link': '@@party_ppc_page_url@@',				'validate': isValid.ppc},
	
	// Other fields
	'image_url':					{'display': 'Image',		'abbr': '\u263A',		'icon': true,			},
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
	'_election':				{'display': 'Election',		'filter': true, 		},
	'_election_group':				{'display': 'Group',		'filter': true, 		},
	'_election_year':				{'display': 'Year',			'filter': true, 		'sort': '#',			},
	'_age_at_election':				{'display': 'Age',									},
	'_gender_icon':					{							'filter': false,		'icon': true,			'validate': isValid.gender},
	'_country':						{'display': 'Co',			'filter': true, 		},
	'_region':						{'display': 'Region',		'filter': true, 		},
	'_first_name':					{'display': 'First Name',	'filter': true, 		},
	'_middle_names':				{'display': 'Middle Names',	'filter': true, 		},
	'_last_name':					{'display': 'Surname',		'filter': true, 		},
	'_suffix':						{'display': 'Suffix',		'filter': true, 		},
	
};

// Fields to be displayed
// TODO: add options for these
var tableFields = [
	'id',
	'name',
	'election_date',
	'_election_year',
	'_country',
	'_election',
	'post_label',
	'party_list_position',
	'party_id',
	'party_name',
	//'twitter_username',
	
	'has:email',
	'has:twitter_username',
	'has:facebook_personal_url',
	'has:facebook_page_url',
	'has:homepage_url',
	'has:wikipedia_url',
	'has:linkedin_url',
	'has:party_ppc_page_url',
	
	'birth_date',
	'_age_at_election',
	'_gender_icon',
	'has:image_url',
	'has:elected',
];

//tableFields = ['_first_name'];
//tableFields = ['twitter_username'];
//tableFields = ['post_label', 'name', 'party_name', 'email'];

// Initialize page
$(function() {
	console.log('initialize');
	
	// Parse field definitions
	tableColumns = tableFields.map(fieldName => fieldName.indexOf('has:') === 0 ? {'name': fieldName.slice(4), 'has': true} : {'name': fieldName, 'has': false});
	
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
		groupHtml = `<optgroup label="${groupName}">${groupHtml}</option>`;
		dropdownHtml += groupHtml;
		
	});
	
	// Add all downloads to dropdown
	dropdown.html(dropdownHtml);
	
	// Select default election
	var lastUrl = localStorage.getItem('sjo-api-url');
	console.log(lastUrl);
	if (lastUrl) {
		dropdown.find(`option[value="${lastUrl}"]`).first().prop({selected: true});
		dropdown.trigger('change');
	}
	
	// Style dropdown
	dropdown.chosen();
	
	// Add other options
	$('<span id="sjo-api-status"></span>').appendTo(wrapper).wrap('<div></div>').hide();
	$('<input type="button" id="sjo-api-button-truncate" value="Truncate">').insertAfter('#sjo-api-status').hide().click(truncateDataTable);
	$('<div id="sjo-api-error"></div>').appendTo(wrapper).hide();
	$('<input type="button" id="sjo-api-button-dupes" value="Find duplicates">').appendTo(wrapper).hide().click(findDuplicates).after('<span id="sjo-api-status-dupes"></span>');
	$('<table id="sjo-api-table-dupes"></table>').appendTo(wrapper).hide();
	
	// Create table
	// TODO: specify fixed widths to stop table from jumping
	console.log('initialize', tableColumns);
	var colGroupsHtml = tableColumns.map(column => '<col class="sjo-api-col-' + (column.has ? '__has_' : '') + column.name + '">');
	var headerCellsHtml = tableColumns.map(column => 
		'<th class="sjo-api-cell-' + (column.has ? '__has_' : '') + column.name + '">' + 
			(dataFields[column.name].display && !column.has ? escapeHtml(dataFields[column.name].display) : '\u00B7') + '</th>');
	var filterCellsHtml = tableColumns.map(column => '<td class="sjo-api-cell-' + (column.has ? '__has_' : '') + column.name + '"></td>');
	var table = $(`<table id="sjo-api-table"><colgroup>${colGroupsHtml.join('')}</colgroup><thead>
		<tr id="sjo-api-row-header">${headerCellsHtml.join('')}</tr>
		<tr id="sjo-api-row-filter">${filterCellsHtml.join('')}</tr></thead><tbody></tbody></table>`).appendTo(wrapper).hide();
	
	// Paging buttons
	table.before('<div class="sjo-api-paging"></div>');
	table.after('<div class="sjo-api-paging"></div>');
	$('.sjo-api-paging').append('<a class="sjo-api-paging-prev" role="button">Previous</a> <span class="sjo-api-paging-pages"></span> <a class="sjo-api-paging-all" role="button">All</a> <a class="sjo-api-paging-next" role="button">Next</a>').hide();
	$('.sjo-api-paging-prev').click(event => gotoPage(pageNo - 1));
	$('.sjo-api-paging-next').click(event => gotoPage(pageNo + 1));
	$('.sjo-api-paging-all').click(event => gotoPage(Infinity));
	$('.sjo-api-paging-pages').on('click', 'a', event => gotoPage(parseInt(event.target.innerHTML)));

	function gotoPage(newPageNo) {
		console.log('gotoPage', newPageNo);
		if ((newPageNo >= 1 && newPageNo <= maxPageNo) || newPageNo == Infinity) {
			pageNo = newPageNo;
			renderTable();
		}
	}
	
	// Hide rest of page
	var helpWrapper = $('.help-api').hide();
	$('<input type="button" id="#sjo-api-button-help" value="Show/hide API help">')
		.appendTo(wrapper).click(event => $(helpWrapper).toggle());
	
	// Re-render table on filter change
	$('body').on('change', 'select.sjo-api-filter, .sjo-api-filter-checkbox', function(event) {
		applyFilters();
	});
	
	// Click on column header to sort
	$('body').on('click', '#sjo-api-row-header th', function() {
		sortData($(this).prop('cellIndex'));
		renderTable();
	});
	
	// Select table body on click
	$('body').on('click', '#sjo-api-table tbody', function(event) {
		if (event.ctrlKey || event.shiftKey || event.altKey || event.target.tagName == 'A') return;
		$(this).selectRange();
	});
	
	// Resize dropdowns on window resize
	//$(window).resize(event => $('select.sjo-api-filter').trigger('chosen:updated'));
	
});

function startDownload() {
	
	// Get URL from dropdown
	url = $('#sjo-api-select').val();
	localStorage.setItem('sjo-api-url', url);
	console.log('startDownload', url);

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
	console.log('parseComplete', results);
	
	// Reset page
	$('#sjo-api-error').empty().hide();
	$('#sjo-api-table-dupes').empty().hide();
	$('#sjo-api-status-dupes').empty();
	pageNo = 1;
	
	// Display errors
	if (results.errors.length > 0) {
		$('#sjo-api-error').append(results.errors.map(error => `<div>${error}</div>`).join('')).show();
	}
	
	// Check for new fields in metadata
	var newFields = $.grep(results.meta.fields, fieldName => !dataFields[fieldName]);
	if (newFields.length > 0) {
		$('#sjo-api-error').append(`<div>New fields found: ${newFields.join(', ')}</div>`).show();
	}
	
	// Clean data
	data = results.data;
	console.log('cleanData');
	$.each(data, (index, candidate) => cleanData(index, candidate));
	
	// Auto truncate based on current elections flag
	var current = url == allCandidatesUrl && $('#sjo-api-current').is(':checked');
	if (current && $('#sjo-api-autotruncate').is(':checked')) {
		data = $.grep(data, candidate => candidate.election_current);
	}
	
	// Set initial sort
	sortColumn = tableFields.indexOf('_row');
	sortOrder = 1;
	console.log('parseComplete', sortColumn, sortOrder);
	updateSortIcon();
	
	// Render table
	buildFilters();
	
}

// TODO: make a class
function cleanData(index, candidate) {
	//console.log('cleanData', candidate);
	
	// Initialise filter status array
	candidate.__filters = [];
	
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
	
	// Tweak historical general election IDs for consistency
	candidate.election = 
		candidate.election == '2010' ? 'parl.2010-05-06' :
		candidate.election == '2015' ? 'parl.2015-05-07' :
		candidate.election;
	
	// Tweak ward names
	candidate.post_label = candidate.post_label.replace(/^Police and Crime Commissioner for | ward$/, '');
	
	// Election
	//candidate._election = candidate.election.match(/^(local\.[^\.]+|[^\.]+)\./)[1];
	candidate._election = candidate.election.match(/^(parl|pcc|nia|(local|sp|naw|gla|mayor)\.[^\.]+)\./)[1];
	candidate._election_group = candidate._election.split('.')[0];
	
	// Country
	var place = candidate._election + (candidate._election == candidate._election_group ? '.' + candidate.post_label.toLowerCase().trim().replace(/\s+/g, '-') : '');
	candidate._country = getCountryForElection(place);
	
	/*
	if (place.match(/^sp\.|^(local|parl)\.[^.]*(aberdeen|airdrie|angus|argyll|ayrshire|banff|berwick|caithness|carrick|clackmannan|coatbridge|cumbernauld|dumfries|dundee|du[mn]barton|edinburgh|eilean|falkirk|fife|glasgow|glenrothes|gordon|hamilton|highland|inverclyde|inverness|kilbride|kilmarnock|kirkcaldy|lanark|livingston|lothian|moray|motherwell|orkney|perth|renfrew|scottish|shetland|skye|stirling)/)) {
		candidate._country = 'SC';
	} else if (place.match(/^naw\.|^(local|parl|pcc)\.[^.]*(aberavon|anglesey|arfon|brecon|bridgend|caerphilly|cardiff|carmarthen|ceredigion|clwyd|conwy|cynon|deeside|delyn|denbigh|flint|glamorgan|gower|gwent|gwynedd|islwyn|llanelli|meirionnydd|merthyr|monmouth|montgomery|neath|newport|ogmore|pembroke|pontypridd|powys|rhondda|swansea|torfaen|wales|wrexham|ynys)/)) {
		candidate._country = 'WA';
	} else if (place.match(/^nia\.|^(local|parl)\.[^.]*(antrim|armagh|belfast|causeway|derry|(north|south)-down([^s]|$)|fermanagh|foyle|lagan-valley|lisburn|newry|strangford|tyrone|ulster|upper-bann)/)) {
		candidate._country = 'NI';
	} else {
		candidate._country = 'EN';
	}
	*/
	
	// TODO: region
	
	// Election year and age at election
	// TODO: fix sorting of ages outside the range 10-99
	candidate._election_year = parseInt(candidate.election_date.substr(0, 4));
	if (candidate.birth_date) {
		if (candidate.birth_date.length == 4) {
			var ageThisYear = candidate._election_year - candidate.birth_date;
			candidate._age_at_election = (ageThisYear - 1) + '-' + ageThisYear;
		} else {
			candidate._age_at_election = '' + moment(candidate.election_date).diff(moment(candidate.birth_date), 'years');
		}
	} else {
		candidate._age_at_election = '';
	}
	
	// Gender
	candidate.gender = candidate.gender.trim();
	candidate._gender_icon = 
		candidate.gender === '' ? '' : 
		candidate.gender.match(/^(m|male|mr\.?)$/i) ? '\u2642' :
		candidate.gender.match(/^(f|female|(mrs|miss|ms)\.?)$/i) ? '\u2640' :
		'?';
	
	// Split name
	// TODO: deal with peerage titles like Lord Cameron of Roundwood
	var name = candidate.name.trim();
	var nameMatch = name.match(/^(.*?)\s+([JS]n?r\.?)$/);
	if (nameMatch) {
		candidate._suffix = nameMatch[2];
		name = nameMatch[1];
	} else {
		candidate._suffix = '';
	}
	nameMatch = name.match(/^(.*?)\s+(((st\.?|de|de la|le|van|van de|van der|von|di|da|ab|ap|\u00D3|N\u00ED|al|el)\s+.*?)|\S+)$/i);
	candidate._last_name = nameMatch[2];
	nameMatch = nameMatch[1].match(/^(\S+)(\s+(.*?))?$/);
	candidate._first_name = nameMatch[1];
	candidate._middle_names = nameMatch[3] ? nameMatch[3] : '';
	candidate._short_name = candidate._first_name + ' ' + candidate._last_name;
	candidate._normal_name = (nameNorms[candidate._first_name] ? nameNorms[candidate._first_name] : candidate._first_name) + ' ' + candidate._last_name;
	
	// Party group
	// TODO: group "Independent" parties together
	candidate._party_group = 
		partyGroups[candidate.party_id] ? partyGroups[candidate.party_id] : 
		//candidate.party_id == 'ynmp-party:2' ? null :
		candidate.party_name.indexOf('Independent') >= 0 ? 'Independent' :
		candidate.party_name;
	
}

// TODO: improve this
// TODO: build this from real data
var partyGroups = {
	
	// Labour, TUSC, Left Unity
	'party:53':				'Labour',		// Labour Party
	'party:804':			'Labour',
	'party:2045':			'Labour',
	'party:4087':			'Labour',
	'joint-party:53-119':	'Labour',
	'joint-party:804-2045':	'Labour',
	
	// Conservative, UUP, TUV
	'party:52':				'Conservative',	// Conservative and Unionist Party	
	'party:51':				'Conservative',	// Conservative and Unionist Party [NI]
	'party:83':				'Conservative',	// Ulster Unionist Party
	'party:680':			'Conservative',	// Traditional Unionist Voice - TUV
	
	// UKIP, English Democrats, National Front, AIFE
	// TODO: add BNP
	'party:85':				'UKIP',			// UK Independence Party (UKIP)
	'party:84':				'UKIP',			// UK Independence Party (UKIP) [NI]
	'party:17':				'UKIP',
	'party:117':			'UKIP',
	'party:1918':			'UKIP',
	
	// Green
	'party:63':				'Green',
	'party:130':			'Green',
	'party:305':			'Green',		// Green Party [NI]
	
	// Cista
	'party:2552':			'Cista',
	'party:2724':			'Cista',
	'party:6335':			'Cista',
	
};

// Truncate the data table
function truncateDataTable() {
	console.log('truncateDataTable');
	
	// Reduce the data table to just the filtered rows
	data = $.grep(data, candidate => candidate.__filters.every(value => value));
	
	// Rebuild the filters
	buildFilters();

}

// Display filters on selected columns
function buildFilters() {
	console.log('buildFilters');
	
	// Remove existing filters
	var cells = $('#sjo-api-row-filter td').empty();
	
	// Don't build filters on short data set
	// TODO: parameterise this
	if (data.length >= 10) {
		
		// Loop through filterable fields
		var values;
		$.each(tableColumns, (colIndex, column) => {
			var field = dataFields[column.name];
			
			if (column.has) {
				
				// Add checkbox to table header
				// TODO: add checkboxes to other sparse data (DOB, link fields, image, gender, elected)
				// TODO: add two checkboxes, one for blanks, one for non-blanks
				$(`<input type="checkbox" class="sjo-api-filter-checkbox" id="sjo-api-filter-__has_${column.name}">`)
					.appendTo(cells[colIndex]);
				
			} else if (field.filter) {
				
				// Build list of filter options
				values = [];
				$.each(data, (index, candidate) => {
					if (values.indexOf(candidate[column.name]) < 0) {
						values.push(candidate[column.name]);
						
						// Add wildcard options
						if (column.name == '_election' && url == allCandidatesUrl && candidate._election_group != candidate._election) {
							var wildcardOption = candidate._election_group + '.*';
							if (values.indexOf(wildcardOption) < 0) {
								values.push(wildcardOption);
							}
						}
						
					}
				});
				
				// Don't show filter for only one value
				console.log('buildFilters', field, values);
				if (values.length <= 1) return;
				
				// Add dropdown to table header
				$(`<select multiple class="sjo-api-filter" id="sjo-api-filter-${column.name}"></select>`)
					.html(values.sort().map(value => `<option>${escapeHtml(value)}</option>`).join(''))
					.appendTo(cells[colIndex]);
				
			}
			
		});
			
	}
	
	// Apply the new filters
	applyFilters(formatFilters);
	
	function formatFilters() {
		$('select.sjo-api-filter').chosen({
			'placeholder_text_multiple': ' ',
			'search_contains': true,
			'inherit_select_classes': true,
			//'width': field['filter-width'],
			'width': '100%',
		});

	}
	
}

// Apply a filter selection
function applyFilters(callback) {
	if (data === null) return;
	console.log('applyFilters', data);
	
	$('select.sjo-api-filter, .sjo-api-filter-checkbox').each(function(index, element) {
		
		// Get filter parameters
		var filter = $(element);
		var colIndex = filter.closest('td').prop('cellIndex');
		var column = tableColumns[colIndex];
		
		if (filter.is('[type="checkbox"]')) {
			
			// Get checkbox status
			var checked = filter.prop('checked');
			console.log('applyFilters', colIndex, column, checked, filter);
			
			// Update the data set with the filter value
			$.each(data, (index, candidate) => {
				candidate.__filters[colIndex] = !checked || candidate[column.name];
			});
			
		} else {
			
			// Get selected values
			var values = filter.val();
			console.log('applyFilters', colIndex, column, values, filter);
			
			// Parse numeric values
			// TODO: rename "sort" as something like "type"
			if (values && dataFields[column.name].sort == '#') {
				values = values.map(value => value === '' ? '' : parseInt(value));
			}
			
			// Update the data set with the filter value
			$.each(data, (index, candidate) => {
				candidate.__filters[colIndex] = values === null || values.indexOf(candidate[column.name]) >= 0 || 
					(column.name == '_election' && values.indexOf(candidate[column.name].split('.')[0] + '.*') >= 0);
			});
			
			// Hide extra space in dropdowns
			// TODO: this makes it impossible to type a second search term
			filter.closest('td').find('.search-field').toggle(!values);
			
		}
		
	});
	
	// Apply the current elections filter
	var current = url == allCandidatesUrl && $('#sjo-api-current').is(':checked');
	console.log('applyFilters', current);
	$.each(data, (index, candidate) => {
		candidate.__filters[tableColumns.length] = current ? candidate.election_current : true;
	});
	
	// Render table
	renderTable(callback);
	
}

// Sort data on selected column
function sortData(col) {
	console.log('sortData', col);
	
	var column = tableColumns[col];
	var field = dataFields[column.name];
	
	// Reverse sort if column is already sorted
	sortOrder = column == sortColumn ? -sortOrder : 1;
	sortColumn = column;
	console.log('sortData', sortColumn, sortOrder, field);
	
	// Store current order to produce a stable sort
	$.each(data, (index, candidate) => candidate.__index = index);
	
	// Sort data
	data.sort(function(a, b) {
		
		// Sort blanks last
		if (isNull(a[column.name]) && isNull(b[column.name])) return a.__index - b.__index;
		if (isNull(a[column.name])) return +1;
		if (isNull(b[column.name])) return -1;
		
		// Don't sort abbreviation fields
		if (column.has) return a.__index - b.__index;
		
		// If values are the same, keep in current order
		if (a[column.name] == b[column.name]) return a.__index - b.__index;
		
		// Sort numbers and strings correctly
		if (field.sort == '#') {
			return sortOrder * (a[column.name] - b[column.name]);
		} else {
			return sortOrder * a[column.name].localeCompare(b[column.name], {'sensitivity': 'base', 'ignorePunctuation': true});
		}
		
	});
	
	function isNull(value) {
		return value === null || value === '' || (column.has && value === false);
	}
	
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
function renderTable(callback) {
	console.log('renderTable');
	
	// Build the table rows to be displayed
	var renderData = buildTableRows();
	console.log('renderTable', renderData);
	
	// Check that the selected page shows some rows
	maxPageNo = Math.ceil(renderData.numRowsMatched / maxTableRows);
	maxPageNo = maxPageNo < 1 ? 1 : maxPageNo;
	if (pageNo > maxPageNo && pageNo < Infinity) {
		pageNo = maxPageNo;
		if (renderData.numRowsMatched > 0) {
			renderData = buildTableRows();
		}
	}
	console.log('renderTable', pageNo, maxPageNo);
	
	// Replace the table body
	$('#sjo-api-table tbody').html(renderData.bodyHtml.join(''));
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
		'<a role="button"' + (index + 1 == pageNo ? ' class="sjo-api-paging-current"' : '') + '">' + (index + 1) + '</a>').join(' '));
	$('.sjo-api-paging-prev').toggleClass('sjo-api-disabled', pageNo == 1 || pageNo == Infinity);
	$('.sjo-api-paging-next').toggleClass('sjo-api-disabled', pageNo == maxPageNo || pageNo == Infinity);
	$('.sjo-api-paging-all').toggleClass('sjo-api-paging-current', pageNo == Infinity);
	$('.sjo-api-paging').toggle(renderData.numRowsMatched > maxTableRows);
	
	// Toggle display of columns
	$('#sjo-api-table').toggleClass('sjo-api-table-has-party-lists', data.some(candidate => candidate.party_lists_in_use));
	$('#sjo-api-table').toggleClass('sjo-api-table-has-results', data.some(candidate => candidate.elected));
	
	// Toggle display of truncation button
	var current = $('#sjo-api-current').is(':checked');
	var currentSet = new Set(data.map(candidate => candidate.election_current));
	console.log('renderTable', current, currentSet);
	$('#sjo-api-button-truncate').toggle((current && currentSet.has(false)) || $('.sjo-api-filter option:selected').length > 0);
	
	// Display dupes button
	$('#sjo-api-button-dupes').show();
	
	// Set up filters on first render
	if (callback) callback.call();
	
	// Clean up the filter lists
	tidyFilters();
	
}

// Build table as raw HTML for rendering speed
function buildTableRows() {
	console.log('buildTableRows');

	// Initialise row count
	var bodyHtml = [];
	var numRowsMatched = 0;
	var numRowsDisplayed = 0;
	var startRowNo = pageNo == Infinity ? 1 : maxTableRows * (pageNo - 1) + 1;
	var endRowNo = pageNo == Infinity ? Infinity : startRowNo + maxTableRows;
	console.log('buildTableRows', pageNo, maxTableRows, startRowNo, endRowNo);
	
	// Loop through all data rows
	$.each(data, function(index, candidate) {
		
		// Check if this row passes all the filters
		if (!candidate.__filters.every(value => value)) return;
		numRowsMatched++;
		
		// Show only selected page
		if (numRowsMatched >= startRowNo && numRowsMatched < endRowNo) {
			
			// Add row to table body
			bodyHtml.push('<tr' + (candidate.elected ? ' class="sjo-api-row-elected"' : '') + '>' + buildTableRowCells(candidate).join('') + '</tr>');
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

// Build cells for a single table row
function buildTableRowCells(candidate) {
	
	// Loop through columns
	var cellsHtml = tableColumns.map(column => {
		
		// Get field and value
		var field = dataFields[column.name];
		
		// Build cell content
		var content = '';
		if (candidate[column.name]) {
			var value = column.has ? field.abbr : field.format == 'html' ? candidate[column.name] : escapeHtml(candidate[column.name]);
			content = field.link ? `<a href="${getLinkAddress(field, candidate)}">${value}</a>` : value;
		}
		
		var classes = [`sjo-api-cell-${column.has ? '__has_' : ''}${column.name}`];
		if (field.icon) classes.push('sjo-api-cell-icon');
		if (content && field.validate && !field.validate.call(this, candidate[column.name], candidate)) classes.push('sjo-api-invalid');
		
		// Return cell HTML
		return `<td class="${classes.join(' ')}">${content}</td>`;
		
	});
	
	return cellsHtml;
	
}

// Sort available filters at the top, and grey out others
function tidyFilters() {
	var current = url == allCandidatesUrl && $('#sjo-api-current').is(':checked');
	console.log('tidyFilters', current);
	
	// Go through all filterable fields
	// TODO: make this loop the same as buildFilters, or vice versa
	$.each(tableColumns, (colIndex, column) => {
		var field = dataFields[column.name];
		if (!field.filter) return;
		
		// Get the dropdown for this field
		var dropdown = $('#sjo-api-filter-' + (column.has ? '__has_' : '') + column.name);
		if (dropdown.length === 0) return;
		console.log('tidyFilters', dropdown.val(), dropdown);
		
		// Reset all options for this dropdown
		var options = dropdown.find('option');
		options.removeClass('sjo-api-filter-unavailable');
		dropdown.append(options.toArray().sort((a, b) => a.innerHTML > b.innerHTML));
		options = dropdown.find('option');
		
		// Only sort this dropdown if other dropdowns are selected
		if (current || $('.sjo-api-filter').not(dropdown).find(':checked').length > 0) {
			
			// Go through data and find values that are valid when accounting for other filters
			var values = [];
			$.each(data, function(index, candidate) {
				if (candidate.__filters.every((value, filterIndex) => filterIndex == colIndex || value)) {
					values.push(candidate[column.name]);
					
					// Add wildcard options
					if (column.name == '_election' && url == allCandidatesUrl && candidate._election_group != candidate._election) {
						if (values.indexOf(candidate._election_group + '.*') < 0) {
							values.push(candidate._election_group + '.*');
						}
					}
					
				}
			});
			
			// Sort the available options at the top
			var validOptions = options.filter((index, option) => values.indexOf(option.value) >= 0);
			dropdown.prepend(validOptions);
			options.not(validOptions).addClass('sjo-api-filter-unavailable');
		}
		
		// Refresh the fancy dropdown
		dropdown.trigger('chosen:updated');
		
	});
	
}

// ================================================================
// Find likely duplicates
// ================================================================

function findDuplicates() {
	console.log('findDuplicates');
	
	var minTotalScore = 0.90;
	var minNameScore = 0.98;
	
	// Clear previous results
	var table = $('#sjo-api-table-dupes').empty();
	
	// Loop through 2017 candidacies
	var groups = [];
	var processed = [];
	var unmatched = data.map(candidate => $.extend({}, candidate));
	var index = 0;
	checkData();
	
	// Check the next candidate in the data set
	function checkData() {
		var candidate = unmatched[index];
		$('#sjo-api-status-dupes').text(`Checking ${index + 1} of ${data.length}; ${groups.length} groups found`);
		
		// Start with an unmatched 2017 candidate
		if (!candidate.__matched && candidate._election_year === 2017) {
			
			// Add this candidate to the pending list
			candidate.__matched = true;
			var pending = [candidate];
			var matches = [];
			var found = false;
			
			// Work through the pending list, adding more as we go
			while (pending.length > 0) {
				var c1 = pending.pop();
				matches.push(c1);
				
				// Loop through all other unmatched rows
				$.each(unmatched, (index2, c2) => {
					if (c2.__matched) return;
					
					// If the ID matches, add it
					if (c2.id === c1.id) {
						c2.__matched = true;
						pending.push(c2);
					
					// Exclude known false positives
					} else if (dupeExclusions[c1.id] !== c2.id && dupeExclusions[c2.id] !== c1.id) {
						
						// Check score
						var score = calcScore(c1, c2);
						if (score.nameScore >= minNameScore && score.totalScore >= minTotalScore) {
							
							// Add this candidacy
							//c2.__score = score;
							c2.__matched = true;
							pending.push(c2);
							found = true;
							
						}
						
					}
					
				});
				
			}
			
			// Add to the table
			if (found) {
				groups.push(matches);
				writeDupesTable(groups.length - 1, matches);
			}
			
		}
		
		index++;
		if (index < unmatched.length) {
			setTimeout(checkData, 10);
		} else {
			$('#sjo-api-status-dupes').text(`Search complete; ${groups.length} groups found`);
		}
		
	}
	
	function calcScore(c1, c2) {
		
		var score = {'totalScore': 0, 'nameScore': 0};
		var totalScore = 1;
		
		// Check location similarity
		totalScore = totalScore * (c1._country === c2._country ? 1 : 0.95);
		if (totalScore < minTotalScore) return score;
		
		// Check party similarity
		totalScore = totalScore * (c1._party_group === c2._party_group ? 1 : c1._party_group === null || c2._party_group === null ? 0.95 : 0.90);
		if (totalScore < minTotalScore) return score;
		
		// Weight down different middle names 
		totalScore = totalScore * (c1._middle_names !== '' && c2._middle_names !== '' && c1._middle_names !== c2._middle_names ? 0.95 : 1);
		if (totalScore < minTotalScore) return score;
		
		// Calculate name similarity
		var nameScore = Math.max(                                                    jaroWinkler(c1.name,         c2.name),
			(                               c2._short_name  === c2.name        ? 0 : jaroWinkler(c1.name,         c2._short_name)),
			(                               c2._normal_name === c2._short_name ? 0 : jaroWinkler(c1.name,         c2._normal_name)),
			
			(c1._short_name  === c1.name                                       ? 0 : jaroWinkler(c1._short_name,  c2.name)),
			(c1._short_name  === c1.name || c2._short_name  === c2.name        ? 0 : jaroWinkler(c1._short_name,  c2._short_name)),
			(c1._short_name  === c1.name || c2._normal_name === c2._short_name ? 0 : jaroWinkler(c1._short_name,  c2._normal_name)),
			
			(c1._normal_name === c1.name                                       ? 0 : jaroWinkler(c1._normal_name, c2.name)),
			(c1._normal_name === c1.name || c2._short_name  === c2.name        ? 0 : jaroWinkler(c1._normal_name, c2._short_name)),
			(c1._normal_name === c1.name || c2._normal_name === c2._short_name ? 0 : jaroWinkler(c1._normal_name, c2._normal_name)));
		
		// Calculate overall score
		totalScore = totalScore * nameScore;
		return {'totalScore': totalScore, 'nameScore': nameScore};
		
	}
	
	function writeDupesTable(groupIndex, matches) {
		
		// Show table if any matches found
		//if (groups.length > 0) {
			table.show();
			
			// Write all groups to table
			//$.each(groups, (groupIndex, matches) => {
				
				//var bestScore = 0;
				var groupClass = `sjo-api-dupes-group-${groupIndex + 1}`;

				// Sort the group by ID and date
				matches.sort((a, b) => a.id > b.id || (a.id == b.id && a.election_date > b.election_date));
				$.each(matches, (matchIndex, match) => {
					
					// Recalculate the score against all the other matches
					var score = matches.reduce((acc, other) => other.id == match.id ? acc : Math.max(acc, calcScore(match, other).totalScore), 0);
					//bestScore = Math.max(bestScore, score);
					
					// Write to the dupes table
					var row = $(`<tr class="${groupClass}"></tr>`)
						.addClass(matchIndex === 0 ? 'sjo-api-dupes-first' : '')
						.addCell(groupIndex + 1)
						.addCell(match.id)
						.addCell('') // blank column for links
						.addCellHTML('<a href="' + getLinkAddress(dataFields['name'], match) + '">' + match.name + '</a>')
						.addCell(match.election_date)
						.addCell(match._election)
						.addCell(match.post_label)
						.addCell(match.party_name)
						//.addCell(match.party_id)
						.addCell(score.toFixed(2))
						.appendTo(table);
						
					if (score >= 0.95) {
						//$(`.${groupClass}`).addClass('sjo-api-dupes-verymuch');
						row.addClass('sjo-api-dupes-verymuch');
					}
					
				});
				
			//});
			
		//}
		
	}
	
}

// ================================================================
// General functions
// ================================================================

// Escape angle brackets in values
function escapeHtml(string) {
	return string ? ('' + string).replace(/</g, '&lt;').replace(/>/g, '&gt;') : string;
}

// Get the link for a display field
function getLinkAddress(field, candidate) {
	var href = field.link;
	var match;
	while (match = href.match(/^(.*?)@@(.*?)@@(.*)$/)) {
		href = match[1] + candidate[match[2]] + match[3];
	}
	return href;
}

// ================================================================
// Calculate difference between two strings
// ================================================================

// Based on http://en.wikipedia.org/wiki/Levenshtein_distance
function levenshtein(s, t) {
	if (s == t) return 0;
	if (s.length === 0) return t.length;
	if (t.length === 0) return s.length;
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
	if (!s1 || !s2) return 0;
	if (s1 === s2) return 1;
	var range = (Math.floor(Math.max(s1.length, s2.length) / 2)) - 1;
	var s1Matches = new Array(s1.length);
	var s2Matches = new Array(s2.length);
	for (i = 0; i < s1.length; i++) {
		var low = (i >= range ? i - range : 0);
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
// Supplementary data for name comparisons
// ================================================================

// TODO: move this to Github
var nameNorms = {
	'Alex':		'Alexander',
	'Mandy':	'Amanda',
	'Andy':		'Andrew',
	'Angie':	'Angela',
	'Ben':		'Benjamin',
	'Beverly':	'Bev',
	'Cat':		'Catherine',
	'Cath':		'Catherine',
	'Cathy':	'Catherine',
	'Charlie':	'Charles',
	'Chris':	'Christopher',
	'Dan':		'Daniel',
	'Danny':	'Daniel',
	'Dave':		'David',
	'Des':		'Desmond',
	'Dom':  	'Dominic',
	'Don':  	'Donald',
	'Donnie':	'Donald',
	'Doug': 	'Douglas',
	'Dougie': 	'Douglas',
	'Ed':		'Edward',
	'Eddie':	'Edward',
	'Ted':		'Edward',
	'Beth':		'Elizabeth',
	'Liz':		'Elizabeth',
	'Lizzie':	'Elizabeth',
	'Lizzy':	'Elizabeth',
	'Fra':		'Francis',
	'Frank':	'Francis',
	'Fred':		'Frederick',
	'Freddie':	'Frederick',
	'Freddy':	'Frederick',
	'Geoff':	'Geoffrey',
	'Gill': 	'Gillian',
	'Greg': 	'Gregory',
	'Jackie':	'Jacqueline',
	'Jamie':	'James',
	'Jim':		'James',
	'Jimmy':	'James',
	'Jan':  	'Janet',
	'Jeff':		'Jeffrey',
	'Jenny':	'Jennifer',
	'Jill': 	'Jillian',
	'Jo':		'Joanne',
	'Jack':		'John',
	'Johnny':	'John',
	'Jon':		'Jonathan',
	'Joe':		'Joseph',
	'Kath':		'Katherine',
	'Kathy':	'Katherine',
	'Kate':		'Katherine',
	'Katie':	'Katherine',
	'Katy': 	'Katherine',
	'Kim':		'Kimberly',
	'Les':		'Leslie',
	'Matt':		'Matthew',
	'Mick':		'Michael',
	'Mike':		'Michael',
	'Nick':		'Nicholas',
	'Norm':		'Norman',
	'Pam':		'Pamela',
	'Pete':		'Peter',
	'Philip':	'Phil',
	'Phillip':	'Phil',
	'Phill':	'Phil',
	'Pippa':	'Philippa',
	'Dick':		'Richard',
	'Rich':		'Richard',
	'Rick':		'Richard',
	'Ricky':	'Richard',
	'Bob':		'Robert',
	'Rob':		'Robert',
	'Robbie':	'Robert',
	'Robby':	'Robert',
	'Rod':		'Rodney',
	'Ron':		'Ronald',
	'Samuel':	'Sam',
	'Samantha':	'Sam',
	'Sammy':	'Sam',
	'Si':		'Simon',
	'Steve':	'Stephen',
	'Steven':	'Stephen',
	'Stevie':	'Stephen',
	'Sue':		'Susan',
	'Tom':		'Thomas',
	'Tommy':	'Thomas',
	'Terry':	'Terence',
	'Tim':		'Timothy',
	'Anthony':	'Tony',
	'Antony':	'Tony',
	'Val':  	'Valerie',
	'Vicky':	'Victoria',
	'Vikki':	'Victoria',
	'Bill':		'William',
	'Billy':	'William',
	'Will':		'William',
	'Willie':	'William',
};

// IDs that have been definitely ruled out as duplicates
var dupeExclusions = {
	6329:  6384,  6384: 13420, 13420: 6329,	// Zulfiqar Ali
	2137:  19640,							// Mark Durkan
	11540: 13370, 							// Paul Givan/Girvan
	10774: 19167, 							// Sarah Elizabeth Haydon
	7502:  8089,  8089: 16794, 16794: 7502,	// Elin Jones
	308:   20336,							// IDS/Iain Smith
	4032:  5282,							// Chris Foote Wood/Christopher Wood
};
