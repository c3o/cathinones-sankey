// © 2025 Christopher Clay
// für das Drogeninformationszentrum (DIZ) der Stadt Zürich 

window.Caths = {};

Caths.lang = 'de';
Caths.s = {
	'de': {
		h1: 'Was war 2024 wirklich in „Mephi“?',
		mixVerbose: 'eine Mischung<br />verschiedener Cathinone',
		other: 'andere Substanzen',
		was: 'waren',
		wasMostly: 'waren<br />überwiegend',
		ofPresumed: 'der vermeintlichen',
		samplesWereActually: '-Proben waren<br />in Wirklichkeit',
		of: 'der',
		samplesWereCorrect: '-<br />Proben waren <span>korrekt</span>',
		ofSamples: 'der Proben',
		pure: 'pur',
		contaminated: 'davon verunreinigt',
		were: 'waren',
		supposed: 'wurde vermeintliches<br />',
		submitted: 'zum Test gebracht',
		cocaine: 'Kokain',
		caffeine: 'Koffein',
		none: 'keine',
		quoteStart: '„',
		quoteEnd: '“',
		as: 'Abgegeben als...',
		is: 'Testergebnis',
	},
	'en': {
		h1: 'What was really in “mephedrone” in 2024?',
		mixVerbose: 'a mixture of<br />different cathinones',
		other: 'other substances',
		was: 'were',
		wasMostly: '<br />were primarily',
		ofPresumed: 'of presumed',
		samplesWereActually: ' samples were<br />actually',
		of: 'of',
		samplesWereCorrect: '<br />samples were <span>correct</span>',
		ofSamples: 'of the samples',
		pure: 'pure',
		contaminated: 'of them contaminated',
		were: 'were',
		supposed: 'samples submitted as<br />supposed ',
		submitted: '',
		quoteStart: '“',
		quoteEnd: '”',
		as: 'Submitted as...',
		is: 'Test results',
		subst: {
			'Dimethylpentylon': 'Dimethylpentylone',
			'Amphetamin': 'Amphetamine',
			'Methamphetamin': 'Methamphetamine',
			'Koffein': 'Caffeine',
			'Ketamin': 'Ketamine',
			'Kokain': 'Cocaine',
			'Lidocain': 'Lidocaine',
			'keine': 'none',
		},
	},
}

Caths.const = {
	font: '"Helvetica Neue LT Std", "Helvetica Neue", InterVariable, Inter, sans-serif',
	colors: {
		'default': '#666670',
		'defaultLink': '#A0AFC350',
		'2-MMC': '#CC3399',
		'3-MMC': '#3399CC',
		'3-CMC': '#5040E6',
		'4-MMC': '#CCAA33',
		'4-CMC': '#BB6633',
		'Dimethylpentylon': '#33CC66',
		'etc': '#999999',
		'mix': '#666670',
	},
	//size: { width: 900, height: 475 }, // responsive
	baseElId: 'caths',
	plotElId: 'caths-plot',
	exportElId: 'caths-export',
	tapPopupElId: 'caths-tappopup',
	breakpoint: 750,
	substCleanup: [
		['glossary/cathinone', 'Mix'],
		['Mephedron', '4-MMC'],
		['-MeMC', '-MMC'],
		['-Me-MC', '-MMC'],
		[/ .*$/, ''],  // parenthesis / [deprecated]
		[/\*.*$/, ''], // *HCl
		['Cocain', 'Kokain'],
		['Coffein', 'Koffein'],
		['Kein', 'keine'],
	],
	substIrrelevant: [
		'iso',		// zB "iso-3-mmc" Syntheseverunr.
		'ynthese',	// "Syntheseverunreinigung"
		'div.', 	// "div. Syntheseverunreinigungen"
		'nbekannt', // "unbekannte Substanz"
	],
	substCathinones: [
		'Koffein', 	// honorary cathinone – comparatively irrelevant adulterant, even when lots of it
		'MMC',
		'CMC',
		'pentylon',
		'α',		// TODO separate as Monkey Dust and enforce showing?
	],
	substEtc: [		// count as etc, do not show separately
		'Ketamin',
		'Pregabalin',
		'Lidocain',
		'keine'
	],
	substNeverEtcIds: [
		'etc', 		// prevent circular ("only 1 etc? put it in etc!")
		'3mmc',
		'4mmc'
	],
	substRCIds: [
		'2mmc?',
		'3cmc?',
		'4cmc?',
	],	
};
Caths.sankey = {
	dataMergeIn: {
		type: "sankey",
		domain: { x: [0,1], y: [0,1] },
		//orientation: "v", // responsive
		valueformat: "0",		
		textfont: {
			family: Caths.const.font,
			size: 20,
			weight: 600 
		},
		arrangement: 'fixed', // 'snap' is fun but useless
	},
	nodeMergeIn: {
	    //pad: 30, // responsive
	    thickness: 40,
	    line: { width: 0 },
	},
	layout: {
		font: { size: 18, color: '#ffffff', family: Caths.const.font },
		plot_bgcolor: 'transparent',
		paper_bgcolor: 'transparent',
		transition: { duration: 0 }, // doesn't work
		//margin: { l: 20, r: 20, t: 20, b: 20 } // responsive
	},
	config: {
		displayModeBar: false,
		responsive: false, // implemented my own, with a breakpoint
	},
	hoverlabel: {
		bgcolor: '#202020FF',
		bordercolor: '#202020FF',
		font: { color: '#ffffff', size: 16, family: Caths.const.font },
	},
};

