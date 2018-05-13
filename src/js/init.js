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