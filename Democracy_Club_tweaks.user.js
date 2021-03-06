// ==UserScript==
// @name        Democracy Club tweaks
// @namespace   sjorford@gmail.com
// @include     https://candidates.democracyclub.org.uk/*
// @version     2017-05-10
// @grant       none
// @require     https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.12.0/moment.min.js
// @require     https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// @require     https://raw.githubusercontent.com/sjorford/fun-with-elections/master/dc-lib.js
// ==/UserScript==

// Parameters
var rootUrl = 'https://candidates.democracyclub.org.uk/';
var maxUrlLength = 40;
var knownPartiesOnly = true;

// Styles
$(`<style id="sjo-style-tweaks">
	
	.header__masthead {padding: 0.25em 1em;}
	.header__nav {padding: 0.25em 0 0 0;}
	.header__hero {padding-bottom: 0.5em;}
	button, .button {margin-bottom: 0.5em;}
	
	.sjo-mychanges, .sjo-mysuggestion {background-color: #ffeb99 !important;}
	.sjo-changes-candidacy-delete {background-color: pink !important;}
	
	.sjo-stats {font-size: 9pt;}
	.sjo-stats td, .sjo-stats th, .sjo-lesspadding td, .sjo-lesspadding th {padding: 4px;}
	.sjo-nowrap {white-space: nowrap;}
	.sjo-number {text-align: right;}
	.counts_table td, .counts_table th {padding: 4px !important;}
	.select2-results {max-height: 500px !important;}
	.version .button {padding: 2px 4px !important}
	.sjo-list-dt, .sjo-list-dd {margin-bottom: 0px !important;}
	.sjo-list-dt, .sjo-label {float: left; width: 125px;}
	.sjo-list-dd::after {content: "\\a"; white-space: pre-line;}
	.sjo-list-dd {overflow: hidden; margin-left: 125px;}
	.sjo-list-dd:first-of-type {margin-left: 0;}
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
	
	.content {padding-top: 0.5em;}
	.person__details dl {margin-bottom: 1em;}
	h2 {margin-top: 0.5em !important; margin-bottom: 0.25em !important; padding-bottom: 0.25em !important;}
	h3 {font-size: 1.2rem;}
	#add_election_button {margin-bottom: 0;}
	.person__versions {padding-top: 0;}
	
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
	xxx.sjo-recent-unknown, xxx.sjo-recent-unknown.sjo-mychanges {background-color: #daa !important;}
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
	
	/* http://stackoverflow.com/a/26637893/1741429 */
	.sjo-posts-listcolumns {column-width: 250px; -moz-column-width: 250px;}
	.sjo-post {border: 1px solid white; overflow: hidden; page-break-inside: avoid;}
	.sjo-post-incomplete {background-color: #fdd;}
	.sjo-post-complete {background-color: #ffb;}
	.sjo-post-verified {background-color: #bbf7bb;}
	
	.show-new-candidate-form {display: none;}
	
	.sjo-api-timeline {margin-bottom: 0.5rem;}
	.sjo-api-timeline-item {display: inline-block; border: 2px solid white; font-size: small; padding: 2px 2px 2px 16px;}
	.sjo-api-timeline-item:first-of-type {padding-left: 6px; border-top-left-radius: 5px; border-bottom-left-radius: 5px;}
	.sjo-api-timeline-item:last-of-type {padding-right: 6px; border-top-right-radius: 5px; border-bottom-right-radius: 5px; }
	
	.sjo-api-timeline-status_not_started {background-color: darkgrey; color: white;}
	.sjo-api-timeline-status_in_progress {background-color: #f6cd59; color: white;}
	.sjo-api-timeline-status_done {background-color: #8ccc8c; color: white;}
	
	.sjo-api-timeline-arrow.sjo-api-timeline-status_not_started:after {border-left-color: darkgrey;}
	.sjo-api-timeline-arrow.sjo-api-timeline-status_in_progress:after {border-left-color: #f6cd59;}
	.sjo-api-timeline-arrow.sjo-api-timeline-status_done:after {border-left-color: #8ccc8c;}

	/* http://www.cssarrowplease.com/ */
	.sjo-api-timeline-arrow {
		position: relative;
	}
	.sjo-api-timeline-arrow:after, .sjo-api-timeline-arrow:before {
		left: 100%;
		top: 50%;
		border: solid transparent;
		content: " ";
		height: 0;
		width: 0;
		position: absolute;
		pointer-events: none;
	}
	.sjo-api-timeline-arrow:after {
		border-width: 12px;
		margin-top: -12px;
	}
	.sjo-api-timeline-arrow:before {
		border-left-color: #ffffff;
		border-width: 15px;
		margin-top: -15px;
	}
	
	.form_group h3 {display: none !important;}
	.form_group p {display: inline-block !important; vertical-align: top !important; width: 48% !important; padding-right: 1%; margin-bottom: 0 !important;}
	.form_group p input {margin-bottom: 0.5rem !important;}
	
	.select2-result-label {font-size: 0.8rem;}
	.person__actions__action {padding: 1em; margin-bottom: 1em;}
	.person__actions__action h2 {margin-top: 0 !important;}
	.person__actions__action.sjo-post-candidates {background-color: #ff9;}
	.sjo-post-candidates p {margin-bottom: 0.25em !important;}
	.sjo-is-current {font-weight: bold;}
	.sjo-search-exact {border: 2px solid gold; padding: 5px; margin-left: -7px; border-radius: 4px; background-color: #fff3b1;}
	xxx.sjo-search-link {font-weight: bold; font-size: 0.75rem; margin-bottom: 0.5em; display: inline-block;}
	
	.document_viewer {min-height: 600px;}
	
	table.sjo-tree tr {background-color: inherit;}
	.sjo-tree td, .sjo-tree th {font-size: 8pt; padding: 2px; min-width: 20px;}
	#sjo-versions-showall {display: block; font-size: 8pt; margin-bottom: 1em;}
	.sjo-tree-current {background-color: gold;}
	
	.sjo-tree thead {background-color: inherit;}
	.sjo-tree-year-inner {background: white;}
	.sjo-tree-year {text-align: center; background: left center repeat-x url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSURBVBhXY2BgYAAAAAQAAVzN/2kAAAAASUVORK5CYII=');}
	
	.sjo-tree-horiz {background: repeat-x url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAASdEVYdFNvZnR3YXJlAEdyZWVuc2hvdF5VCAUAAAAsSURBVDhPY/wPBAxUBExQmmpg1EDKweA3kBGIR9MhZWA0L1MORg2kFDAwAAB9tQkdVRptbgAAAABJRU5ErkJggg==');}
	.sjo-tree-turnup {background: no-repeat url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAASdEVYdFNvZnR3YXJlAEdyZWVuc2hvdF5VCAUAAABOSURBVDhPY/wPBAx4ACMjI5QFAQSUMzBBaaqBUQMpB/Q1ED3JEANAOvAnLDQwuNMhIdeBANEGEmMYCBDMy6SCgQ1DYsCogZQDKhvIwAAApcUVF6f1O7gAAAAASUVORK5CYII=');}
	.sjo-tree-vert {background: repeat-y url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAASdEVYdFNvZnR3YXJlAEdyZWVuc2hvdF5VCAUAAAAySURBVDhPY/wPBAx4ACMjI5QFAQSUMzBBaaqBUQMpB6MGUg5GDaQcjBpIORjsBjIwAAAaYgckACvF4gAAAABJRU5ErkJggg==');}
	.sjo-tree-mergein {background: no-repeat  url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAoCAYAAAD+MdrbAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAASdEVYdFNvZnR3YXJlAEdyZWVuc2hvdF5VCAUAAABOSURBVEhLY/wPBAxUBExQmmpg1EDKweA3kBGIR9MhZYBgXmZkBAUzKsCnhWQXEipLRmCkjBpIORg1kHIwaiDlYNRAysGogZSDEWcgAwMAmLEPQjc8JtAAAAAASUVORK5CYII=');}
	
	.sjo-version {border: none !important;}
	.sjo-version tr {background: transparent !important; border-top: 1px solid white; vertical-align: top;}
	.sjo-version th {width: 32%; padding: 0.25em 0.5em 0.25em 0; font-weight: normal;}
	.sjo-version td {width: 32%; padding: 0.25em 0.5em;}
	.sjo-version td.sjo-version-op {width: 2%;}
	.sjo-version-delete {background-color: #fdd;}
	.sjo-version-add {background-color: #dfd;}
	.sjo-version-add.sjo-version-op {border-left: 1px solid white;}
	.sjo-version-delete del {text-decoration: none; background-color: gold;}
	.sjo-version-delete ins {display: none;} 
	.sjo-version-add ins {text-decoration: none; background-color: gold;}
	.sjo-version-add del {display: none;} 
	
</style>`).appendTo('head');