Caths.plot = null; // Plotly object
Caths.baseEl = null;
Caths.tapPopupEl = null;

Caths.setup = () => {
	var error = '';
	if (!window.d3) { error += 'Fehler: Bibliothek D3 nicht geladen!<br />'; }
	if (!window.Plotly) { error += 'Fehler: Bibliothek Plotly nicht geladen!<br />'; }
	if (!window.CathsCSV) { error += 'Fehler: Cathinon-Daten nicht geladen!<br />'; }

	Caths.baseEl = document.getElementById(Caths.const.baseElId);
	if (error != '') {
		Caths.baseEl.innerHTML = error;
	} else {
		Caths.baseEl.innerHTML = `
			<div id="caths-container">
				<div id="caths-as">&nbsp;</div>
				<div id="caths-plot"></div>
				<div id="caths-is">&nbsp;</div>
			</div>
			<img id="caths-export" />
			<div id="caths-tappopup"></div>`;

		Caths.plot = document.getElementById(Caths.const.plotElId);
		Caths.tapPopupEl = document.getElementById(Caths.const.tapPopupElId);

		Caths.lang = (window.Weglot && Weglot.getCurrentLang())
			|| Caths.baseEl.getAttribute('lang')
			|| Caths.lang;

		Caths.load();
	}
}

Caths.load = () => {
	Caths.initSettingsAndLang();
	Caths.parseData();
	Caths.setupPlot();
	Caths.renderPlot();
}


// Responsiveness

Caths.lastInnerWidth = null;

Caths.inMobileMode = () => {
	return (window.innerWidth <= Caths.const.breakpoint);
}

window.addEventListener('resize', () => {
	var diff = Math.abs(Caths.lastInnerWidth-window.innerWidth);
	if (diff > 10) Caths.renderPlot();
});

// TODO: Could do this more declaratively & merge in renderPlot
Caths.mobileLayout = () => {
	var w = Caths.plot.offsetWidth;
	Caths.const.size = { width: w, height: 600 };
	Caths.plot.style.height = Caths.const.size.height+'px';
	Caths.sankey.dataMergeIn.orientation = 'h';
	Caths.sankey.layout.margin = { l: 2, r: 2, t: 0, b: 20 };
	Caths.sankey.nodeMergeIn.pad = 22;
}
Caths.desktopLayout = () => {
	var w = Caths.plot.offsetWidth;
	var h = w / 2.3 + 50;
	Caths.const.size = { width: w, height: h };
	Caths.plot.style.height = h+'px';
	Caths.sankey.dataMergeIn.orientation = 'v';
	Caths.sankey.layout.margin = { l: 20, r: 20, t: 20, b: 20 };
	Caths.sankey.nodeMergeIn.pad = 30;
}

