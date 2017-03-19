// ==UserScript==
// @name        Democracy Club tweaks
// @namespace   sjorford@gmail.com
// @include     https://candidates.democracyclub.org.uk/*
// @version     2017-03-19
// @grant       none
// @require     https://gist.githubusercontent.com/arantius/3123124/raw/grant-none-shim.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.12.0/moment.min.js
// ==/UserScript==

// Parameters
var rootUrl = 'https://candidates.democracyclub.org.uk/';
var maxUrlLength = 50;

// Styles
$(`<style id="sjo-style-tweaks">
	.sjo-stats {font-size: 9pt;}
	.sjo-stats td, .sjo-stats th, .sjo-lesspadding td, .sjo-lesspadding th {padding: 4px;}
	.sjo-nowrap {white-space: nowrap;}
	.sjo-mychanges {background-color: #ffeb99 !important;}
	.sjo-number {text-align: right;}
	.counts_table td, .counts_table th {padding: 4px !important;}
	.select2-results {max-height: 500px !important;}
	.form_group h3 {display: none !important;}
	.form_group p {display: inline-block !important; vertical-align: top !important; width: 30% !important; padding-right: 1%; margin-bottom: 0 !important;}
	.form_group p input {margin-bottom: 0.5rem !important;}
	.version .button {padding: 2px 4px !important}
	.sjo-list-dt, .sjo-list-dd {margin-bottom: 0px !important;}
	.sjo-list-dt, .sjo-label {float: left; width: 125px;}
	.sjo-list-dd::after {content: "\\a"; white-space: pre-line;}
	.sjo-list-dd {overflow: hidden;}
	.sjo-label {margin-top: 4px; margin-bottom: 0px;}
	input.sjo-input {height: 2rem; padding: 0.25rem 0.5rem;}
	input.sjo-input[type="url"] {width: 390px; display: inline-block;}
	input.sjo-input[type="text"] {width: 390px; display: inline-block;}
	input.sjo-input[type="email"] {width: 390px; display: inline-block;}
	input.sjo-input[type="number"] {width: 390px; display: inline-block;}
	.sjo-formitem {margin-bottom: 6px !important;}
	.sjo-formitem label {font-weight: bold;}
	.sjo-formitem .standing-select {width: 390px !important; display: inline-block; height: 1.75rem; padding: 0px 8px; margin-bottom: 0;}
	.sjo-formitem .select2-container {width: 390px !important; display: inline-block;}
	xxx.sjo-formitem hr {display: none;}
	input.sjo-input-empty {background-color: #ffc;}
	.sjo-input#id_twitter_username {width: 360px; margin-left: -4px; display: inline-block;}
	.sjo-prefix {display: inline-block; width: 30px; position: relative; top: 1px; height: 2rem; line-height: 2rem;}
	h2 {margin-top: 1em !important; margin-bottom: 0.5em !important; xxxpadding-bottom: 0.1em !important;}
	h3 {font-size: 1.2rem;}
	#add_election_button {margin-bottom: 0;}
	.person__versions {padding-top: 0;}
	.sjo-version {border: none !important;}
	.sjo-version tr {background: transparent !important; border-top: 1px solid white; vertical-align: top;}
	.sjo-version th {width: 32%; padding: 0.25em 0.5em 0.25em 0; font-weight: normal;}
	.sjo-version td {width: 32%; padding: 0.25em 0.5em;}
	.sjo-version td.sjo-version-op {width: 2%;}
	.sjo-version-delete {background-color: #fdd;}
	.sjo-version-add {background-color: #dfd;}
	.sjo-version-add.sjo-version-op {border-left: 1px solid white;}
	.sjo-results-label {float: left; width: 50%; height: 1.5rem; padding-top: 7px;}
	.sjo-results-num {width: 100px !important; margin-bottom: 5px !important; text-align: right; -moz-appearance: textfield !important;}
	.sjo-total-error {background-color: #fbb !important;}
	#id_source {max-height: 80px;}
	.sjo-addperson-listcolumns {column-width: 200px; -moz-column-width: 200px;}
	.sjo-addperson-listcolumns p {font-size: 0.8rem}
	.sjo-addperson-listitem {margin: 0; padding-left: 3.05em; text-indent: -3.05em;}
	.sjo-addperson-button {margin: 0 0 0.25em 0; padding: 0.25em 0.5em; text-indent: 0; font-size: 0.8rem}
	.sjo-addperson-text {color: inherit;}
	.sjo-addperson-latest .sjo-addperson-button {background-color: #fc0 !important;}
	.sjo-addperson-latest .sjo-addperson-text {font-weight: bold;}
	.sjo-posts-listcolumns {column-width: 250px; -moz-column-width: 250px;}
	.sjo-recent-unknown, .sjo-recent-unknown.sjo-mychanges {background-color: #daa !important;}
	.header__nav .large-4 {width: 33.33333% !important;}
	.header__nav .large-6 {width: 50% !important;}
	.header__nav .large-8 {width: 66.66667%; !important;}
	.candidates-list__person .button.secondary.small {margin-bottom: 0;}
	.missing_field {display: none;}
	.person__party_emblem img {max-height: 5em;}
	.finder__forms__container {width: 60% !important;}
	.header__hero {padding-top: 0 !important;}
	.header__hero h1 {font-size: 2rem !important;}
	.candidate-list {margin: 0.5em 0;}
	p {margin-bottom: 0.5rem;}
	.header__nav {padding: 1em 0 0 0;}
	h2 {font-size: 1.5rem;}
	.sjo-bulkadd-listitem {list-style-type: none; margin-top: 0.5rem;}
	.sjo-bulkadd-selected {background-color: #fff1a3;}
	.sjo-bulkadd-listitem input {margin-bottom: 0 !important}
	.sjo-bulkadd-data {font-size: 0.75rem; xxxcolor: #aaa; margin-bottom: 0rem !important; list-style-type: none;}
	.sjo-bulkadd-link {font-weight: bold;}
	.no-candidates {display: inline-block; width: 88%; margin-left: 0.5rem;}
	.sjo-ohno {display: inline-block; background-image: url("http://i256.photobucket.com/albums/hh187/sjorford/oh%20no.png"); background-repeat: no-repeat; height: 80px; width: 80px;}
	.select2-result-label {font-size: 0.75rem; padding: 0 2px !important;}
	.person__actions__action {padding: 1em; margin-bottom: 1em;}
	.person__actions__action h2 {margin-top: 0 !important;}
	.person__actions__action.sjo-post-candidates {background-color: #ff9;}
	.sjo-post-candidates p {margin-bottom: 0.25em !important;}
	.sjo-is-current {font-weight: bold;}
</style>`).appendTo('head');