$(function() {
	
	var url = location.href;
	
	// Clean up pasted names
	$('body').on('paste', 'input', event => setTimeout(() => cleanInputValue(event.target), 0));
	
	/*
	// Fix label "for" atttributes
	$('label').each((index, element) => {
		var label = $(element);
		var input = label.find('input');
		if (input.length > 0 && label.attr('for') != input.attr('id')) {
			label.attr('for', input.attr('id'));
		}
	});
	*/
	
	// Fix broken EC links
	$('.party__primary a[href^="http://search.electoralcommission.org.uk/"]').each(function(index, element) {
		element.href = element.href.replace(/electoral-commission:%20/, '');
	});
	
	// Reformat various pages
	if (url.indexOf(rootUrl + 'person/create/select_election?') === 0) {
		formatAddCandidateButtons();
	} else if (url.indexOf(rootUrl + 'posts') === 0) {
		formatPostsList();
	} else if (url.indexOf(rootUrl + 'election/') === 0 && url.indexOf('/post/') > 0) {
		formatPostPage();
	} else if ((url.indexOf(rootUrl + 'person/') === 0 && url.indexOf('/update') > 0) || (url.indexOf(rootUrl + 'election/') === 0 && url.indexOf('/person/create/') > 0)) {
		formatCandidatePage();
		formatEditForm();
	} else if (url.indexOf(rootUrl + 'person/') === 0 && $('.person__hero').length > 0) { // what was the second bit for again?
		formatCandidatePage();
	} else if (url.indexOf(rootUrl + 'bulk_adding/') === 0 && url.indexOf('/review/') >= 0) {
		formatBulkAddReviewPage();
	} else if (url.indexOf(rootUrl + 'bulk_adding/') === 0 && url.indexOf('/review/') < 0) {
		formatBulkAddPage();
	} else if (url == rootUrl + 'numbers/') {
		formatStatistics();
	} else if (url.indexOf(rootUrl + 'recent-changes') === 0) {
		formatRecentChanges();
	} else if (url.indexOf(rootUrl + 'moderation/suggest-lock') === 0) {
		formatLockSuggestions();
	} else if (url.indexOf(rootUrl + 'upload_document/') === 0) {
		$('.header__hero').hide();
	//} else if ($('h1:contains("Results")').length > 0) {
	} else if (url.indexOf(rootUrl + 'uk_results/posts/') === 0) {
		formatResultsPage();
	} else if (url.indexOf(rootUrl + 'uk_results/') === 0) {
		formatResultsPostList();
	} else if (url.indexOf(rootUrl + 'search?') === 0) {
		formatSearchResults();
	}
	
	// TODO: hide long list of parties with no candidates
	// e.g. https://candidates.democracyclub.org.uk/numbers/election/local.city-of-london.2017-03-23/parties
	
	// Hide empty header
	var hero = $('.header__hero');
	var container = hero.find('.container');
	if (container.html().trim() === '') container.remove();
	if (hero.html().trim() === '') hero.remove();
	
	// Hide banners
	$('div.panel').filter((index, element) => element.innerText.fullTrim() == 'These candidates haven\'t been confirmed by the official "nomination papers" from the council yet. This means they might not all end up on the ballot paper. We will manually verify each candidate when the nomination papers are published.').hide();
	$('div[style="background-color:#FFFF8E;padding:0.5em;margin-bottom:1em;clear:both"]').filter((index, element) => element.innerText.fullTrim() == '#GE2017 update There’s going to be a general election on 8 June. Read about how you can help, or donate now to support our work.').hide();
	
	// Shortcuts
	$('body').on('keydown', event => {
		if (event.shiftKey && event.altKey && !event.ctrlKey && event.key == 'F') {
			$('html').scrollTop(0);
			$('input[name="q"]').focus();
			event.preventDefault();
		}
	});
	
});