// Settings

Caths.haveSetupTapInteractivity = false;

Caths.settings = {
	includeRCs: 0,
	showMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // 0 = no date
}

Caths.setLang = (val) => {
	Caths.lang = val;
	Caths.load();
}
if (window.Weglot) {
	Weglot.on("languageChanged", Caths.setLang);
}

// for changing sankey setup (e.g. what data to show)
Caths.set = (s, val) => {
	Caths.settings[s] = parseInt(val, 10);
	Caths.setupPlot();
	Caths.renderPlot();
}

// for changing data (e.g. which timeframe to consider)
Caths.setAndReload = (s, val) => {
	Caths.settings[s] = val;
	Caths.load();
}

Caths.initSettingsAndLang = () => {
	var sel = document.getElementById('setting-includeRCs');
	if (sel) sel.value = Caths.settings.includeRCs;
	var sel = document.getElementById('setting-lang');
	if (sel) sel.value = Caths.lang;

	Caths.baseEl.setAttribute('lang', Caths.lang);

	Caths.innerHTML('caths-h1', Caths.s[Caths.lang].h1);
	Caths.innerHTML('caths-as', Caths.s[Caths.lang].as);
	Caths.innerHTML('caths-is', Caths.s[Caths.lang].is);

}


// Data

Caths.data = {};

Caths.defaultData = () => {
	Caths.data = {
		ids: ['etc', 'mix'], // prepopulate special entries
		label: ['etc.', 'Mix'],
		labelBr: ['etc.', 'Mix'],
		color: [Caths.const.colors.etc, Caths.const.colors.mix],
		hovertemplate: [ // [count/percent, (text), avg purity, %contaminated] (0 & 2 & 3 filled in at end)
			[null, ''],
			[null, ' '+Caths.s[Caths.lang].was+' '+Caths.toVerboseLabel('Mix')+'<extra></extra>']
		],
		count: {},
		countSamples: 0,
		purity: {},
		contamination: {},
		pairs: {},
		etc: [],
	};		
}


// Helpers

Caths.innerHTML = (el, html) => {
	var e = document.getElementById(el);
	if (e) e.innerHTML = html;
}

Caths.normalizeSubst = (s) => {
	Caths.const.substCleanup.forEach(c => {
		s = s.replace(c[0], c[1]);
	});
	return s;
}

Caths.toId = (x) => {
	return x.toLowerCase().replace('-', '');
}

Caths.toFloat = (s) => {
	return (s == '' || s == '0,0') ? null : parseFloat(s.replace(',','.'));
}

Caths.toPercent = (a, b) => {
	return Math.round((a/b)*100);
}

Caths.toMaybeLabel = (s) => {
	return Caths.s[Caths.lang].quoteStart + s + Caths.s[Caths.lang].quoteEnd;
}

Caths.isIrrelevant = (subst) => {
	return Caths.const.substIrrelevant.some(a => {
		return subst.includes(a);
	});
}

Caths.isCathinone = (subst) => {
	return Caths.const.substCathinones.some(a => {
		return subst.includes(a);
	});
}

Caths.isAllCathinones = (found) => {
	return found.every(f => {
		return (Caths.isCathinone(f.subst) || Caths.isIrrelevant(f.subst));
	});
}

Caths.toVerboseLabel = (l) => {
	if (l == 'Mix' ) l = Caths.s[Caths.lang].mixVerbose;
	if (l == 'etc.') l = Caths.s[Caths.lang].other;
	return l;
}

Caths.joinWithBr = (arr, joiner) => {
	var out = '';
	arr.forEach((a, i) => {
		out += a;
		if (i < arr.length-1) out += joiner;
		if ((arr.length > (i+1)) && ((i+1) % 4 == 0)) {
			out += '<br />';
		} else if (i != arr.length-1) {
			out += ' ';
		}
	});
	return out;
};

Caths.translateSubstance = (s) => {
	if (!Caths.s[Caths.lang].subst) return s;
	return Caths.s[Caths.lang].subst[s] || s;
};