$(function() {
	
	var url = window.location.href;
	
	// Add API link to header
	$('<li class="nav-links__item"><a href="/help/api">API</a></li>').appendTo('.header__nav .nav-links');
	
	// Clean up pasted names
	$('body').on('paste', 'input', event => window.setTimeout(() => cleanInputValue(event.target), 0));
	
	// Fix label "for" atttributes
	$('label').each((index, element) => {
		var label = $(element);
		var input = label.find('input');
		if (input.length > 0 && label.attr('for') != input.attr('id')) {
			label.attr('for', input.attr('id'));
		}
	});
	
	// Fix broken EC links
	$('.party__primary a[href^="http://search.electoralcommission.org.uk/"]').each(function(index, element) {
		element.href = element.href.replace(/electoral-commission:%20/, '');
	});
	
	// Add cartoon
	$('<div class="sjo-ohno"></div>').insertBefore('.no-candidates');
	
	// Add candidate - list of elections
	if (url.indexOf(rootUrl + 'person/create/select_election?') === 0) {
		formatAddCandidateButtons();
	}
	
	// Compact lists of posts
	if (url.indexOf(rootUrl + 'posts') === 0) {
		var lists = $('.container ul:has(li+li+li+li+li)').addClass('sjo-posts-listcolumns');
		lists.find('a:contains("Member of the Legislative Assembly for")')
			.each((index, li) => li.innerHTML = li.innerHTML.replace(/^Member of the Legislative Assembly for /, ''));
	}
	
	// Compact candidate pages
	if (url.indexOf(rootUrl + 'person/') === 0 && $('.person__hero').length > 0) {
		formatCandidatePage();
	}
	
	// Format update pages and new person pages
	if ((url.indexOf(rootUrl + 'person/') === 0 && url.indexOf('/update') > 0) || (url.indexOf(rootUrl + 'election/') === 0 && url.indexOf('/person/create/') > 0)) {
		formatEditForm();
	}
	
	// Get extra data on bulk adding page
	if (url.indexOf(rootUrl + 'bulk_adding/') === 0 && url.indexOf('/review/') >= 0) {
		formatBulkAddPage();
	}
	
	// Compact main statistics page
	if (url == rootUrl + 'numbers/') {
		formatStatistics();
	}

	// Compact recent changes pages
	if (url.indexOf(rootUrl + 'recent-changes') === 0) {
		formatRecentChanges();
	}
	
	// Format results pages
	if ($('h1:contains("Results")').length > 0) {
		formatResultsPage();
	}
	
	// TODO: hide long list of parties with no candidates
	// e.g. https://candidates.democracyclub.org.uk/numbers/election/local.city-of-london.2017-03-23/parties
	
	// Hide empty header
	var hero = $('.header__hero');
	var container = hero.find('.container');
	if (container.html().trim() === '') container.remove();
	if (hero.html().trim() === '') hero.remove();
	
});