function formatSearchResults() {
	
	var searchName = $('form.search input[name="q"]').val().trim();
	var regexString = '(^|\\s)' + searchName.replace(/[\.\*\?\[\]\(\)\|\^\$\\\/]/g, '\\$&').replace(/\s+/, '(\\s+|\\s+.*\\s+)') + '$';
	console.log('formatSearchResults', regexString);
	var regex = new RegExp(regexString, 'i');
	
	$('.candidates-list__person').each((index, element) => {
		var item = $(element);
		if (item.find('.candidate-name').text().match(regex)) {
			item.addClass('sjo-search-exact');
		}
	});
	
}

// ================================================================
// Format the list of elections
// ================================================================

function formatPostsList() {
	
	var lists = $('.content ul');
	//lists = lists.filter(':has(li+li)');
	lists.addClass('sjo-posts-listcolumns');
	lists.find('a:contains("Member of the Legislative Assembly for")')
		.each((index, element) => element.innerHTML = element.innerHTML.replace(/^Member of the Legislative Assembly for /, ''));
	
	$('abbr:contains("\u{1f513}")').closest('li').addClass('sjo-post-complete');
	$('abbr:contains("\u{1f512}")').closest('li').addClass('sjo-post-verified');
	$('li', lists).addClass('sjo-post').not('.sjo-post-complete, .sjo-post-verified').addClass('sjo-post-incomplete');
	
	// TODO: format headings
	
}

// ================================================================
// Format a post page
// ================================================================