Caths.addToData = (id, label, col, htl) => {
	Caths.data.ids.push(id);
	var labelTrans = Caths.translateSubstance(label);
	Caths.data.label.push(labelTrans);
	var labelBr = labelTrans;
	if (labelTrans.length > 10) labelBr = labelTrans.replace('pentylon', '-<br />pentylon');
	Caths.data.labelBr.push(labelBr);
	Caths.data.color.push(col || Caths.const.colors['default']);
	Caths.data.hovertemplate.push([null, htl, null, null]); // percent, template, avg. purity, %contamined
}

Caths.saveSvg = () => {
	Plotly.toImage(
		Caths.plot,
		Object.assign({ format:'svg' }, Caths.const.size)
	).then(function(url) {
		var img_svg = document.getElementById(Caths.const.exportElId);
    	img_svg.setAttribute("src", url);
	});
}


// The Main Event

Caths.parseData = () => {

	Caths.defaultData();

	// strip leading/trailing newlines & parse
	var dcData;
	var dcDataRaw = window.CathsCSV.replace(/^\s+|\s+$/g, '');
	if (d3.dsvFormat) { // newer D3
		dcData = d3.dsvFormat(";").parse(dcDataRaw);
	} else { // older D3
		dcData = d3.dsv(';', 'text/plain').parse(dcDataRaw);
	}

	dcData.forEach(d => {

		var dizId = d["DIZ-Nr."]+''; // force into string
		var asLabelIdx, isLabelIdx;

		if (!dizId || dizId.includes('_')) return; // (hidden) duplicate row
		
		var as = d["deklarierter Inhalt"]; // what the substance was submitted AS
		var asId = Caths.toId(as)+'?';
		
		if (!Caths.data.ids.includes(asId)) { // new subst
			Caths.addToData(
				asId,
				Caths.toMaybeLabel(as),
				Caths.const.colors[as],
				' '+Caths.s[Caths.lang].supposed+Caths.translateSubstance(as)+' '+Caths.s[Caths.lang].submitted+'<extra></extra>'
			);
		}
		
		// date filter
		var dateReceived = d["Datum Eingang"]+''; // US date format here for some reason
		if (dateReceived.includes('/')) {
			var month = parseInt(dateReceived.substring(0, dateReceived.indexOf('/')), 10);
		} else {
			var month = 0;
		}
		if (!Caths.settings.showMonths.includes(month)) return;

		Caths.data.countSamples++;
		Caths.data.count[asId] = (Caths.data.count[asId]||0) + 1;

		// Parse test results

		var found = [];
		for (var i = 1; i<=5; i++) {
			if (d["Substanz "+i] && d["Substanz "+i] != "0") {
				var subst = Caths.normalizeSubst(d["Substanz "+i]);
				var id = Caths.toId(subst);
				var colName = (i == 1) ? "Gehalt (%)  Sub" : "Gehalt (%) Sub";
				var pct = Caths.toFloat(d[colName+i]);
				found.push({ id: id, subst: subst, pct: pct });
			}
		}

		// Determine which substance to count this as overall

		if (!Caths.data.pairs[asId]) Caths.data.pairs[asId] = {};

		var isId; // what the substance actually IS
		if (Caths.const.substEtc.includes(found[0].subst)) {
			isId = 'etc';
		} else if (
			found.length == 1 || // single subst
			found[0].pct > 80 || // primarily one
			(found[0].pct > 50 && Caths.isIrrelevant(found[1].subst)) ||
			(found[0].pct == null && Caths.isIrrelevant(found[1].subst)) || // undetermined%
			(found[0].pct == null && (found[1].pct && found[1].pct < 5))    // undetermined%
		    ) {
			isId = found[0].id;
		} else if (Caths.isAllCathinones(found)) {
			isId = 'mix';
		} else {
			isId = 'etc';
		}

		if (!Caths.data.ids.includes(isId)) { // new subst
			Caths.addToData(
				isId,
				found[0].subst,
				Caths.const.colors[found[0].subst],
				' '+Caths.s[Caths.lang].wasMostly+' '+Caths.translateSubstance(found[0].subst)+
				'<extra></extra>'
			);
		}

		// Keep a list of what's (primarily) in etc, for showing details later
		if (isId == 'etc') {
			Caths.data.etc.push(Caths.translateSubstance(found[0].subst));
		}

		// Log pair
		Caths.data.pairs[asId][isId] = (Caths.data.pairs[asId][isId]||0) + 1;
		Caths.data.count[isId] = (Caths.data.count[isId]||0) + 1;
		
		if (found[0].pct) {
			if (!Caths.data.purity[isId]) Caths.data.purity[isId] = [];
			Caths.data.purity[isId].push(found[0].pct);
		}
		if (found.length > 1) {
			Caths.data.contamination[isId] = (Caths.data.contamination[isId]||0) + 1;
		}

		var foundStr = ''; // readable representation for debugging
		found.forEach(f => {
			foundStr += f.subst+':'+f.pct+' ';
		});
		//console.log(dizId, as, isId, foundStr);

	});

}