// ================================================================
// Format a candidate page
// ================================================================

function formatCandidatePage() {

	$('dl').each(function(index, listElement) {
		
		var dl = $(listElement);
		var headingText = dl.prev('h2').text();
		var section = dl.parent('div');
		
		$('dt', listElement).each(function(index, termElement) {
			
			var dt = $(termElement);
			var dd = dt.next('dd');
			var dtText = dt.text();
			
			// Candidate details
			if (section.hasClass('person__details')) {
				if (headingText != 'Candidacies:') {
					dt.addClass('sjo-list-dt');
					dd.addClass('sjo-list-dd');
				}
				if (headingText == 'Links and social media:') {
					dt.text(dt.text()
						.replace(/^Twitter username.*$/, 			'Twitter')
						.replace(/^Facebook profile.*$/, 			'FB profile')
						.replace(/^Facebook page.*$/, 				'FB page')
						.replace(/^Homepage.*$/, 					'Homepage')
						.replace(/^Wikipedia.*$/, 					'Wikipedia')
						.replace(/^LinkedIn.*$/, 					'LinkedIn')
						.replace(/^The party's candidate page.*$/, 	'Party page')
					);
				}
			}
			
			// Format previous versions
			if (section.hasClass('version')) {
				if (dtText == 'Changes made') {
					formatVersionChanges(dd);
				} else {
					
					// Format version information
					dt.addClass('sjo-list-dt');
					dd.addClass('sjo-list-dd');
					if (dtText == 'Source') {
						dd.html(formatLinks(dd.html()));
					}
					if (dtText == 'Revert to this') {
						dt.hide();
						dd.hide();
					}
					
				}
			}
			
		});
		
	});
	
	var headingMappings = {
		'Personal details:':		'sjo-section-personal',
		'Candidacy:':				'sjo-section-candidacies',
		'Links and social media:':	'sjo-section-links',
		'Demographics:':			'sjo-section-demographics',
		'All versions':				'sjo-section-versions',
	};
	
	$('h2').each(function(index, element) {
		var heading = $(element);
		if (!heading.attr('id')) {
			var headingID = headingMappings[heading.text()];
			if (headingID) {
				heading.attr('id', headingID);
			}
		}
	});
	
	// Add upload link if not present
	if ($('.person__actions__photo').length === 0) {
		var candidateID = window.location.href.match(/\/person\/(\d+)/)[1];
		var candidateName = $('.person__hero h1').text();
		$(`<div class="person__actions__action person__actions__photo">
			<h2>Trying to upload a photo?</h2>
			<p>There's a separate page for <a href="/moderation/photo/upload/${candidateID}">uploading a photo of ${candidateName}</a>.</p>
			</div>`).insertAfter('.person__actions__edit');
	}
	
}

function formatVersionChanges(dd) {
	
	// Reformat version changes as a table
	// TODO: sort fields into input order
	// TODO: indicate recent versions
	var diffsPara = dd.find('.version-diff');
	var versionTable = $('<table class="sjo-version"></table>').prependTo(dd);
	diffsPara.find('span').each(function(index, element) {
		var span = $(element);
		var spanText = span.text().replace(/\n|\r/g, ' ');
		
		// Data added
		if (span.hasClass('version-op-add')) {
			var matchAdd = spanText.match(/^Added: (.+) => ["\[\{]([\s\S]*)["\]\}]$/);
			if (matchAdd) {
				if (matchAdd[2].length > 0) {
					$('<tr></tr>')
						.addHeader(matchAdd[1])
						.addCell('', 'sjo-version-op')
						.addCell('')
						.addCell('+', 'sjo-version-add sjo-version-op')
						.addCell(cleanData(matchAdd[2]), 'sjo-version-add')
						.appendTo(versionTable);
				}
				span.next('br').remove();
				span.remove();
			}
			
		// Data replaced
		} else if (span.hasClass('version-op-replace')) {
			var matchReplace = spanText.match(/^At (.+) replaced "(.*)" with "(.*)"$/);
			if (matchReplace) {
				$('<tr></tr>')
					.addHeader(matchReplace[1] + '</th>')
					.addCell('-', 'sjo-version-delete sjo-version-op')
					.addCell(cleanData(matchReplace[2]), 'sjo-version-delete')
					.addCell('+', 'sjo-version-add sjo-version-op')
					.addCell(cleanData(matchReplace[3]), 'sjo-version-add')
					.appendTo(versionTable);
				span.next('br').remove();
				span.remove();
			}
			
		// Data removed
		} else if (span.hasClass('version-op-remove')) {
			var matchDelete = spanText.match(/^Removed: (.+) \(previously it was ["\[\{](.*)["\]\}]\)$/); // TODO: null
			if (matchDelete) {
				$('<tr></tr>')
					.addHeader(matchDelete[1])
					.addCell('-', 'sjo-version-delete sjo-version-op')
					.addCell(cleanData(matchDelete[2]), 'sjo-version-delete')
					.addCell('', 'sjo-version-op')
					.addCell('')
					.appendTo(versionTable);
				span.next('br').remove();
				span.remove();
			}
			
		}
		
	});
	
	function cleanData(data) {
		return data.replace(/\\"/g, '"');
	}
	
}

