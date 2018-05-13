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