Caths.setupPlot = () => {

	Caths.data.link = {
		source: [],
		target: [],
		value: [],
		color: [],
		hovertemplate: '%{customdata}',
		hoverlabel: Caths.sankey.hoverlabel,
		customdata: [],
		//arrowlen: 30,
	}

	var pairs = Caths.data.pairs;
	var countIs = {};
	var countSamples = 0;

	Object.keys(pairs).forEach(asId => {

		if (!Caths.settings.includeRCs &&
			Caths.const.substRCIds.includes(asId)) {
			return;
		}

		// Single results? => add to "etc"
		// TODO couldn't I do this earlier? based just on Caths.data.count[isId] == 1
		Object.keys(pairs[asId]).forEach(isId => {
			if (Caths.data.count[isId] == 1 &&
				!Caths.const.substNeverEtcIds.includes(isId)) {
				
				pairs[asId]['etc'] = (pairs[asId]['etc']||0) + 1;

				Caths.data.count['etc']++;
				Caths.data.count[isId]--;
				
				var isIdX = Caths.data.ids.indexOf(isId);
				Caths.data.etc.push(Caths.data.label[isIdX]);
				delete pairs[asId][isId];

				return;
			}
		});

		// Create sankey links
		Object.keys(pairs[asId]).forEach(isId => {

			var asIdX = Caths.data.ids.indexOf(asId);
			var isIdX = Caths.data.ids.indexOf(isId);
			
			Caths.data.link.source.push(asIdX);
			Caths.data.link.target.push(isIdX);
			Caths.data.link.value.push(pairs[asId][isId]);
			
			var pct = Caths.toPercent(pairs[asId][isId], Caths.data.count[asId]);
			var col = Caths.const.colors.defaultLink; // default
			var isLabel = Caths.data.label[isIdX];
			var isLabelV = Caths.toVerboseLabel(isLabel);
			
			var htl = '<span>'+pct+'%</span> <span>('+pairs[asId][isId]+')</span> '+Caths.s[Caths.lang].ofPresumed+'<br />'+
				Caths.data.label[asIdX]+Caths.s[Caths.lang].samplesWereActually+' <span>'+
				isLabelV+'</span><extra></extra>';

			// submitted-as matches result
			// (converting isLabel into asLabel-format to check for match)
			if (Caths.data.label[asIdX] == Caths.toMaybeLabel(isLabel)) {
				col = Caths.const.colors[isLabel]+'80'; // 80% opacity
				htl = '<span>'+pct+'%</span> <span>('+pairs[asId][isId]+')</span>'+
					  ' '+Caths.s[Caths.lang].of+' '+isLabel+Caths.s[Caths.lang].samplesWereCorrect+'<extra></extra>';
			}
			Caths.data.link.customdata.push(htl);
			Caths.data.link.color.push(col);

			countSamples += pairs[asId][isId];
			countIs[isId] = (countIs[isId]||0) + pairs[asId][isId];  

		});
	});

	// Update counts & purity for hovertemplates
	Caths.data.ids.forEach((id, i) => {
		
		if (id.includes('?')) { // as
			
			h0 = '<span>'+Caths.data.count[id] + '&times;</span>';
			h2 = '';
		
		} else { // is
		
			h0 = '<span>'+Caths.toPercent(countIs[id], countSamples) +
				'%</span> <span>(' + countIs[id] + ')</span> '+Caths.s[Caths.lang].ofSamples;

			// purity
			h2 = '';
			if (id != 'etc' && id != 'mix' && Caths.data.purity[id]) {
				var arr = Caths.data.purity[id];
				var avg = Math.round(arr.reduce((a, b) => a + b) / arr.length);
				h2 = '<br />&#8960; '+avg+'% '+Caths.s[Caths.lang].pure;
			}

			// contamination
			h3 = '';
			if (id != 'etc' && id != 'mix' && Caths.data.contamination[id]) {
				var pct = Math.round((Caths.data.contamination[id] / Caths.data.count[id])*100);
				h3 = (h2 == '') ? '<br />' : '; ';
				h3 += pct+'% '+Caths.s[Caths.lang].contaminated;
			}
		}
		Caths.data.hovertemplate[i][0] = h0;
		Caths.data.hovertemplate[i][2] = h2;
		Caths.data.hovertemplate[i][3] = h3;

	});

	// etc details
	var etc = Caths.data.etc;
	var etcUnique = etc.filter((item,index) => etc.indexOf(item)===index);
	Caths.data.hovertemplate[0][1] =
		'<br />'+Caths.s[Caths.lang].were+' '+Caths.toVerboseLabel('etc.')+'<br />('+
		Caths.joinWithBr(etcUnique.sort(), ',')+')<extra></extra>';

};