// ================================================================
// Add a candidate - list of elections
// ================================================================

function formatAddCandidateButtons() {
	
	var lists = $('[role=list]');
	lists.each(function(index, element) {
		
		// Format list of buttons into columns
		var list = $(this);
		var listitems = list.find('[role=listitem]');
		listitems.each(function(index, element) {
			
			// Parse the button text
			var listitem = $(this).addClass('sjo-addperson-listitem');
			var button = $('a', listitem).addClass('sjo-addperson-button');
			
			// Move the election name out of the button
			var electionName = button.text().trim().match(/^Add .+? to the (The |Mayor of |City of |City and County of |Council of the |Comhairle nan )?(.+?)(( County| County Borough| Metropolitan Borough| City)? Council| Combined Authority)?( local election)?$/)[2];
			electionName = electionName == 'London Corporation' ? 'City of London' : electionName;
			button.text('Add').after(` <a class="sjo-addperson-text" href="${button.attr('href')}">${electionName}</a>`);
			
			// Add an ID to the button
			var electionID = button.attr('href').match(/\/election\/(.*)\/person\//)[1];
			if (!listitem.attr('id')) listitem.attr('id', 'sjo-addperson-listitem-' + electionID.replace(/\./g, '_'));
			
			// Flag elections by country
			listitem.addClass('sjo-addperson-listitem-' + getCountryForElection(electionID));
			
		});
		
		list.append(listitems.toArray().sort((a, b) => a.innerText > b.innerText));
		
	});
	
	// Remove headings
	var headings = lists.prev('h3');
	lists.add(headings).wrapAll('<div class="sjo-addperson-listcolumns"></div>');
	var localHeading = headings.filter(':contains("Local Elections")');
	headings.not(localHeading).hide();
	
	// Sort local elections by country
	var localList = localHeading.next('div');
	$.each({'EN': 'England', 'SC': 'Scotland', 'WA': 'Wales', 'NI': 'Northern Ireland'}, (key, country) => {
		var listitems = $('.sjo-addperson-listitem-' + key, localList);
		if (listitems.length > 0) {
			$('<div role="list"></div>').appendTo('.sjo-addperson-listcolumns').append(listitems).before(`<h3>${country}</h3>`);
		}
	});
	if (localList.find('p').length == 0) localList.add(localHeading).hide();
	
	// Store button ID when clicked
	$('body').on('click', '.sjo-addperson-listitem', event => GM_setValue('addperson-button', $(event.target).closest('.sjo-addperson-listitem').attr('id')));
	
	// Retrieve button ID on load
	var lastButtonID = GM_getValue('addperson-button');
	window.console.log(lastButtonID);
	if (lastButtonID) $(`[id="${lastButtonID}"]`).addClass('sjo-addperson-latest');
	
	//$('.content .container').append('<img height=100 width=100 src="file:///C:/Users/Stuart/Desktop/wales.svg">');
	
}

function getCountryForElection(electionID) {
	var country = 'EN';
	if (electionID.match(/^sp\.|^(local|parl)\.[^.]*(aberdeen|airdrie|angus|argyll|ayrshire|banff|berwick|caithness|carrick|clackmannan|coatbridge|cumbernauld|dumfries|dundee|du[mn]barton|east-kilbride|edinburgh|eilean-siar|eileanan-an-iar|falkirk|fife|glasgow|glenrothes|gordon|hamilton|highland|inverclyde|inverness|kilmarnock|kirkcaldy|lanark|livingston|lothian|moray|motherwell|orkney|perth|renfrew|scottish-borders|shetland|skye|stirling)/)) {
		country = 'SC';
	} else if (electionID.match(/^naw\.|^(local|parl|pcc)\.[^.]*(aberavon|anglesey|arfon|brecon|bridgend|caerphilly|cardiff|carmarthen|ceredigion|clwyd|conwy|cynon|deeside|delyn|denbigh|flint|glamorgan|gower|gwent|gwynedd|islwyn|llanelli|meirionnydd|merthyr|monmouth|montgomery|neath|newport|ogmore|pembroke|pontypridd|powys|rhondda|swansea|torfaen|wales|wrexham|ynys-m)/)) {
		country = 'WA';
	} else if (electionID.match(/^nia\.|^(local|parl)\.[^.]*(antrim|armagh|belfast|causeway|derry|(north|south)-down([^s]|$)|fermanagh|foyle|lagan-valley|lisburn|newry|strangford|tyrone|ulster|upper-bann)/)) {
		country = 'NI';
	}
	return country;
}

// ================================================================
// Edit a candidate
// ================================================================

function formatEditForm() {
		
	var candidateFields = {
		'id_honorific_prefix':				'Title',
		'id_name':							'Name',
		'id_honorific_suffix':				'Honours',
		'id_email':							'Email',
		'id_twitter_username':				'Twitter',
		'id_facebook_personal_url':			'FB profile',
		'id_facebook_page_url':				'FB page',
		'id_homepage_url':					'Homepage',
		'id_wikipedia_url':					'Wikipedia',
		'id_linkedin_url':					'LinkedIn',
		'id_party_ppc_page_url':			'Party page',
		'id_gender':						'Gender',
		'id_birth_date':					'Date of birth',
		'add_more_elections':				'Election',
	};
	
	var electionFields = {
		'id_standing_{slug}':				'Standing',
		'id_constituency_{slug}':			'Constituency',
		'id_party_gb_{slug}':				'Party',
		'id_party_ni_{slug}':				'Party',
		'id_party_list_position_gb_{slug}':	'Position',
		'id_party_list_position_ni_{slug}':	'Position',
	};
	
	// Format general candidate fields
	$.each(candidateFields, (key, value) => formatField(key, value, null));
	
	// Format election fields on page load
	$('[id^="id_standing_"]').each((index, element) => 
		$.each(electionFields, (key, value) => formatField(key, value, element.id.replace('id_standing_', ''))));
	
	// Detect new election
	var refreshTimer;
	$('body').on('change', '#add_more_elections', event => {
		var slug = event.target.value;
		window.console.log(slug);
		if (!refreshTimer) {
			refreshTimer = window.setInterval(() => {
				window.console.log(slug);
				if ($(`[id="id_standing_${slug}"]`).length > 0) {
					window.clearInterval(refreshTimer);
					refreshTimer = null;
					$.each(electionFields, (key, value) => formatField(key, value, slug));
				}
			}, 0);
		}
	});
	
	// Format an input field
	function formatField(id, labelText, slug) {
		if (slug) id = id.replace('{slug}', slug);
		window.console.log('formatField', id, labelText, slug);
		
		var input = $(`[id="${id}"]`);
		var formItem = input.closest('.form-item');
		if (formItem.length === 0) formItem = input.closest('p');
		var label = $('label', formItem).first();
		
		// Reformat field
		formItem.addClass('sjo-formitem');
		label.text(labelText + ':');
		label.addClass('sjo-label');
		input.addClass('sjo-input');
		if (input.val() === '') input.addClass('sjo-input-empty');
		$('.columns', formItem).addClass('sjo-form-columns');
		
		// Format Twitter prefix
		var prefix = $('.prefix', formItem);
		if (input.parent().hasClass('columns') && input.parent().parent().hasClass('row') && prefix.parent().hasClass('columns')) {
			prefix.unwrap().addClass('sjo-prefix');
			input.unwrap().unwrap();
		}
	
		// Trim party selection
		if (input.is('.party-select')) {
			var html = input.html();
			input.html(html.replace(/\((\d+) candidates\)/g, '[$1]'));
		}
		
	}
	
	// Display candidates on load
	$('select.post-select').each((index, element) => getPostCandidates(element));
	
	// Detect constituency change
	$('body').on('change', 'select.post-select', event => getPostCandidates(event.target));
	
	// Display current candidates for post
	function getPostCandidates(input) {
		
		// Get election and post
		var electionID = input.id.match(/id_constituency_(.*)/)[1];
		$('#sjo-post-candidates-' + electionID.replace(/\./g, '_')).empty();
		var selected = $(':checked', input);
		if (selected.length === 0) return;
		var postName = selected.text();
		var postID = selected.val();
		
		// Call API
		$.getJSON(`/api/v0.9/posts/${postID}/`, data => renderPostCandidates(electionID, postID, postName, data));

	}
	
	function renderPostCandidates(electionID, postID, postName, data) {
		
		window.console.log('renderPostCandidates', electionID, postID, postName, data);
		var block = $('#sjo-post-candidates-' + electionID.replace(/\./g, '_'));
		if (block.length === 0) {
			block = $('<div class="person__actions__action sjo-post-candidates" id="sjo-post-candidates-' + electionID.replace(/\./g, '_') + '"></div>').appendTo('.person__actions');
		}
		block.append(`<h2>Current candidates for ${postName}</h2>`);
		
		var candidates = $.grep(data.memberships, member => member.election.id == electionID);
		if (candidates.length === 0) {
			block.append('<p>There are currently no candidates for this post</p>');
		} else {
			var match = window.location.href.match(/\/person\/(\d+)\//);
			var currentID = match ? match[1] : '';
			block.append(candidates.map(candidate => 
				`<p>` + (candidate.person.id == currentID ? `<span class="sjo-is-current"> ${candidate.person.name}</span>` : `<a href="/person/${candidate.person.id}">${candidate.person.name}</a>`) + 
				` (${getPartyShort(candidate.on_behalf_of)})</p>`).join(''));
		}
		
	}
	
	function getPartyShort(party) {
		return partyShort[party.id] ? partyShort[party.id] : party.name;
	}
	
	// Abbreviations for common parties
	var partyShort = {
		'party:52':  			'Conservative',
		'party:53':  			'Labour',
		'joint-party:53-119':  	'Labour/Co-op',
		'party:90':  			'Lib Dem',
		'party:85':  			'UKIP',
		'party:63':  			'Green',
		'party:130': 			'Green',
		'party:102': 			'SNP',
		'party:77': 			'Plaid Cymru',
		'party:804': 			'TUSC',
		
		'party:83':  			'UUP',
		'party:70':  			'DUP',
		'party:55':  			'SDLP',
		'party:39':  			'Sinn Féin',
		'party:103':  			'Alliance',
		'party:305': 			'Green',
		'party:773': 			'PBP',
		'party:680':  			'TUV',
		'party:101':  			'PUP',
		'party:51':  			'Conservative',
		'party:84':  			'UKIP',
		
		'ynmp-party:2': 		'Ind',
	};

}

// ================================================================
// Bulk adding review page
// ================================================================

function formatBulkAddPage() {
	
	// TODO: allow party dropdowns to be deselected
	
	$('form li input[type="radio"]').each(lookupBulkAddData);
	
	function lookupBulkAddData(index, element) {
		
		// Get ID of matching person
		var input = $(element);
		input.closest('li').addClass('sjo-bulkadd-listitem').find('a').addClass('sjo-bulkadd-link');
		var personID = input.val();
		if (personID == '_new') return;
		
		// Call API
		$.getJSON(`/api/v0.9/persons/${personID}/`, data => renderBulkAddData(input, data));

	}
	
	function renderBulkAddData(input, data) {
		window.console.log(data);
		input.closest('li')
			.append('<ul class="sjo-bulkadd-data">' + data.memberships.map(member => 
				`<li>${member.election.name} (${trimPost(member.post.label)}) - ${member.on_behalf_of.name}</li>`).join('') + '</ul>');
	}
	
	function trimPost(postName) {
		return postName.match(/^(Member of (the Scottish )?Parliament for )?(.*?)( ward)?$/)[3];
	}
	
	// Highlight selected option
	highlightSelected();
	$('body').on('change', '.sjo-bulkadd-listitem input[type="radio"]', highlightSelected);
	
	function highlightSelected() {
		$('.sjo-bulkadd-listitem').each((index, element) =>
			$(element).toggleClass('sjo-bulkadd-selected', $('input[type="radio"]', element).is(':checked')));
	}
	
}

// ================================================================
// Results
// ================================================================

function formatResultsPage() {
	
	$('input[id^=id_memberships], #id_num_turnout_reported, #id_num_spoilt_ballots')
		.addClass('sjo-results-num')
		.prev('label')
		.addClass('sjo-results-label')
		.unwrap();
	
	// Check total
	$('body').on('input', '.sjo-results-num', function(event) {
		window.console.log(event.target);
		
		// Get entered total
		var totalCell = $('#id_num_turnout_reported');
		if (totalCell.val() === '') return;
		var enteredTotal = parseInt(totalCell.val(), 10);
		
		// Sum all cells except total
		var sumTotal = $('.sjo-results-num').toArray().map(function(element, index) {
			var cell = $(element);
			return cell.prop('id') == 'id_num_turnout_reported' ? 0 : cell.val() === '' ? 0 : parseInt(cell.val(), 10);
		}).reduce(function(prev, curr) {
			return prev + curr;
		});
		
		// Compare values
		if (sumTotal == enteredTotal) {
			totalCell.removeClass('sjo-total-error');
		} else {
			totalCell.addClass('sjo-total-error');
			window.console.log('sum of votes', sumTotal, 'difference', sumTotal - enteredTotal);
		}
		
	});
	
}

// ================================================================
// Compact recent changes pages
// ================================================================

function formatRecentChanges() {
	
	var username = 'sjorford'; // TODO: get this from top of page?
	var now = moment();
	
	// Get table and headings
	var table = $('.container table').addClass('sjo-lesspadding');
	table.find('th').addClass('sjo-nowrap');
	var headings = getTableHeadings(table);
	
	table.find('tr').each(function(index, element) {
		var row = $(element);
		var cells = row.find('td');
		if (cells.length === 0) return;
		
		// Reformat dates
		var dateCell = cells.eq(headings['Date and time']);
		var time = moment(dateCell.html().replace(/\./g, ''), 'MMMM D, YYYY, h:mm a');
		dateCell.html(time.format('D MMM' + (time.year() == now.year() ? '' : ' YYYY') + ' HH:mm'));
			
		// Stop columns wrapping
		dateCell.add(cells.eq(headings['Action'])).addClass('sjo-nowrap');
		
		// Make sources into links
		var sourceCell = cells.eq(headings['Information source']);
		sourceCell.html(formatLinks(sourceCell.html(), maxUrlLength));
		
		// Highlight my changes
		if (cells.eq(headings['User']).text() == username) {
			row.addClass('sjo-mychanges');
		}
		
	});
	
}

// ================================================================
// Reformat statistics
// ================================================================

function formatStatistics() {
	
	$('.statistics-elections').each(function(index, element) {
		window.console.log(element);
		
		var table = $('<table class="sjo-stats"></table>')
			.appendTo(element)
			.click(function(event) {
				if (event.target.tagName == 'A') return;
				table.selectRange();
			});
		
		$('div', element).each(function(index, element) {
			
			var div = $(element);
			//window.console.log(div);
			
			var matchId = element.id.match(/^statistics-election-((parl|sp|naw|nia|gla|mayor|pcc|local)(-(a|r|c))?(-([-a-z]{2,}))?)-(\d{4}-\d{2}-\d{2})$/);
			//window.console.log(element.id, matchId);
			
			var headerText = div.find('h4').text();
			var matchHeader = headerText.match(/^Statistics for the (\d{4} )?(.+?)( (local|Mayoral))?( [Ee]lection|by-election: (.*) (ward|constituency))?( \((.+)\))?$/, '');
			//window.console.log(headerText, matchHeader);
			
			if (matchId && matchHeader) {
				//window.console.log(matchId, matchHeader);
				
				var key = matchId[2] + (matchId[3] ? '.' + matchId[4] : '') + (matchId[5] ? '.' + matchId[6] : '');
				var type = matchId[2];
				var date = matchId[7];
				var area = matchHeader[2] + (matchHeader[8] ? matchHeader[8] : '');
				//window.console.log(key, type, date, area);
				
				var bullets = div.find('li');
				var candidates = bullets.eq(0).text().replace(/^Total candidates: /, '');
				bullets.eq(0).addClass('sjo-remove');
				
				var typeRows = table.find('[sjo-election-type="' + type + '"]');
				var prevRows = typeRows.filter(function(index, element) {
					return $(element).attr('sjo-election-key') <= key;
				});
				
				var row = $('<tr></tr>')
					.attr('sjo-election-type', type)
					.attr('sjo-election-key', key)
					.append('<td>' + date + '</td>')
					//.append('<td>' + type + '</td>')
					.append('<td>' + key + '</td>')
					.append('<td>' + area + '</td>')
					.append('<td style="text-align: right;">' + candidates + '</td>');
				
				bullets.slice(1).each(function(index, element) {
					var bullet = $(element);
					var link = bullet.find('a');
					if (link.length === 0) return; // *************************
					link.html(link.html()
						.replace(/^Candidates per /, 'by ')
						.replace(/^See progress towards locking all posts$/, 'progress'));
					$('<td class="sjo-nowrap"></td>').append(link).appendTo(row);
					bullet.addClass('sjo-remove');
				});
				
				if (prevRows.length > 0) {
					row.insertAfter(prevRows.last());
				} else if (typeRows.length > 0) {
					row.insertBefore(typeRows.first());
				} else {
					row.appendTo(table);
				}
				
				$('.sjo-remove').remove();
				if (div.find('li').length === 0) {
					div.hide();
					div.prev('h3').hide();
				}
				
			}
			
		});
		
	});
	
}

// ================================================================
// General functions
// ================================================================

// Trim an inputted value and fix upper case names
// TODO: fix entries like "JOHN SMITH"
function cleanInputValue(input) {
	var value = input.value.trim().replace(/\s+/g, ' ');
	if (input.name == 'q' || input.id == 'id_name' || input.id.match(/^id_form-\d+-name$/)) {
		var match = value.match(/^([-'A-Z]{3,})\s+(.*)$/);
		value = (match ? (match[2] + ' ' + match[1][0] + match[1].slice(1).toLowerCase()) : value);
	}
	input.value = value;
}

// Convert a raw URL to a formatted link
function formatLinks(html, maxLength) {
	return html.replace(/https?:\/\/[^\s]+/g, function(match) {
		return '<a href="' + match + '">' + (maxLength && match.length > maxLength ? (match.substr(0, maxLength) + '...') : match) + '</a>';
	});
}

function getTableHeadings(element) {
	var headings = {};
	$(element).filter('table').eq(0).find('th').first().closest('tr').find('th').each(function(index, element) {
		var text = $(element).text();
		headings[text] = index;
		headings[index] = text;
	});
	return headings;
}

// ================================================================
// jQuery plugins
// ================================================================

// Add a new cell to a table row
(function($) {
	
	// Add cell with text content
	$.fn.addCell = function(text, className, id) {
		return _addCell(this, false, text, className, id, false);
	};
	
	// Add cell with HTML content
	$.fn.addCellHTML = function(html, className, id) {
		return _addCell(this, true, html, className, id, false);
	};
	
	// Add header cell with text content
	$.fn.addHeader = function(text, className, id) {
		return _addCell(this, false, text, className, id, true);
	};
	
	// Add header cell with HTML content
	$.fn.addHeaderHTML = function(html, className, id) {
		return _addCell(this, true, html, className, id, true);
	};
	
	function _addCell(obj, isHTML, content, className, id, header) {
		for (var i = 0; i < obj.length; i++) {
			var row = obj[i];
			if (row.tagName == 'TR') {
				var cell = header ? $('<th></th>') : $('<td></td>');
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