function formatPostPage() {
	
	// Convert the timeline to a breadcrumb type thing
	var timeline = $('<div class="sjo-api-timeline"></div>').prependTo('.content .container');
	var items = $('.timeline_item div');
	items.each((index, element) => {
		var item = $(element);
		var text = item.find('strong').text().replace(/"|\.$/g, '');
		$('<div class="sjo-api-timeline-item"></div>')
			.text(text)
			.addClass(index == items.length - 1 ? '' : 'sjo-api-timeline-arrow')
			.addClass('sjo-api-timeline-' + item.attr('class'))
			.css({'zIndex': 99 - index})
			.appendTo(timeline);
	});
	items.closest('.columns').hide();
	
}

// ================================================================
// Format a candidate page
// ================================================================

function formatCandidatePage() {
	
	var labelMappings = {
		'Statement to voters':							'Statement',
		'Twitter username (e.g. democlub)': 			'Twitter',
		'Facebook profile URL': 						'FB profile',
		'Facebook page (e.g. for their campaign)': 		'FB page',
		'Homepage URL': 								'Homepage',
		'Wikipedia URL': 								'Wikipedia',
		'LinkedIn URL': 								'LinkedIn',
		"The party's candidate page for this person": 	'Party page',
	};
	
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
				
				// Format fields
				if (headingText != 'Candidacies:') {
					dt.addClass('sjo-list-dt');
					dd.addClass('sjo-list-dd');
					dd.nextUntil('dt', 'dd').addClass('sjo-list-dd');
				}
				
				// Trim labels
				if (labelMappings[dt.text()]) dt.text(labelMappings[dt.text()]);
				
				// Remove duplicate votes
				var result = {'votes': null, 'elected': null};
				$('.vote-count', dd).each((index, element) => {
					var votesSpan = $(element);
					votesSpan.next('br').hide();
					var electedSpan = votesSpan.prev('.candidate-result-confirmed');
					if (votesSpan.text() == result.votes && electedSpan.text() == result.elected) {
						votesSpan.hide();
						electedSpan.hide().prev('br').hide();
					} else {
						result.votes = votesSpan.text();
						result.elected = electedSpan.text();
					}
				});
				
			}
			
			// Previous versions
			if (section.hasClass('version')) {
				if (dtText.indexOf('Changes made') === 0) {
					
					// Format diff
					formatVersionChanges(dd);
					//dd.hide();
					
				} else {
					
					// Format version header
					dt.addClass('sjo-list-dt');
					dd.addClass('sjo-list-dd');
					if (dtText == 'Source') {
						dd.html(formatLinks(dd.html()));
					}
					
					// Hide reversion button to prevent accidental clicking
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
	
	// Remove blah
	//$('.person__actions__edit h2').filter((i, e) => e.innerHTML.trim() == 'Improve this data!').hide();
	$('.person__actions__edit p').filter((i, e) => e.innerHTML.trim() == 'Our database is built by people like you.').hide();
	$('.person__actions__edit p').filter((i, e) => e.innerHTML.trim() == 'Please do add extra details about this candidate – it only takes a moment.').hide();
	$('.person__actions__data p').filter((i, e) => e.innerHTML.trim() == 'Open data JSON API:').hide();
	$('.person__actions__data p').filter((i, e) => e.innerHTML.trim() == 'More details about getting <a href="/help/api">the data</a> and <a href="/help/about">its licence</a>.').hide();
	
	// Add upload link if not present
	if ($('.person__actions__photo').length === 0) {
		console.log(location.href);
		var candidateIdMatch = location.href.match(/\/person\/(\d+)/);
		if (candidateIdMatch) {
			var candidateName = $('.person__hero h1').text();
			$(`<div class="person__actions__action person__actions__photo">
				<h2>Trying to upload a photo?</h2>
				<p>There's a separate page for <a href="/moderation/photo/upload/${candidateIdMatch[1]}">uploading a photo of ${candidateName}</a>.</p>
				</div>`).insertAfter('.person__actions__edit');
		}
	}
	
	// Build version tree
	reparseVersions();
	
}

function formatVersionChanges(dd) {
	
	// Create table for version changes
	var versionTable = $('<table class="sjo-version"></table>').prependTo(dd);
	
	// Reformat version changes as a table
	// TODO: sort fields into input order
	// TODO: indicate recent versions
	var diffsPara = dd.find('.version-diff');
	diffsPara.find('span').each(function(index, element) {
		
		var span = $(element);
		var spanText = span.text().replace(/\n|\r/g, ' ');
		var oldText = '', newText = '';
		var fieldName = null;
		
		// Data added
		if (span.hasClass('version-op-add')) {
			var matchAdd = spanText.match(/^Added: (.+) => ["\[\{]([\s\S]*)["\]\}]$/);
			if (matchAdd) [, fieldName, newText] = matchAdd;
			
		// Data replaced
		} else if (span.hasClass('version-op-replace')) {
			var matchReplace = spanText.match(/^At (.+) replaced ["\[\{](.*)["\]\}] with ["\[\{](.*)["\]\}]$/);
			if (matchReplace) [, fieldName, oldText, newText] = matchReplace;
			
		// Data removed
		} else if (span.hasClass('version-op-remove')) {
			var matchDelete = spanText.match(/^Removed: (.+) \(previously it was ["\[\{](.*)["\]\}]\)$/); // TODO: null
			if (matchDelete) [, fieldName, oldText] = matchDelete;
			
		}
		
		// Add to table
		if (fieldName) addChangeRow(fieldName, oldText, newText, span);
		
	});
	
	// TODO: apply widths using colgroups
	function addChangeRow(fieldName, dataFrom, dataTo, original) {
		
		if (dataFrom.length > 0 || dataTo.length > 0) {
			
			// Add a row to the diff table
			var row = $('<tr></tr>').addHeader(fieldName.replace(/\//g, ' \u203A ')).appendTo(versionTable);
			
			if (fieldName == 'biography' && dataFrom && dataTo) {
				
				// Add highlighted diffs for biographies
				var diffMarkup = diffString(dataFrom, dataTo);
				row.addCell('-', 'sjo-version-delete sjo-version-op')
				   .addCellHTML(cleanData(diffMarkup), 'sjo-version-delete')
				   .addCell('-', 'sjo-version-add sjo-version-op')
				   .addCellHTML(cleanData(diffMarkup), 'sjo-version-add');
				  
			} else {
				
				// Deleted value
				if (dataFrom.length > 0) {
					row.addCell('-', 'sjo-version-delete sjo-version-op')
					   .addCellHTML(cleanData(dataFrom), 'sjo-version-delete');
				} else {
					row.addCell('', 'sjo-version-op').addCell('');
				}
				
				// New value
				if (dataTo.length > 0) {
					row.addCell('-', 'sjo-version-add sjo-version-op')
					   .addCellHTML(cleanData(dataTo), 'sjo-version-add');
				} else {
					row.addCell('', 'sjo-version-op').addCell('');
				}
				
			}
			
		}
		
		// Remove original diff
		original.next('br').remove();
		original.remove();
		
	}
	
	function cleanData(data) {
		return data.replace(/\\"/g, '"').replace(/\\r\\n/g, '<br>');
	}
	
}

function reparseVersions() {
	
	// Group versions by ID
	var versionData = [];
	var editsPerYear = [];
	$('.full-version-json').each((index, element) => {
		
		// Parse and flatten version JSON
		var version = JSON.parse(element.innerText);
		version = flattenObject(version);
		
		// Add version header
		var div = $(element).closest('.version');
		var header = div.find('dt').toArray().reduce((obj, el) => {
			obj[el.innerText] = $(el).next('dd').text().trim();
			return obj;
		}, {});
		version._version_id = header['Version'].split(' ')[0];
		version._username   = header['Username'];
		version._timestamp  = header['Timestamp'];
		version._source     = header['Source'];
		div.data({'sjo-version': version._version_id, 'sjo-person': version.id});
		
		// Add to list of versions
		versionData.push(version);
		
		// Count number of edits per year
		var year = version._timestamp.substr(0, 4);
		if (!editsPerYear[year]) editsPerYear[year] = 0;
		editsPerYear[year]++;
		
	});
	
	// Sort versions
	if (versionData.length === 0) return;
	versionData.sort((a, b) => a._timestamp > b._timestamp);
	console.log('reparseVersions', versionData, editsPerYear);
	
	// Create version tree table
	var headerCellsHtml = editsPerYear.map((num, year) => 
		num == 1 ? `<th></th><th>${year}</th>` : 
		num ? `<th></th><th class="sjo-tree-year" colspan="${num * 2 - 1}"><span class="sjo-tree-year-inner">${year}</span></th>` : '');
	var treeTable = $('<table class="sjo-tree"></table>')
		.insertAfter('#sjo-section-versions')
		.append('<thead><tr>' + headerCellsHtml.join('') + '</tr></thead>');
	
	// Build version tree
	var stack = [];
	stack.push({'id': versionData[versionData.length - 1].id});
	while (stack.length > 0) {
		
		// Write a new table row
		var currentId = stack.pop();
		var treeRow = $(`<tr><th>${currentId.id}</th>` + '<td></td>'.repeat(versionData.length * 2 - 1) + '</tr>').appendTo(treeTable);
		var treeRowCells = treeRow.find('td');
		
		var minColNo = null, maxColNo = null, colNo = null;
		var versionWritten = null;
		for (var sequenceNo = versionData.length - 1; sequenceNo >= 0; sequenceNo--) {
			if (versionData[sequenceNo].id == currentId.id) {
				
				// Write this version to the tree
				// TODO: display different icons for different actions, e.g. add/remove candidacy
				colNo = sequenceNo * 2;
				$(`<a class="sjo-tree-version">${versionData[sequenceNo]._version_id.substr(0, 4)}</a>`)
					.data('sjo-tree-version', versionData[sequenceNo]._version_id)
					.appendTo(treeRowCells.eq(sequenceNo * 2));
				
				// Keep track of first and last versions for this ID
				if (!minColNo || colNo < minColNo) minColNo = colNo;
				if (!maxColNo || colNo > maxColNo) maxColNo = colNo;
				
				// Join to next version
				if (versionWritten) versionWritten._prev_version = versionData[sequenceNo];
				versionWritten = versionData[sequenceNo];
				
				// If this is a merge, add the merged ID to the stack
				var sourceMatch = versionData[sequenceNo]._source.match(/^After merging person (\d+)$/);
				if (sourceMatch) {
					stack.push({'id': sourceMatch[1], 'mergeColNo': colNo - 1});
				}
				
			}
		}
		
		// Add the joining lines
		treeRowCells.filter(`:lt(${maxColNo}):gt(${minColNo})`).filter((index, element) => element.innerHTML == '').addClass('sjo-tree-horiz');
		if (maxColNo < versionData.length * 2 - 1) {
			treeRowCells.filter(`:lt(${currentId.mergeColNo}):gt(${maxColNo})`).addClass('sjo-tree-horiz');
			treeRowCells.eq(currentId.mergeColNo).addClass('sjo-tree-turnup');
			var treeRows = treeTable.find('tbody tr');
			for (var joinRow = treeRows.length - 2; joinRow >= 0; joinRow--) {
				var joinCell = treeRows.eq(joinRow).find('td').eq(currentId.mergeColNo);
				if (joinCell.hasClass('sjo-tree-horiz')) {
					joinCell.removeClass('sjo-tree-horiz').addClass('sjo-tree-mergein');
					break;
				} else {
					joinCell.removeClass('sjo-tree-horiz').addClass('sjo-tree-vert');
				}
			}
		}
		
	}
	
	// Button to show all versions
	var allVersions = $('.version');
	$('<a id="sjo-versions-showall">Show all versions</a>').insertAfter('.sjo-tree').hide().click((event) => {
		allVersions.show();
		$('#sjo-versions-showall').hide();
		$('.sjo-tree-current').removeClass('sjo-tree-current');
	});
	
	// Show selected version
	// TODO: stop the page jumping
	$('.sjo-tree').on('click', '.sjo-tree-version', event => {
		var button = $(event.target);
		var versionId = button.data('sjo-tree-version');
		var selectedVersion = allVersions.filter((index, element) => $(element).data('sjo-version') == versionId).show();
		allVersions.not(selectedVersion).hide();
		$('#sjo-versions-showall').show();
		$('.sjo-tree-current').removeClass('sjo-tree-current');
		button.addClass('sjo-tree-current');
	});
	
	return;
	
	// For each ID, recompute diffs
	// TODO: ignore some fields (e.g. Twitter ID)
	// TODO: allow semantic null for some fields (e.g. standing/not standing)
	$.each(versionData, (index, version) => {
		
		// Recompute diff
		// TODO: this should be rendered obsolete by https://github.com/DemocracyClub/yournextrepresentative/pull/154
		var diff = {};
		$.each(version, (key, newValue) => {
			if (key.substr(0, 1) == '_') return;
			var oldValue = version._prev_version ? version._prev_version[key] : null;
			if (isNullish(oldValue) && !isNullish(newValue)) {
				// added
				diff[key] = {'action': 'add', 'new': newValue};
			} else if (!isNullish(oldValue) && isNullish(newValue)) {
				// deleted
				//diff[key] = {'action': 'delete', 'old': oldValue};
			} else if (!isNullish(oldValue) && !isNullish(newValue) && oldValue != newValue) {
				// changed
				diff[key] = {'action': 'change', 'old': oldValue, 'new': newValue};
			}
		});
		
		// Include deleted fields
		if (version._prev_version) {
			$.each(version._prev_version, (key, oldValue) => {
				if (key.substr(0, 1) == '_') return;
				var newValue = version[key];
				if (!isNullish(oldValue) && isNullish(newValue)) {
					// deleted
					diff[key] = {'action': 'delete', 'old': oldValue};
				}
			});
		}
		
		// Write diff as table
		var div = allVersions.filter((index, element) => $(element).data('sjo-version') == version._version_id);
		var versionTable = $('<table class="sjo-version"></table>').appendTo(div);
		$.each(diff, (key, value) => {
			addChangeRow(versionTable, key, value['old'], value['new']);
		});
		
	});
	
	// TODO: apply widths using colgroups
	function addChangeRow(table, fieldName, dataFrom, dataTo) {
		if ((dataFrom && dataFrom.length > 0) || (dataTo && dataTo.length > 0)) {
			var row = $('<tr></tr>').addHeader(fieldName.replace(/\//g, ' \u203A ')).appendTo(table);
			
			if (dataFrom && dataFrom.length > 0) {
				row.addCell('-', 'sjo-version-delete sjo-version-op').addCell(dataFrom, 'sjo-version-delete');
			} else {
				row.addCell('', 'sjo-version-op').addCell('');
			}
			
			if (dataTo && dataTo.length > 0) {
				row.addCell('-', 'sjo-version-add sjo-version-op').addCell(dataTo, 'sjo-version-add');
			} else {
				row.addCell('', 'sjo-version-op').addCell('');
			}
			
			
		}
	}
	
	// TODO: empty arays and objects are nullish
	function isNullish(value) {return !value || (Array.isArray(value) && value.length == 0);}
	
}

// http://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-json-objects
function flattenObject(data) {

	var result = {};

	function recurse (cur, prop) {

		if (Object(cur) !== cur) {
			result[prop] = cur;
		} else if (Array.isArray(cur)) {
			for (var i = 0, l = cur.length; i < l; i++) {
				recurse(cur[i], prop + "[" + i + "]");
			}
			if (l == 0) result[prop] = [];
		} else {
			var isEmpty = true;
			for (var p in cur) {
				isEmpty = false;
				recurse(cur[p], prop ? prop + '/' + p : p);
			}
			if (isEmpty && prop) result[prop] = {};
		}

	}

	recurse(data, '');
	return result;

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
			var electionName = button.text().trim().match(/^Add .+? to the (\d{4} )?(The |Mayor of |City of |City and County of |Council of the |Comhairle nan )?(.+?)(( County| County Borough| Metropolitan Borough| City)? Council| Combined Authority)?( (local|mayoral) election)?$/)[3];
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
	if (localList.find('p').length === 0) localList.add(localHeading).hide();
	
	// Store button ID when clicked
	// TODO: use native DOM Storage API for this
	$('body').on('click', '.sjo-addperson-listitem', event => localStorage.setItem('sjo-addperson-button', $(event.target).closest('.sjo-addperson-listitem').attr('id')));
	
	// Retrieve button ID on load
	var lastButtonID = localStorage.getItem('sjo-addperson-button');
	console.log(lastButtonID);
	if (lastButtonID) $(`[id="${lastButtonID}"]`).addClass('sjo-addperson-latest');
	
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
	$('body').on('change', '#add_more_elections', electionChanged);
	
	function electionChanged(event) {
		var slug = event.target.value;
		console.log('electionChanged', slug);
		
		// Update saved election
		localStorage.setItem('sjo-addperson-button', 'sjo-addperson-listitem-' + slug.replace(/\./g, '_'));
		
		// Wait for form to load
		if (!refreshTimer) {
			refreshTimer = setInterval(checkFieldsLoaded, 0);
		}
		
		// Check if fields have loaded
		function checkFieldsLoaded() {
			console.log('checkFieldsLoaded', slug);
			if ($(`[id="id_standing_${slug}"]`).length > 0) {
				clearInterval(refreshTimer);
				refreshTimer = null;
				$.each(electionFields, (key, value) => formatField(key, value, slug));
			}
		}
		
	}
	
	// Format an input field
	function formatField(id, labelText, slug) {
		if (slug) id = id.replace('{slug}', slug);
		console.log('formatField', id, labelText, slug);
		
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
			formatPartySelects(input);
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
		
		console.log('renderPostCandidates', electionID, postID, postName, data);
		var block = $('#sjo-post-candidates-' + electionID.replace(/\./g, '_'));
		if (block.length === 0) {
			block = $('<div class="person__actions__action sjo-post-candidates" id="sjo-post-candidates-' + electionID.replace(/\./g, '_') + '"></div>').appendTo('.person__actions');
		}
		block.append(`<h2>Current candidates for ${postName}</h2>`);
		
		var candidates = $.grep(data.memberships, member => member.election.id == electionID);
		if (candidates.length === 0) {
			block.append('<p>There are currently no candidates for this post</p>');
		} else {
			var match = location.href.match(/\/person\/(\d+)\//);
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
// Bulk adding pages
// ================================================================

function formatPartySelects(selector) {
	
	var selects = $(selector);
	var html = selects.eq(0).html();
	html = html.replace(/\((\d+) candidates\)/g, '[$1]');
	if (knownPartiesOnly) {
		html = html.replace(/<optgroup label="(.*?)">[^<]+(<option value="\d+">)[^<]+(<\/option>)[\s\S]*?<\/optgroup>/g, '$2$1$3');
		html = html.replace(/<option value="\d+">[^<\[\]]+<\/option>/g, '');
	}
	selects.html(html);

}

function formatBulkAddPage() {
	
	// TODO: allow party dropdowns to be deselected
	
	// Trim party selection
	// TODO: make this a function
	// TODO: allow deleted parties to be re-added
	formatPartySelects('.party-select');
	
	// Add a checkbox for reversed names
	// TODO: add this to other edit pages
	$('<input type="checkbox" id="sjo-reverse" value="reverse" checked><label for="sjo-reverse">Surname first</label>').insertBefore('#bulk_add_form').wrapAll('<div></div>');
	
	// Hide noobstructions
	var heading = $('h3:contains("How to add or check candidates")');
	heading.next('ol').addClass('sjo-bulkadd-instructions').hide();
	$('<a role="button" style="font-size: small;">Show</a>').click(event => $('.sjo-bulkadd-instructions').toggle()).appendTo(heading).before(' ');
	
}

function formatBulkAddReviewPage() {
	
	$('form h2').each(addSearchLink);
	
	$('form input[type="radio"]').each(lookupBulkAddData);
	
	function addSearchLink(index, element) {
		var nameMatch = element.innerText.trim().match(/^Candidate:\s+(\S+)\s+((.+)\s+)?(\S+)$/);
		console.log('addSearchLink', index, element, nameMatch);
		if (nameMatch && nameMatch[3]) {
			var fullName = nameMatch[1] + ' ' + nameMatch[3] + ' ' + nameMatch[4];
			var shortName = nameMatch[1] + ' ' + nameMatch[4];
			element.innerHTML = 'Candidate: <a href="https://candidates.democracyclub.org.uk/search?q=' + encodeURIComponent(shortName) + '" target="_blank">' + fullName + '</a>';
		}
	}
	
	function lookupBulkAddData(index, element) {
		
		// Get ID of matching person
		var input = $(element);
		var link = input.closest('label').addClass('sjo-bulkadd-listitem').find('a').addClass('sjo-bulkadd-link');
		if (link.length > 0) link.html(link.html().replace(/\(previously stood in .*? candidate\)/, ''));
		var personID = input.val();
		if (personID == '_new') return;
		
		// Call API
		$.getJSON(`/api/v0.9/persons/${personID}/`, data => renderBulkAddData(input, data));

	}
	
	function renderBulkAddData(input, data) {
		input.closest('label')
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

function formatResultsPostList() {
	
	$('.content .columns h3').each((index, element) => {
		var heading = $(element);
		heading.closest('div').find('a').after(' ' + element.innerText);
		heading.hide();
	});
	
}

function formatResultsPage() {
	
	$('input[id^=id_memberships], #id_num_turnout_reported, #id_num_spoilt_ballots')
		.addClass('sjo-results-num')
		.prev('label')
		.addClass('sjo-results-label')
		.unwrap();
	
	// Check total
	$('body').on('input', '.sjo-results-num', validateResults);
	
	function validateResults() {
		
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
			console.log('sum of votes', sumTotal, 'difference', sumTotal - enteredTotal);
		}
		
	}
	
	// Paste values
	$('<textarea id="sjo-results-paste"></textarea>').insertAfter('.container h1:first-of-type').on('paste', parsePastedResults);
	
	// TODO: add a checkbox to remember the source for next time
	//$('#id_source').val('http://gis.worcestershire.gov.uk/website/Elections/result2017.aspx');
	
	function parsePastedResults(event) {
		console.log(event);
		
		var text = event.originalEvent.clipboardData.getData('text');
		console.log(text);
		
		$('.sjo-results-label').each((index, element) => {
			var label = $(element);
			var input = label.next('.sjo-results-num');
			var name = label.text().match(/^(.*?)\s+\(/)[1];
			var regex = new RegExp(name + '\\s+([^0-9]+\\s+)?(\\d+)', 'i');
			var votesMatch = text.match(regex);
			console.log(name, regex, votesMatch);
			if (votesMatch) {
				input.val(votesMatch[2]);
			}
		});
		
		validateResults();
		
	}
	
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
		
		// Add links
		var sourceCell = cells.eq(headings['Information source']);
		sourceCell.html(formatLinks(sourceCell.html(), maxUrlLength));
		
		// Highlight my changes
		if (cells.eq(headings['User']).text() == username) {
			row.addClass('sjo-mychanges');
		}
		
		// Highlight important changes
		row.addClass('sjo-changes-' + cells.eq(headings['Action']).text());
		
	});
	
}

// ================================================================
// Reformat lock suggestions page
// ================================================================

function formatLockSuggestions() {
	
	// Highlight my lock suggestions
	$('.container li').filter((index, element) => element.innerText.indexOf('User sjorford suggested locking this') >= 0).addClass('sjo-mysuggestion');
	
	// Group by election and sort
	var headings = $('.content h3');
	var elections = headings.toArray().map(element => $('a', element).attr('href').match(/election\/(.*?)\.\d{4}-\d{2}-\d{2}\//)[1]).sort();
	$.each(elections, (index, electionId) => {
		if (index != elections.indexOf(electionId)) return;
		var newHeading = $('<h2></h2>').text(electionId).appendTo('.content .container');
		var headingsGroup = headings.filter(':has(a[href*="/' + electionId + '."])').toArray().sort((a, b) => a.innerText < b.innerText);
		$.each(headingsGroup, (index, element) => $(element).next('ul').addBack().insertAfter(newHeading));
	});
	
}

// ================================================================
// Reformat statistics
// ================================================================

function formatStatistics() {
	
	$('.statistics-elections').each(function(index, element) {
		console.log(element);
		
		var table = $('<table class="sjo-stats"></table>')
			.appendTo(element)
			.click(function(event) {
				if (event.target.tagName == 'A') return;
				table.selectRange();
			});
		
		$('div', element).each(function(index, element) {
			
			var div = $(element);
			//console.log(div);
			
			var matchId = element.id.match(/^statistics-election-((parl|sp|naw|nia|gla|mayor|pcc|local)(-(a|r|c))?(-([-a-z]{2,}))?)-(\d{4}-\d{2}-\d{2})$/);
			//console.log(element.id, matchId);
			
			var headerText = div.find('h4').text();
			var matchHeader = headerText.match(/^Statistics for the (\d{4} )?(.+?)( (local|Mayoral))?( [Ee]lection|by-election: (.*) (ward|constituency))?( \((.+)\))?$/, '');
			//console.log(headerText, matchHeader);
			
			if (matchId && matchHeader) {
				//console.log(matchId, matchHeader);
				
				var key = matchId[2] + (matchId[3] ? '.' + matchId[4] : '') + (matchId[5] ? '.' + matchId[6] : '');
				var type = matchId[2];
				var date = matchId[7];
				var area = matchHeader[2] + (matchHeader[8] ? matchHeader[8] : '');
				//console.log(key, type, date, area);
				
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
					.addCell(date)
					.addCell(key)
					.addCell(area)
					.addCell(candidates, 'sjo-num');
				
				bullets.each(function(index, element) {
					var bullet = $(element);
					var link = bullet.find('a');
					if (link.length > 0) {
						link.html(link.html()
							.replace(/^Candidates per /, 'by ')
							.replace(/^See progress towards locking all posts$/, 'progress'));
						$('<td class="sjo-nowrap"></td>').append(link).appendTo(row);
						bullet.addClass('sjo-remove');
					} else if (bullet.text().indexOf(':') >= 0) {
						row.addCell(bullet.text().split(':')[1].trim(), 'sjo-num');
						bullet.addClass('sjo-remove');
					}
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
// TODO: fix entries like "JOHN SMITH"?
function cleanInputValue(input) {
	console.log('cleanInputValue', input);
	
	// Trim all values
	var value = input.value.trim().replace(/\s+/g, ' ');
	
	// Reformat names
	// TODO: handle hyphens properly
	if (input.name == 'q' || input.id == 'id_name' || input.id.match(/^id_form-\d+-name$/)) {
		var match = value.match(/^(([-'A-Z]{3,})(\s*,)?)\s+(.*)$/);
		if (match) {
			value = match[4] + ' ' + match[2][0] + match[2].slice(1).toLowerCase();
		} else {
			match = value.match(/^([^,]+),\s+(.+)$/);
			if (match) {
				value = match[2] + ' ' + match[1];
			} else if ($('#sjo-reverse').is(':checked')) {
				match = value.match(/^(\S+)\s+(\S.*)$/);
				if (match) {
					value = match[2] + ' ' + match[1];
				}
			}
		}
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

if (!String.prototype.fullTrim) {
	String.prototype.fullTrim = function() {
		return this.trim().replace(/(\s|\n|\r)+/g, ' ');
	};
}

// Difference of two strings
// https://johnresig.com/projects/javascript-diff-algorithm/
function diffString( o, n ) {
  
  function escape(s) {
    var n = s;
    n = n.replace(/&/g, "&amp;");
    n = n.replace(/</g, "&lt;");
    n = n.replace(/>/g, "&gt;");
    n = n.replace(/"/g, "&quot;");

    return n;
}
  
  function diff( o, n ) {
  var ns = new Object();
  var os = new Object();
  
  for ( var i = 0; i < n.length; i++ ) {
    if ( ns[ n[i] ] == null )
      ns[ n[i] ] = { rows: new Array(), o: null };
    ns[ n[i] ].rows.push( i );
  }
  
  for ( var i = 0; i < o.length; i++ ) {
    if ( os[ o[i] ] == null )
      os[ o[i] ] = { rows: new Array(), n: null };
    os[ o[i] ].rows.push( i );
  }
  
  for ( var i in ns ) {
    if ( ns[i].rows.length == 1 && typeof(os[i]) != "undefined" && os[i].rows.length == 1 ) {
      n[ ns[i].rows[0] ] = { text: n[ ns[i].rows[0] ], row: os[i].rows[0] };
      o[ os[i].rows[0] ] = { text: o[ os[i].rows[0] ], row: ns[i].rows[0] };
    }
  }
  
  for ( var i = 0; i < n.length - 1; i++ ) {
    if ( n[i].text != null && n[i+1].text == null && n[i].row + 1 < o.length && o[ n[i].row + 1 ].text == null && 
         n[i+1] == o[ n[i].row + 1 ] ) {
      n[i+1] = { text: n[i+1], row: n[i].row + 1 };
      o[n[i].row+1] = { text: o[n[i].row+1], row: i + 1 };
    }
  }
  
  for ( var i = n.length - 1; i > 0; i-- ) {
    if ( n[i].text != null && n[i-1].text == null && n[i].row > 0 && o[ n[i].row - 1 ].text == null && 
         n[i-1] == o[ n[i].row - 1 ] ) {
      n[i-1] = { text: n[i-1], row: n[i].row - 1 };
      o[n[i].row-1] = { text: o[n[i].row-1], row: i - 1 };
    }
  }
  
  return { o: o, n: n };
}
  
  
  o = o.replace(/\s+$/, '');
  n = n.replace(/\s+$/, '');

  var out = diff(o == "" ? [] : o.split(/\s+/), n == "" ? [] : n.split(/\s+/) );
  var str = "";

  var oSpace = o.match(/\s+/g);
  if (oSpace == null) {
    oSpace = ["\n"];
  } else {
    oSpace.push("\n");
  }
  var nSpace = n.match(/\s+/g);
  if (nSpace == null) {
    nSpace = ["\n"];
  } else {
    nSpace.push("\n");
  }

  if (out.n.length == 0) {
      for (var i = 0; i < out.o.length; i++) {
        str += '<del>' + escape(out.o[i]) + oSpace[i] + "</del>";
      }
  } else {
    if (out.n[0].text == null) {
      for (n = 0; n < out.o.length && out.o[n].text == null; n++) {
        str += '<del>' + escape(out.o[n]) + oSpace[n] + "</del>";
      }
    }

    for ( var i = 0; i < out.n.length; i++ ) {
      if (out.n[i].text == null) {
        str += '<ins>' + escape(out.n[i]) + nSpace[i] + "</ins>";
      } else {
        var pre = "";

        for (n = out.n[i].row + 1; n < out.o.length && out.o[n].text == null; n++ ) {
          pre += '<del>' + escape(out.o[n]) + oSpace[n] + "</del>";
        }
        str += " " + out.n[i].text + nSpace[i] + pre;
      }
    }
  }
  
  // sjorford
  str = str.replace(/<\/ins><ins>/g, '');
  
  return str;
}