Caths.renderPlot = () => {

	Caths.lastInnerWidth = window.innerWidth;
	if (Caths.inMobileMode()) {
		Caths.mobileLayout();
	} else {
		Caths.desktopLayout();
	}

	var data = Object.assign({
	  ids: Caths.data.ids,
	  node: Object.assign({
	    customdata: Caths.data.hovertemplate,
	    hovertemplate: '%{customdata[0]}%{customdata[1]}%{customdata[2]}%{customdata[3]}',
	   	hoverlabel: Caths.sankey.hoverlabel,
	    label: Caths.data.labelBr,
	    color: Caths.data.color,
	  }, Caths.sankey.nodeMergeIn),
	  link: Caths.data.link,
	}, Caths.sankey.dataMergeIn);
	
	var layout = Object.assign(Caths.sankey.layout, Caths.const.size);

	// would prefer to use .react here, but that has a slow awkward transition animation
	// that I can't figure out how to turn off even with layout.transition.duration = 0
	Plotly.newPlot(Caths.plot, [data], layout, Caths.sankey.config).then(p => {		
		Caths.postProcess();
	});

	if (Caths.inMobileMode()) {
		Caths.setupTapInteractivity();
	} else {
		Caths.setupHoverInteractivity();
	}

};

Caths.setupHoverInteractivity = () => {

	Caths.plot.on('plotly_hover', (data) => {
		var ids = Caths.getContextDataIds(data.points[0]);
		setTimeout(() => {
			var ht = document.getElementsByClassName('hovertext')[0];
			if (ht) {
				var a = ht.__data__['anchor']; // "start" or "end"
				ht.classList.add(a);
				Caths.setContextClasses(ht, ids);
				ht.style.opacity = 1;
			}
		}, 10);
	});

	Caths.plot.on('plotly_unhover', (data) => {
		if (data.event.target.nodeName == 'rect') { // unhovering a subst
			Caths.removeHighlight();
		}
	});

}

