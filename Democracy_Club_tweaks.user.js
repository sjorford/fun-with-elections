// ==UserScript==
// @name        Democracy Club tweaks
// @namespace   sjorford@gmail.com
// @include     https://candidates.democracyclub.org.uk/*
// @version     2017-02-28
// @grant       unsafeWindow
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.12.0/moment.min.js
// ==/UserScript==

$(function() {
	
	var maxUrlLength = 50;
	
	$('<style id="sjo-style-tweaks">\
		.sjo-stats {font-size: 9pt;}\
		.sjo-stats td, .sjo-stats th, .sjo-lesspadding td, .sjo-lesspadding th {padding: 4px;}\
		.sjo-nowrap {white-space: nowrap;}\
		.sjo-mychanges {background-color: #ffeb99 !important;}\
		.sjo-number {text-align: right;}\
		.counts_table td, .counts_table th {padding: 4px !important;}\
		.select2-results {max-height: 500px !important;}\
		.form_group h3 {display: none !important;}\
		.form_group p {display: inline-block !important; vertical-align: top !important; width: 30% !important; padding-right: 1%;}\
		.version .button {padding: 2px 4px !important}\
		.sjo-list-dt, .sjo-list-dd {margin-bottom: 0px !important;}\
		.sjo-list-dt, .sjo-label {float: left; width: 125px;}\
		.sjo-list-dd::after {content: "\\a"; white-space: pre-line;}\
		.sjo-list-dd {overflow: hidden;}\
		.sjo-label {margin-top: 4px; margin-bottom: 0px;}\
		input.sjo-input {height: 2rem; padding: 0.25rem 0.5rem;}\
		input.sjo-input[type="url"] {width: 390px; display: inline-block;}\
		input.sjo-input[type="text"] {width: 390px; display: inline-block;}\
		input.sjo-input[type="email"] {width: 390px; display: inline-block;}\
		input.sjo-input[type="number"] {width: 390px; display: inline-block;}\
		.sjo-formitem {margin-bottom: 6px !important;}\
		.sjo-formitem label {font-weight: bold;}\
		.sjo-formitem .standing-select {width: 390px !important; display: inline-block; height: 1.75rem; padding: 0px 8px; margin-bottom: 0;}\
		.sjo-formitem .select2-container {width: 390px !important; display: inline-block;}\
		.sjo-formitem hr {display: none;}\
		input.sjo-input-empty {background-color: #ffc;}\
		.sjo-input#id_twitter_username {width: 360px; margin-left: -4px; display: inline-block;}\
		.sjo-prefix {display: inline-block; width: 30px; position: relative; top: 1px; height: 2rem; line-height: 2rem;}\
		h2 {margin-top: 1em !important; margin-bottom: 0.25em !important; padding-bottom: 0.1em !important;}\
		h3 {font-size: 1.2rem;}\
		#add_election_button {margin-bottom: 0;}\
		.person__versions {padding-top: 0;}\
		.sjo-version {border: none !important;}\
		.sjo-version tr {background: transparent !important;}\
		.sjo-version td {padding: 0.25em 0.5em;}\
		.sjo-version th {padding: 0.25em 0.5em 0.25em 0; font-weight: normal;}\
		.sjo-version-delete {background-color: #fdd;}\
		.sjo-version-add {background-color: #dfd;}\
		.sjo-results-label {float: left; width: 50%; height: 1.5rem; padding-top: 7px;}\
		.sjo-results-num {width: 100px !important; margin-bottom: 5px !important; text-align: right; -moz-appearance: textfield !important;}\
		.sjo-total-error {background-color: #fbb !important;}\
		#id_source {max-height: 80px;}\
		.sjo-addperson-listitem {margin: 0; padding-bottom: 0.}\
		.sjo-addperson-listitem a {margin: 0 0.25em 0.25em 0; padding: 0.25em 0.5em;}\
		.sjo-addperson-listcolumns {column-width: 200px; -moz-column-width: 200px;}\
		.sjo-posts-listcolumns {column-width: 250px; -moz-column-width: 250px;}\
		.sjo-recent-unknown, .sjo-recent-unknown.sjo-mychanges {background-color: #daa !important;}\
	</style>').appendTo('head');
	
	// Add API link to header
	$('<li class="nav-links__item"><a href="/help/api">API</a></li>').appendTo('.header__nav .nav-links');
	
	// ================================================================
	// List of posts
	// ================================================================
	
	if (window.location.href.indexOf('https://candidates.democracyclub.org.uk/posts') == 0) {
		var lists = $('.container ul:has(li+li+li+li+li)').addClass('sjo-posts-listcolumns');
		lists.find('a:contains("Member of the Legislative Assembly for")')
			.each((index, li) => li.innerHTML = li.innerHTML.replace(/^Member of the Legislative Assembly for /, ''));
	}
		
	// ================================================================
	// Candidate page
	// ================================================================
	
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
				// TODO: use the same mappings as in the edit section?
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
			
			// Previous versions
			if (section.hasClass('version')) {
				if (dtText == 'Changes made') {
					
					// Reformat version changes as a table
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
										.append('<th>' + matchAdd[1] + '</th>')
										.append('<td colspan="2"></td>')
										.append('<td class="sjo-version-add sjo-version-op">+</td>')
										.append('<td class="sjo-version-add">' + matchAdd[2] + '</td>')
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
									.append('<th>' + matchReplace[1] + '</th>')
									.append('<td class="sjo-version-delete sjo-version-op">-</td>')
									.append('<td class="sjo-version-delete">' + matchReplace[2] + '</td>')
									.append('<td class="sjo-version-add sjo-version-op">+</td>')
									.append('<td class="sjo-version-add">' + matchReplace[3] + '</td>')
									.appendTo(versionTable);
								span.next('br').remove();
								span.remove();
							}
							
						// Data removed
						} else if (span.hasClass('version-op-remove')) { // was -delete?
							var matchDelete = spanText.match(/^Removed: (.+) \(previously it was ["\[\{](.*)["\]\}]\)$/); // TODO: null
							if (matchDelete) {
								$('<tr></tr>')
									.append('<th>' + matchDelete[1] + '</th>')
									.append('<td class="sjo-version-delete sjo-version-op">-</td>')
									.append('<td class="sjo-version-delete">' + matchDelete[2] + '</td>')
									.append('<td colspan="2"></td>')
									.appendTo(versionTable);
								span.next('br').remove();
								span.remove();
							}
							
						}
						
					});
					
				} else {
					
					// Reformat data
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
	
	// ================================================================
	// Add a candidate
	// ================================================================
	
	if (window.location.href.indexOf('https://candidates.democracyclub.org.uk/person/create/select_election?') == 0) {
		
		$('[role=list]').each(function(index, element) {
			
			// Format list of buttons into columns
			var list = $(this);
			var listitems = list.find('[role=listitem]');
			if (listitems.length > 1) {
				list.addClass('sjo-addperson-listcolumns');
			}
			
			// Move election name out of button
			listitems.each(function(index, element) {
				var listitem = $(this).addClass('sjo-addperson-listitem');
				var button = $('a', listitem);
				var match = button.text().trim().match(/^Add .+? to the (The |City of |City and County of |Council of the |Comhairle nan )?(.+?)(( County| County Borough| Metropolitan Borough| City)? Council)?( local election)?$/);
				if (match) {
					var electionName = match[2] == 'London Corporation' ? 'City of London' : match[2];
					button.text('Add').after(' ' + electionName);
				}
			});
			
		});
		
	}
	
	// ================================================================
	// Edit a candidate
	// ================================================================
	
	var labelMappings = {
		'Title / pre-nominal honorific (e.g. Dr, Sir, etc.):': 	'Title:',
		'Full name:': 											'Name:',
		'Post-nominal letters (e.g. CBE, DSO, etc.):': 			'Honours:',
		'Email:': 												'Email:',
		'Add new election:': 									'Election:',
		'Standing in {election}:': 								'Standing:',
		'Constituency in {election}:': 							'Constituency:',
		'Post in the {election}:': 								'Post:',
		'Party in {election}:': 								'Party:',
		'Party in {election} (Great Britain):': 				'Party:',
		'Party in {election} (Northern Ireland):': 				'Party:',
		'Position in party list (\'1\' for first, \'2\' for second, etc.):': 
																'Position:',
		'Twitter username (e.g. democlub):': 					'Twitter:',
		'Facebook profile URL:': 								'FB profile:',
		'Facebook page (e.g. for their campaign):': 			'FB page:',
		'Homepage URL:': 										'Homepage:',
		'Wikipedia URL:': 										'Wikipedia:',
		'LinkedIn URL:': 										'LinkedIn:',
		'The party\'s candidate page for this person:': 		'Party page:',
		'Gender (e.g. \u201Cmale\u201D, \u201Cfemale\u201D):': 	'Gender:',
		'Date of birth (a four digit year or a full date):': 	'Date of birth:',
	};
	
	function formatForm() {
			
		// Pick up election name from subheading
		var electionName = $('#person-details h3').text();
		if (!electionName) {
			
			// Pick up election name from new candidacy field
			// TODO: what if there are two candidacy blocks?
			electionName = $('.add_more_elections_field .select2-chosen').text().replace(/ \(\d{4}-\d{2}-\d{2}\)$/, '');
				
			// Cancel the timer if the new fields have finished loading
			if (formRefreshTimer && electionName && $('.extra_elections_forms p').length > 0) {
				window.clearInterval(formRefreshTimer);
				formRefreshTimer = null;
			}
			
		}
			
		window.console.log('formatting form, election is ' + (electionName ? '[' + electionName + ']' : 'unknown'));
	
		$('.form-item, .extra_elections_forms p', '#person-details').each(function(index, element) {
			
			var formItem = $(element);
			var label = $('label', element).first();
			var input = $('input, .standing-select, .select2-container', element);
			
			var labelKey = label.text();
			if (electionName) labelKey = labelKey.replace(electionName, '{election}'); // TODO: this is kind of back to front
			//window.console.log(labelMappings[labelKey], labelKey, input);
			if (labelMappings[labelKey]) {
				
				formItem.addClass('sjo-formitem');
				label.text(labelMappings[labelKey]);
				label.addClass('sjo-label');
				input.addClass('sjo-input');
				if (input.val() == '') input.addClass('sjo-input-empty');
				$('.columns', element).addClass('sjo-form-columns');
				
				var prefix = $('.prefix', element);
				if (input.parent().hasClass('columns') && input.parent().parent().hasClass('row') && prefix && prefix.parent().hasClass('columns')) {
					prefix.unwrap().addClass('sjo-prefix');
					input.unwrap().unwrap();
				}
				
			}
			
		});
		
	}
	
	// Format form on load, and when new elections are added
	// TODO: selecting one election and then another fails to refresh the form properly
	// TODO: this unnecessarily [holy shit, that is a hard word to type] triggering on every dropdown
	// TODO: only trigger this on editable forms
	// TODO: trim "(20 candidates)" to just "(20)"
	formatForm();
	var formRefreshTimer;
	$('body').on('focusout', '.select2-input', function() {
		if (!formRefreshTimer) formRefreshTimer = window.setInterval(formatForm, 50);
	});
	
	var inputMappings = {
		'id_email': 				'email',
		'id_wikipedia_url': 		'Wikipedia',
		'id_twitter_username': 		'Twitter',
		'id_facebook_personal_url': 'Facebook',
		'id_facebook_page_url': 	'Facebook',
		'id_linkedin_url': 			'LinkedIn',
		'id_homepage_url': 			'homepage',
		'id_party_ppc_page_url': 	'party website',
	};
	
	var partyWebsiteMappings = {
		'http://www.welshconservatives.com/': 	'Welsh Conservatives',
		'http://www.scottishlabour.org.uk/': 	'Scottish Labour',
		'http://www.libdems.org.uk/': 			'Lib Dem',
		'http://www.scotlibdems.org.uk/': 		'Scottish Lib Dem',
		'http://www.snp.org/': 					'SNP',
		'http://www.mydup.com/': 				'DUP',
		'http://www.sdlp.ie/': 					'SDLP',
		'http://www.sinnfein.ie/': 				'Sinn F\u00E9in',
		'https://party.coop/': 					'Co-operative Party',
		'http://ukip.wales/': 					'UKIP Wales',
		'https://my.greenparty.org.uk/': 		'Green Party',
	};
	
	// Fill in source field automatically
	$('body').on('input', '.form-item input', function(event) {
		return; // *****
		
		// Read existing sources
		var sourceInput = $('#id_source');
		var sources = (sourceInput.val() == '' ? [] : sourceInput.val().split(', '));
		
		$('.form-item input').each(function(index, element) {
			
			var input = $(element);
			if (input.val() == '') return;
			var source = inputMappings[input.attr('id')];
			if (source && input.hasClass('sjo-input-empty')) {
				
				// Distinguish party websites
				if (source == 'party website') {
					var partyUrl = $('#id_party_ppc_page_url').val();
					$.each(partyWebsiteMappings, function(index, value) {
						if (partyUrl.indexOf(index) == 0) {
							source = value + ' website';
						}
					});
				}
				
				// Add new source to list
				if (sources.indexOf(source) < 0) {
					sources.push(source);
				}
				
			}
			
			// Cleanup Wikipedia brackets
			if (source == 'Wikipedia') {
				input.val(input.val().replace(/%28/g, '(').replace(/%29/g, ')'));
			}
			
		});
		
		// Write sources list back
		$('#id_source').val(sources.join(', '));
		
	});
	
	// ================================================================
	// Sort counts
	// ================================================================
	
	$('.counts_table').each(function(index, element) {
		
		var table = $(element);
		var headings = getTableHeadings(table);
		table.find('th').eq(headings['Number of Candidates']).html('Cand');
		
		var rows = table.find('tbody tr').each(function(index, element) {
			$('td', element).eq(headings['Number of Candidates']).addClass('sjo-number');
		}).sort(function(a, b) {
			return $(a).text().toLowerCase() > $(b).text().toLowerCase();
		}).appendTo(table);
		
		// Sort non-standing parties last
		if (headings['Party Name'] >= 0) {
			var blankRows = rows.filter('.no_known');
			if (blankRows.length > 100) {
				blankRows.appendTo(table);
			}
		}
		
	});
	
	// ================================================================
	// Party pages
	// ================================================================
	
	// Fix broken EC links
	$('.party__primary a[href^="http://search.electoralcommission.org.uk/"]').each(function(index, element) {
		window.console.log(index, element, element.href);
		element.href = element.href.replace(/electoral-commission:%20/, '');
	});
	
	// ================================================================
	// Reformat statistics
	// ================================================================
	
	$('.statistics-elections').each(function(index, element) {
		window.console.log(element);
		
		var table = $('<table class="sjo-stats"></table>')
			.appendTo(element)
			.click(function(event) {
				if (event.target.tagName == 'A') return;
				selectRange(table);
			});
		
		$('div', element).each(function(index, element) {
			
			var div = $(element);
			//window.console.log(div);

			var matchId = element.id.match(/^statistics-election-((parl|sp|naw|nia|gla|mayor|pcc|local)(-(a|r|c))?(-([-a-z]{2,}))?)-(\d{4}-\d{2}-\d{2})$/);
			window.console.log(element.id, matchId);
			
			var headerText = div.find('h4').text();
			var matchHeader = headerText.match(/^Statistics for the (\d{4} )?(.+?)( (local|Mayoral))?( [Ee]lection|by-election: (.*) (ward|constituency))?( \((.+)\))?$/, '');
			window.console.log(headerText, matchHeader);
			
			if (matchId && matchHeader) {
				window.console.log(matchId, matchHeader);
				
				var key = matchId[2] + (matchId[3] ? '.' + matchId[4] : '') + (matchId[5] ? '.' + matchId[6] : '');
				var type = matchId[2];
				var date = matchId[7];
				var area = matchHeader[2] + (matchHeader[8] ? matchHeader[8] : '');
				window.console.log(key, type, date, area);
				
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
	
	// ================================================================
	// Recent changes
	// ================================================================
	
	if (window.location.href.indexOf('https://candidates.democracyclub.org.uk/recent-changes') == 0) {
		
		var username = 'sjorford'; // TODO: get this from top of page?
		var now = moment();
		
		// Get table and headings
		var table = $('.container table').addClass('sjo-lesspadding');
		table.find('th').addClass('sjo-nowrap');
		var headings = getTableHeadings(table);
		
		table.find('tr').each(function(index, element) {
			var row = $(element);
			var cells = row.find('td');
			if (cells.length == 0) return;
			
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
	// Results
	// ================================================================
	
	if ($('h1:contains("Results")').length > 0) {
		
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
			if (totalCell.val() == '') return;
			var enteredTotal = parseInt(totalCell.val(), 10);
			
			// Sum all cells except total
			var sumTotal = $('.sjo-results-num').toArray().map(function(element, index) {
				var cell = $(element);
				return cell.prop('id') == 'id_num_turnout_reported' ? 0 : cell.val() == '' ? 0 : parseInt(cell.val(), 10);
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
	// General functions
	// ================================================================
	
	function formatLinks(html, maxLength) {
		return html.replace(/https?:\/\/[^\s]+/g, function(match) {
			return '<a href="' + match + '">' + (maxLength && match.length > maxLength ? (match.substr(0, maxLength) + '...') : match) + '</a>';
		});
	}
	
	function selectRange(element) {
		element = $(element).get(0);
		var range = document.createRange();
		range.selectNodeContents(element);
		var selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
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
	
});
