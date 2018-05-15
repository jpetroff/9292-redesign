(function(w){
"use strict";
// File /Users/jpetrov/Work/9292-redesign/src/js/preamble.js

w.Components = {}
window.Vue && window.VueTouch && window.Vue.use(window.VueTouch);

w.utils = {
	leftpad: function(fill,length,_str) {
		var str = String(_str);
		var diff = length - str.length;
		if(diff <= 0) return str;
		var result = '';
		for (var i = 0; i < diff; i++) {
			result += ''+fill;
		}
		return result+str;
	},

	// accepts Date() or input=datetime value and prints: Thu 13 Jul, 2017
	printDateTime: function(val, split) {
		var weekDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
		var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		var currDate = new Date();
		var tzOffset = currDate.getTimezoneOffset();

		if (typeof val == 'object' && val.valueOf) {
			currDate = val;
		} else {
			currDate = new Date(val);
			currDate.setTime( currDate.getTime() + tzOffset*60*1000);
		}

		var weekDay = weekDays[currDate.getDay()],
			day = currDate.getDate(),
			monthName = monthNames[currDate.getMonth()],
			hours = w.utils.leftpad('0',2,currDate.getHours()),
			minutes = w.utils.leftpad('0',2,currDate.getMinutes());

		if (split) {
			return [
				weekDay+' '+day+' '+monthName,
				hours+':'+minutes
			]
		}
		return weekDay+' '+day+' '+monthName+', '+hours+':'+minutes;
	},

	// returns Date() if incorrect string
	valueToDate: function(str) {
		var pattern = /(\d{4})\-(\d\d)\-(\d\d)[tT](\d\d):(\d\d).*/;
		var result = null;

		if (!str) return result;

		var matches = str.match(pattern);
		if (matches && matches.length >= 6) {
			var result = new Date(matches[1],matches[2],matches[3]);
			result.setHours(matches[4]);
			result.setMinutes(matches[5]);

		} else {
			console.log('Error parsing date', str);
			result = new Date();
		}
		return result;
	},

	dateToValue: function(currDate) {
		var year = currDate.getFullYear(),
			day = currDate.getDate(),
			month = w.utils.leftpad('0',2, currDate.getMonth() + 1),
			hours = w.utils.leftpad('0',2,currDate.getHours()),
			minutes = w.utils.leftpad('0',2,currDate.getMinutes());

		return year+'-'+month+'-'+day+'T'+hours+':'+minutes+':00';
	},

	dateToAPIValue: function(currDate) {
		var year = currDate.getFullYear(),
			day = w.utils.leftpad('0',2, currDate.getDate()),
			month = w.utils.leftpad('0',2, currDate.getMonth() + 1),
			hours = w.utils.leftpad('0',2,currDate.getHours()),
			minutes = w.utils.leftpad('0',2,currDate.getMinutes());

		return year+'-'+month+'-'+day+'T'+hours+''+minutes;
	},

	// returns difference in format [HH,MM] type array
	diffDates: function(d1, d2) {
		var msecs = Math.abs(d1.getTime() - d2.getTime());
		var H = 1000*60*60; // milliseconds in hour
		var M = 1000*60;

		var hours = Math.floor(msecs / H);
		var minutes = Math.floor((msecs % H) / M);

		return [hours,minutes];
	},

	// HH:MM to X minutes
	timeToMins: function(timeStr) {
		var pattern = /(\d\d):(\d\d)/;

		if (!timeStr) return null;

		var matches = timeStr.match(pattern);
		var h = parseInt(matches[1]);
		var m = parseInt(matches[2]);

		var result = 60*h+m;

		if (result == 1) {
			return '1 minute';
		} else {
			return result+' minutes';
		}
	},

	// @TODO: add Promise polyfill
	ajax: function(opts) {
		var data = opts.data || null;
		var method = typeof opts.method !== 'undefined' ? opts.method : 'GET';
		var url = opts.url;

		if (!url) return new Promise(function(resolve,reject){reject(Error('No URL provided'))});

		var query = [];
		if (data != null && typeof data == 'object') {
			for (var key in data) {
				if (!data.hasOwnProperty(key)) continue;
				query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
			}
			data = query.join('&');

			if ('' == data) data = null;
		}

		// console.log(data);

		return new Promise(function(resolve, reject) {
			// Do the usual XHR stuff
			var req = new XMLHttpRequest();

			if (method == 'POST') {
				req.open(method, url);
			} else {
				req.open(method, url+'?'+data);
			}
			// console.log(url+'?'+data);

			if (method == 'POST') req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			req.setRequestHeader("X-Requested-With", "XMLHttpRequest");

			req.onload = function() {
				// This is called even on 404 etc
				// so check the status
				if (req.status == 200) {
					// Resolve the promise with the response text
					resolve(req.response);
				}
				else {
					// Otherwise reject with the status text
					// which will hopefully be a meaningful error
					reject(Error(req.statusText));
				}
			};

			// Handle network errors
			req.onerror = function() {
				reject(Error("Network Error"));
			};

			// Make the request
			if (method == 'POST' && data) {
				req.send(data);
			} else {
				req. send();
			}

		});
	}
}

Array.prototype.move = function(from,to){
	this.splice(to,0,this.splice(from,1)[0]);
	return this;
};
// End of /Users/jpetrov/Work/9292-redesign/src/js/preamble.js
})(window);
(function(w){
"use strict";
// File /Users/jpetrov/Work/9292-redesign/src/components/advice-menu.js

w.Components['advice-menu'] = {
	template: '--&gt;<transition><v-touch class=advice-menu @panstart=panstart @panmove=panmove @panend=panend :pan-options=\"{ direction: \'vertical\', threshold: 10 }\" :class=[interactiveState] :style=\"{height: height ? height+\'px\': \'auto\' }\" ref=drawer><div class=left-decor :class=\"[collapsed?\'moving-up\':\'moving-down\']\"></div><div class=right-decor :class=\"[collapsed?\'moving-up\':\'moving-down\']\"></div><div class=advice-menu__route>{{journeyList[selectedIndex].from.name}} → {{journeyList[selectedIndex].to.name}}</div><ul class=advice-menu__available-journeys><li class=journey-time v-for=\"(item,index) in journeyList\" v-if=\"(collapsed == false) || (collapsed == true &amp;&amp; showRange.indexOf(index) != -1)\" :class=\"[index == selectedIndex?\'selected\':\'\']\" :data-index=index @click=changeJourney($event.currentTarget.dataset.index)><div class=date>{{item.departure_display_day}}</div><div class=\"time reg-text\">{{item.departure_display_time}}<span class=arrow>→</span>{{item.arrival_display_time}}</div><div class=\"changes reg-text\">{{item.changes}}</div><div class=\"travel-time reg-text\">{{item.travelTime[0]}}:{{window.utils.leftpad(\'0\',2,item.travelTime[1])}}</div></ul><div class=\"form-row form-row--bottom-nav\" v-show=!collapsed><div class=advice-menu__menu><div class=advice-menu__menu-icon></div></div><div class=advice-menu__change @click=returnToStart>← change trip</div></div></v-touch></transition>',
	props: ['journeyList', 'selectedIndex'],
	data: function() {
		return {
			showRange: [0,1,2],
			collapsed: true,
			height: null,
			fullHeight: 300,
			moving: false
		}
	},
	methods: {
		calcRange: function() {
			var last = this.journeyList.length - 1;
			if (this.selectedIndex == 0) {
				return [0,1,2];
			}
			else if (this.selectedIndex == last) {
				return [last - 2, last - 1, last];
			} else {
				return [this.selectedIndex - 1, this.selectedIndex, this.selectedIndex + 1];
			}
		},
		changeJourney: function(_ind) {
			var ind = parseInt(_ind);
			this.selectedIndex = ind;
			this.$emit('change',ind);
		},
		panstart: function(ev) {
//			console.log(this.$refs);
			this.moving = true;
			this.height = this._heightBoundaries(ev.deltaY);
		},
		panmove: function(ev) {
			this.height = this._heightBoundaries(ev.deltaY);
		},
		panend: function(ev) {
			this.moving = false;
			if (this.collapsed && ev.deltaY < -60) {
				this._openMenu();
			} else if (this.collapsed && ev.deltaY >= -60) {
				this._collapseMenu();
			} else if (!this.collapsed && ev.deltaY > 60) {
				this._collapseMenu();
			} else {
				this._openMenu();
			}
		},
		_heightBoundaries: function(delta) {
			var startH = 0;
			if (this.collapsed) {
				startH = this.initHeight;
			} else {
				startH = this.fullHeight;
			}
			return Math.min(this.fullHeight + 20, Math.max(startH - delta, this.initHeight - 20));
		},
		_collapseMenu: function() {
			this.moving = false;
			this.height = this.initHeight;
			this.collapsed = true;
		},
		_openMenu: function() {
			this.moving = false;
			this.height = this.fullHeight;
			this.collapsed = false;
		},
		returnToStart: function() {
			w.GlobalState.switchScreenState('startScreen');
		}
	},
	computed: {
		interactiveState: function() {
			if (this.moving) {
				return 'advice-menu-panning';
			}
			
			if (this.collapsed) {
				return 'advice-menu-collapsed';
			} else {
				return 'advice-menu-full';
			}
		},
		initHeight: function() {
			return this.$el.clientHeight
		},
		fullHeight: function() {
			return this.$el.clientHeight + 200;
		}
	},
	watch: {
		selectedIndex: function(val) {
			this.showRange = this.calcRange();
			console.log(this.selectedIndex, this.showRange);
			return val;
		},
		journeyList: function(val) {
			console.log('!!');
			this.height = null;
			this.initHeight = this.$el.clientHeight;
			this.fullHeight = this.initHeight + 200;
			this.height = this.initHeight;
			return val;
		}
	}
}

// End of /Users/jpetrov/Work/9292-redesign/src/components/advice-menu.js
})(window);
(function(w){
"use strict";
// File /Users/jpetrov/Work/9292-redesign/src/components/advice-scheme.js

w.Components['advice-scheme'] = {
	template: '<div class=advice-scheme><div class=\"stop-object stop-object-journey\"><div class=stop-object__icon></div><div class=stop-object__place-id><div class=name>{{journey.legs[0].start.name}}</div><div class=substr>{{journey.legs[0].start.type_display}} • {{journey.legs[0].start.place_display}}</div></div></div><div class=leg-append-wrapper v-for=\"leg in journey.legs\"><div class=transport-details-v1 :class=\"leg.transport.mode.type==\'walk\'?\'transport-details-v1__walk\':\'\'\"><div class=transport-details-v1__departure v-if=\"leg.transport.mode.type != \'walk\'\"><div class=time>{{leg.start.departure_display_time}}</div><div class=platform v-if=leg.start.platform>platform&nbsp;{{leg.start.platform}}</div><div class=caption>departure</div></div><div class=transport-details-v1__transport v-if=\"leg.transport.mode.type != \'walk\'\"><div class=icon></div><div class=operator><div class=mode-icon></div><span class=caption>{{leg.transport.operator.name}} {{leg.transport.mode.name}}&nbsp;{{leg.transport.service}}</span></div><div class=direction>direction → {{leg.transport.direction}}</div><div class=stops>4 stops</div></div><div class=transport-details-v1__transport v-if=\"leg.transport.mode.type == \'walk\'\"><div class=icon></div><div class=operator><div class=mode-icon></div><span class=caption>Walk&nbsp;{{leg.duration_display}}</span></div><div class=stops>Show route</div></div><div class=transport-details-v1__arrival v-if=\"leg.transport.mode.type != \'walk\'\"><div class=time>{{leg.end.arrival_display_time}}</div><div class=platform v-if=leg.end.platform>platform&nbsp;{{leg.end.platform}}</div><div class=caption>arrival</div></div></div><div class=\"stop-object stop-object-journey\"><div class=stop-object__icon></div><div class=stop-object__place-id><div class=name>{{leg.end.name}}</div><div class=substr>{{leg.end.type_display}} • {{leg.end.place_display}}</div></div></div></div></div>',
	props: ['journey']
}

// End of /Users/jpetrov/Work/9292-redesign/src/components/advice-scheme.js
})(window);
(function(w){
"use strict";
// File /Users/jpetrov/Work/9292-redesign/src/components/input-selector.js

w.Components['input-selector'] = {
	template: '',
	props: ['travelData']
}

// End of /Users/jpetrov/Work/9292-redesign/src/components/input-selector.js
})(window);
(function(w){
"use strict";
// File /Users/jpetrov/Work/9292-redesign/src/components/popup-input.js

w.Components['popup-input'] = {
	template: "<div class=popup-input__wrapper><div class=popup-input__field>{{label}}</div><div class=popup-modal__wrapper><div class=popup-modal__header><div class=popup-modal__close-button></div><div class=popup-modal__field><span class=popup-modal__label>{{label}}</span> <input type=text class=popup-modal__input></div><div class=popup-modal__close-button></div></div><div class=popup-modal__list><div class=popup_modal__list-helper>{{listHelper}}</div><div v-for=\"item in suggests\"><slot name=item :item=item></slot></div></div><slot name=progress-steps></slot></div></div>",
	props:[
		'label',
		'suggests',
		'popup-state',
		'list-helper'
	]
}

// End of /Users/jpetrov/Work/9292-redesign/src/components/popup-input.js
})(window);
(function(w){
"use strict";
// File /Users/jpetrov/Work/9292-redesign/src/components/popup.js

w.Components['popup-modal'] = {
	template: "<transition name=modal><div class=popup-modal><div class=popup-modal__wrapper @click.stop.self=\"$emit(\'close\')\"><div class=popup-modal__container><div class=popup-modal__header><slot name=header>default header</slot></div><div class=popup-modal__body><slot name=body>default body</slot></div><div class=popup-modal__footer><slot name=footer>default footer <button class=popup-modal__default-button @click=\"$emit(\'close\')\">OK</button></slot></div></div></div></div></transition>"
}

// End of /Users/jpetrov/Work/9292-redesign/src/components/popup.js
})(window);
(function(w){
"use strict";
// File /Users/jpetrov/Work/9292-redesign/src/components/std-app-field.js

w.Components['std-app-field'] = {
	template: '<div class=std-app-field><label v-if=\"(type != \'datetime\')\" class=std-app-field__label><span class=active-label>{{label}}</span></label><div v-if=\"editable &amp;&amp; (type != \'datetime\')\" type=text class=\"std-app-field__input editable\"><input type=text class=internal-input :placeholder=placeholder :value=value @input=updateValue($event.target.value) :id=focusid></div><label v-if=\"!editable &amp;&amp; (type != \'datetime\')\" :for=focusto @click=emitClick class=std-app-field__input>{{value}} <span class=input-append v-if=append>{{append}}</span></label> <label :for=focusid v-if=\"(type == \'datetime\')\" class=\"std-app-field__input editable\">{{window.utils.printDateTime(value)}} <input type=datetime-local class=std-app-field__datetime-hidden :id=focusid @input=updateValue($event.target.value)></label></div>',
	props: ['label','value','placeholder','editable','append', 'type','focusto','focusid'],
	data: function() {
		return { labelDatetimeId: (Math.random().toString(36).substring(7)) };
	},
	methods: {
		updateValue: function(value) {
			this.$emit('input', value.trim());
		},
		emitClick: function() {
			this.$emit('click');
		}
	}
}

// End of /Users/jpetrov/Work/9292-redesign/src/components/std-app-field.js
})(window);
(function(w){
"use strict";
// File /Users/jpetrov/Work/9292-redesign/src/components/std-toggle.js

w.Components['std-toggle'] = {
	template: '<ul class=std-toggle><li class=std-toggle__item v-for=\"(item, index) in items\" :data-value=item.value :data-index=index :class=\"(active == index) ? \'active\': \'\'\" @click=toggleItem($event.currentTarget.dataset)><span class=item-label>{{item.label}}</span></ul>',
	props: ['items', 'active'],
	methods: {
		toggleItem: function(dataset) {
			GlobalState.update('timeType', parseInt(dataset.value));
			this.active = dataset.index;
		}
	}
}

// End of /Users/jpetrov/Work/9292-redesign/src/components/std-toggle.js
})(window);
(function(w){
"use strict";
// File /Users/jpetrov/Work/9292-redesign/src/components/text-field.js

w.Components['text-field'] = {
	template: '<div class=text-field :class=\"{\n	\'text-field_error\': validator.$error,\n	\'text-field_has-input\': focus || value\n}\"><div class=disabled-overlay></div><input :value=value @input=updateValue($event.target.value) @focus=\"focus = true\" @blur=\"focus = false\" type=text class=text-field__input id=text-field-field__destination name=destination> <label class=text-field__label for=text-field-field__destination>{{message}}</label></div>',
	props: [
		'label',
		'label-error',
		'value',
		'validator'
	],
	created: function() {
		this.triggerError = _.debounce(_.bind(this.validator.$touch, this), 500)
	},
	data: function() {
		return {
			focus: false
		}
	},
	computed: {
		message: function() {
			if (this.validator.$error) {
				return this.labelError
			} else {
				return this.label
			}
		}
	},
	methods: {
		updateValue: function(value) {
			this.validator.$reset()
			this.$emit('input', value)
			this.triggerError()
		}
	}
}

// End of /Users/jpetrov/Work/9292-redesign/src/components/text-field.js
})(window);
(function(w){
"use strict";
// File /Users/jpetrov/Work/9292-redesign/src/js/init.js

w.GlobalState = {
	debug: true,
	data: {
		// PARAMS
		time: new Date(),
		timeType: 0, // 0 - leave at, 1 - arrive at
		from: null,
		to: null,
		transTypes: ['bus','tram','train','subway','ferry'],
		extraTransfer: false,

		// SCREENS
		startScreen: true,
		travelInput: {
			display: false,
			step: 0,
			extrasFirst: false
		},
		adviceScreen: false
	},
	helpers: {
		fromLabel: 'from-label-id',
		toLabel: 'to-label-id',
		timeLabel: 'time-label-id'
	},
	update: function(item, value) {
		if (this.debug) {
			console.trace();
			console.log('['+item+'] '+value);
		}
		(this.data[item] !== undefined) && (this.data[item] = value);
	},
	switchScreenState: function(screen, step) {
		this.data.startScreen = (screen == 'startScreen');
		this.data.adviceScreen = (screen == 'adviceScreen');
		this.data.travelInput.display = (screen == 'travelInput');
		if (step && step >= 0 && step <= 2) this.data.travelInput.step = step;
	}
 }

if (w.navigator && w.navigator.geolocation) {
	try {
		navigator.geolocation.getCurrentPosition(function(pos){
			// save the fact that we have location
			w.GlobalState.data.currentLocationEnabled = true;

			// save the location
			w.GlobalState.data.currentLocation = {
				id: '__current-location',
				type: 'internal-value',
				value: {
					lon: pos.coords.longitude,
					lat: pos.coords.latitude,
					accuracy: pos.coords.accuracy
				},
				name: 'Current location',
				displayType: null
			};

			//get closest location
			// @TODO: debug location
			w.utils.ajax({
				url: '//'+location.host+'/api/locations',
				data: {
					lang: 'en-GB',
					latlong: '52.355388, 4.996077',
					type: 'address',
					rows: 1
				}
			}).then(function(response){
				var obj = JSON.parse(response);
				console.log(obj);
				if (obj && obj.locations.length == 1) {
					var location = w.APIProcessor.location(obj.locations[0]);
					w.GlobalState.data.currentLocation.type_display = location.name;
					w.GlobalState.data.currentLocation.place_display = null;

					// set it as the default
					w.GlobalState.data.from = w.GlobalState.data.currentLocation;

					w.GlobalState.data.closestLocation = location;
				}

			});


		})
	} catch (e) {
		console.log(e);
	}
}

w.APIProcessor = {
	location: function(item) {
		try {
			var type = item[item.type+'Type'] || item.type;
			var place = (item.place) ? item.place.name : item.regionName;

			item.type_display = type.toLowerCase();
			item.place_display = place;

			if (type == 'address' && item.houseNr) item.name += ' '+item.houseNr;

		} catch(e) {console.log(e)}
		return item;
	},
	journey: function(journey) {
		var result = {};

		_.extend(result, this._extendedAPITime(journey.departure, 'departure'));
		_.extend(result, this._extendedAPITime(journey.arrival, 'arrival'));
		result.changes = journey.numberOfChanges;

		// @TODO: count travel time
		result.travelTime = 0;

		result.legs = [];
		for (var legInd = 0; legInd < journey.legs.length; legInd++) {
			var leg = journey.legs[legInd];
			// console.log('leg',leg);

			var legObj = {};
			var lastStop = leg.stops.length - 1;

			legObj.start = this.location(leg.stops[0].location);
			if (leg.mode.type != 'walk') {
				_.extend(legObj.start, this._extendedAPITime(leg.stops[0].departure, 'departure'), {
					platform: leg.stops[0].platform,
					platformChange: leg.stops[0].platformChange
				});
			}

			legObj.end = this.location(leg.stops[lastStop].location);
			if (leg.mode.type != 'walk') {
				_.extend(legObj.end, this._extendedAPITime(leg.stops[lastStop].arrival, 'arrival'), {
					platform: leg.stops[lastStop].platform,
					platformChange: leg.stops[lastStop].platformChange
				});
			}

			legObj.transport = {
				mode: leg.mode,
				operator: leg.operator || {},
				service: leg.service || {},
				direction: leg.destination || {}
			}

			if (leg.mode.type == 'walk') {
				legObj.duration_display = w.utils.timeToMins(leg.duration);
			}

			if (leg.stops.length > 2) {
				for (var i = 1; i < lastStop ; i++) {
					// @TODO: process intermediate stops
				}
			}

			result.legs.push(legObj);
		}

		return result;
	},
	journeyList: function(journeys) {
		var result = [];
		for (var i = 0; i < journeys.length; i++) {
			var journey = journeys[i];

			var item = {
				from: w.APIProcessor.location(w.GlobalState.data.from),
				to: w.APIProcessor.location(w.GlobalState.data.to),
				changes: journey.numberOfChanges
			}

			_.extend(item, this._extendedAPITime(journey.departure,'departure'));
			_.extend(item, this._extendedAPITime(journey.arrival,'arrival'));

			console.log('item '+i,item);

			item.travelTime = w.utils.diffDates(item.departure, item.arrival);

			result.push(item);
		}

		return result;
	},
	_extendedAPITime: function(str,param) {
		var result = {};
		var toDate = w.utils.valueToDate(str);
		var toText = w.utils.printDateTime(toDate, true);

		result[param] = toDate;
		result[param+'_display_day'] = toText[0];
		result[param+'_display_time'] = toText[1];
		return result;
	}
}
// End of /Users/jpetrov/Work/9292-redesign/src/js/init.js
})(window);
(function(w){
"use strict";
// File /Users/jpetrov/Work/9292-redesign/src/js/main.js

w.StartScreen = new Vue({
	el: '#start-screen',
	data: {
		global: w.GlobalState.data
	},
	computed: {
		getTimeStr: function() {
			return w.utils.printDateTime(this.global.time);
		},
		activeFromValue: function() {
			if (this.global.from && this.global.from.name) {
				return this.global.from.name
			} else {
				return ''
			}
		},
		activeToValue: function() {
			if (this.global.to && this.global.to.name) {
				return this.global.to.name
			} else {
				return ''
			}
		}
	},
	components: {
		'std-app-field': w.Components['std-app-field']
	},
	methods: {
		showStep: function(step, extras) {
			w.GlobalState.switchScreenState('travelInput', step);
			if (typeof extras != 'undefined') {
				w.GlobalState.data.travelInput.extrasFirst = !!extras;
			}
		},
		getGlobalHelper: function(prop) {
			return w.GlobalState.helpers[prop];
		}
	}
});

w.TravelInput = new Vue({
	el: '#travel-input',
	data: {
		global: w.GlobalState.data,
		from: {
			suggestionsList: [],
			selectedItem: null,
			reqTimestamp: 0
		},
		to: {
			suggestionsList: [],
			selectedItem: null,
			reqTimestamp: 0
		},
		timeValue: w.utils.dateToValue(w.GlobalState.data.time),
	},
	computed: {
		getGlobalTime: function() {
			return w.GlobalState.data.time.toISOString();
		},
		loadAndShow: function() {
			if (this.global.travelInput.display && this.from.suggestionsList.length == 0) {
				if (w.GlobalState.data.currentLocationEnabled) {
					this.from.suggestionsList.push(w.GlobalState.data.currentLocation);
					this.from.suggestionsList[0].selected = true;
					this.from.selectedItem = this.from.suggestionsList[0];
				}
			}
			return this.global.travelInput.display;
		}
	},
	created: function() {
		// @TODO: for FROM set current location to default

		// @TODO: debounce inputs
	},
	components: {
		'std-app-field': w.Components['std-app-field'],
		'std-toggle': w.Components['std-toggle']
	},
	methods: {
		updateSuggestions: function(val) {
			var timestamp = (new Date()).valueOf();
			var type = this.getStepName();

			this[type].reqTimestamp = timestamp;

			w.utils.ajax({
				url: '//'+location.host+'/api/locations',
				data: {
					lang: 'en-GB',
					q: val
				}
			}).then(_.bind(function(data) {
				if (timestamp != this[type].reqTimestamp) return;
				var dataObj = JSON.parse(data);
				var result = this.processSuggestions(dataObj.locations);

				if (type == 'from' && w.GlobalState.data.currentLocationEnabled) {
					result.push(w.GlobalState.data.currentLocation);
				}

				if (result.length == 0) {
					this[type].selectedItem = null;
				} else {
					// select first item by default
					result[0].selected = true;
					this[type].selectedItem = result[0];
				}

				this[type].suggestionsList = result;
			},this));
		},
		updateTime: function(val) {
			this.timeValue = val;
			w.GlobalState.update('time',w.utils.valueToDate(val));
		},
		processSuggestions: function(data) {
			var suggestions=[];
			for (var i = 0; i < data.length; i++) {
				var item = data[i];
				item = w.APIProcessor.location(item);
				suggestions.push(item);
			}
			return suggestions;
		},
		nextStep: function(ev) {
			var currentStep = this.global.travelInput.step;
			if (currentStep == 0 && this.global.time) {
				w.GlobalState.data.travelInput.step = currentStep + 1;
			} else if (currentStep == 1 && this.from.selectedItem) {
				w.GlobalState.data.from = this.from.selectedItem;
				w.GlobalState.data.travelInput.step = currentStep + 1;
			} else if (currentStep == 2 && this.to.selectedItem) {
				w.GlobalState.data.to = this.to.selectedItem;
				w.GlobalState.switchScreenState('adviceScreen');
			} else {
				ev.preventDefault();
			}
		},
		prevStep: function() {
			var currentStep = this.global.travelInput.step;
			if (currentStep == 0) {
				w.GlobalState.switchScreenState('startScreen');
			} else if (currentStep == 1) {
				w.GlobalState.data.travelInput.step = currentStep - 1;
			} else if (currentStep == 2) {
				w.GlobalState.data.travelInput.step = currentStep - 1;
			}
		},
		selectItem: function(elem) {
			var type = this.getStepName();
			// deselect current item
			if (this[type].selectedItem) {
				this[type].selectedItem.selected = false;
			}
			// store selected item
			var key = elem.dataset.key;
			var item = this[type].suggestionsList[key];
			item.selected = true;
			// save selected item
			this[type].selectedItem = item;
			// move selected as first
			this[type].suggestionsList.move(key,0);
			this.nextStep();
		},
		getStepName: function() {
			var type = null;
			if (this.global.travelInput.step == 1) type = 'from';
			else if (this.global.travelInput.step == 2) type = 'to';

			if (!type) {
				console.trace();
				console.log('Cannot identify step');
			}
			return type;
		},
		getGlobalHelper: function(prop) {
			return w.GlobalState.helpers[prop];
		}
	}
})

w.AdviceScreen = new Vue({
	el: '#advice-screen',
	data: {
		global: w.GlobalState.data,
		processing: true,
		apiAdviceObj: null,
		currentJourney: null,
		currentJourneyIndex: 1,
		journeyList: null,
		debug: {
			dataobj: {},
			result: {}
		}
	},
	components: {
		'advice-scheme': w.Components['advice-scheme'],
		'advice-menu': w.Components['advice-menu']
	},
	methods: {
		getAdvice: function(req, append) {
			var dataobj = {};
			if (typeof req == 'string') {
				dataobj = {
					url: '//'+location.host+'/api/' + req.replace('/0.1/','')
				};
			} else if (!req) {
				var fromLocation = this.global.from.id;
				// if set as current location pull up closest location
				if (fromLocation == '__current-location') {
					fromLocation = this.global.closestLocation.id;
				}
				dataobj = {
					url: '//'+location.host+'/api/journeys',
					data: {
						lang: 'en-GB',
						dateTime: w.utils.dateToAPIValue(this.global.time),
						to: this.global.to.id,
						from: fromLocation,
						before: 1,
						after: 5,
						sequence: 1,
						byBus: (this.global.transTypes.indexOf('bus') != -1),
						byFerry: (this.global.transTypes.indexOf('ferry') != -1),
						bySubway: (this.global.transTypes.indexOf('subway') != -1),
						byTram: (this.global.transTypes.indexOf('tram') != -1),
						byTrain: (this.global.transTypes.indexOf('train') != -1),
						interchangeTime: 'standard',
						realtime: true,
						searchType: (this.global.timeType == 0) ? 'departure' : 'arrival'
					}
				}
			}
			this.debug.dataobj = dataobj;
			w.utils.ajax(dataobj).then(_.bind(function(response){
				this.apiAdviceObj = JSON.parse(response);
				if (this.apiAdviceObj.journeys && this.apiAdviceObj.journeys.length != 0) {
					this.currentJourney = w.APIProcessor.journey(this.apiAdviceObj.journeys[this.currentJourneyIndex]);
					this.journeyList = w.APIProcessor.journeyList(this.apiAdviceObj.journeys);
				}
				this.processing = false;
			},this));
		},
		changeJourney: function(ind) {
			console.log('!!!!!');
			this.currentJourneyIndex = ind;
			this.currentJourney = w.APIProcessor.journey(this.apiAdviceObj.journeys[this.currentJourneyIndex]);
		}
	},
	computed: {
		loadAndShow: function() {
			if (this.global.adviceScreen) {
				this.processing = true;
				this.getAdvice();
				return true;
			}
			return false;
		}
	}
})
// End of /Users/jpetrov/Work/9292-redesign/src/js/main.js
})(window);