Caths.setupTapInteractivity = () => {

	Caths.plot.on('plotly_click', (data) => {

		var dP = data.points[0];
		var isLink = () => { return dP.source; };

		// desel all
		var sels = Caths.baseEl.getElementsByClassName('sel');
		Array.from(sels).forEach((s) => { s.classList.remove('sel'); });

		// set classes
		var t = dP.originalEvent.target;
		var sankeyNode = isLink() ? t : t.parentNode; // node = [rect, text] so we need parent

		sankeyNode.classList.add('sel');
		if (!isLink()) Caths.multiSel(dP.pointNumber); // sel all related links

		Caths.tapPopupEl.className = ''; // clear
		var ids = Caths.getContextDataIds(dP);
		if (ids[1] && ids[0] == ids[1]+'?') sankeyNode.classList.add('correct');
		Caths.setContextClasses(Caths.tapPopupEl, ids);

		// set contents
		var cd = dP.customdata;
		Caths.tapPopupEl.innerHTML = (cd.join) ? cd.join('') : cd;

		// show (if not yet)
		var d = window.getComputedStyle(Caths.tapPopupEl).getPropertyValue('display');
		if (d == 'none') {
			Caths.tapPopupEl.style.display = 'block';
			setTimeout(() => {
				Caths.tapPopupEl.style.opacity = 1;
				Caths.tapPopupEl.style.bottom = 0;
			}, 1);
		}

	});

	if (!Caths.haveSetupTapInteractivity) { // only once please
		// Dismiss popup when tapping outside
		document.body.addEventListener('pointerdown', Caths.tap);
		Caths.haveSetupTapInteractivity = true;
	}
}

Caths.tap = (e) => {
	if (Caths.inMobileMode()) {
		var t = e.target;
		if (t.id != 'caths-tappopup' &&
			(!(['path', 'rect', 'text'].includes(t.nodeName))
			|| t.classList.contains('bgsankey'))) {
			Caths.hideTapPopup();
		}
	}
};

Caths.multiSel = (pn) => {
	var ls = Caths.baseEl.getElementsByClassName('sankey-link');
	Array.from(ls).forEach((linkNode) => {
		if (linkNode.__data__.link.source.pointNumber == pn
			|| linkNode.__data__.link.target.pointNumber == pn) {
			// safari needs this on a timeout for some reason (bubbling click event?)
			setTimeout(() => { linkNode.classList.add('sel'); }, 1);
			var ids = Caths.getContextDataIds(linkNode.__data__.link);
			if (ids[1] && ids[0] == ids[1]+'?') linkNode.classList.add('correct');
		}
	});

}

Caths.getContextDataIds = (pt) => {
	var id0, id1;
	if (pt.source) { // is a link
		id0 = Caths.data.ids[pt.source.pointNumber];
		id1 = Caths.data.ids[pt.target.pointNumber];
	} else { // is a node
		id0 = Caths.data.ids[pt.pointNumber];
	}
	return [id0, id1];
}

Caths.setContextClasses = (el, ids) => {
	Caths.removeHighlight();

	var id0clean = ids[0].replace('?', '');

	if (ids[1]) { // link (targetid => sourceid)
		el.classList.add('as-'+id0clean);
		if (ids[1]) el.classList.add('is-'+ids[1]);
		if (id0clean == ids[1]) el.classList.add('correct');
	} else { // node
		el.classList.add('subst-'+id0clean);
		var c = (ids[0].includes('?')) ? 'highlight-as' : 'highlight-is';
		Caths.baseEl.classList.add(c);
	}
}

Caths.removeHighlight = () => {
	Caths.baseEl.classList.remove('highlight-as');
	Caths.baseEl.classList.remove('highlight-is');
}

Caths.hideTapPopup = () => {
	Caths.removeHighlight();

	// desel all
	var sels = Caths.baseEl.getElementsByClassName('sel');
	Array.from(sels).forEach((s) => { s.classList.remove('sel'); });

	Caths.tapPopupEl.style.opacity = 0;
	Caths.tapPopupEl.style.bottom = '-100px';
	setTimeout(() => {
		Caths.tapPopupEl.style.display = 'none';
	}, 300);
}

Caths.postProcess = () => {

	var nodes = Array.from(Caths.plot.getElementsByClassName('sankey-node'));
	nodes.forEach(n => {

		var h = n.firstChild.getAttribute('height'); // rect
		var label = n.childNodes[1];
		if (h < 65) label.style.fontSize = '15px';
		if (h < 40) label.style.fontSize = '13px';

		if (Caths.sankey.dataMergeIn.orientation == 'v') {
			label.setAttribute('text-anchor', 'middle');
			label.setAttribute('x', h/2.15);
		}

	});

}
