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
