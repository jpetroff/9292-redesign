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