/*  
Version Beta
*/
const postbackEndpoint =
	"https://script.google.com/macros/s/AKfycbxTntDp4-vcGAZtDeeJDyb6rhZNylrDipzY-YtBl8J54v6xu_GB/exec"
var urlSearch = new URLSearchParams(location.search.substr(1))
var mousePositionData = []
var deviceID = Cookies.get("deviceID", {
	domain: "cotpear.com"
})
if (!deviceID) {
	var id = genUUID()
	Cookies.set("deviceID", id, {
		expires: 730,
		domain: "cotpear.com"
	})
	deviceID = id
}

var ajaxData = {
	"deviceID": deviceID,
	"browserInfo": new UAParser().getResult(),
	"language": (navigator.language || navigator.userLanguage),
	"enterTime": String(new Date),
	"ref": document.referrer,
	"path": location.pathname,
	"params": getLocationSearch(),
	"event": [{
		"eventName": "pageView",
		"eventType": "impression",
		"data": {
			"location": new URL(location).toString()
		},
		"dispatchTime": Date.now()
	}],
	"additionalInfo": {
		"ip": returnCitySN["cip"],
		"ipRegion": returnCitySN["cname"],
		"Cotpear_member": (LoginedUser ? JSON.stringify(LoginedUser) : "")
	}
}

function getLocationSearch() {
	return location.search;
}

function genUUID() {
	var d = Date.now();
	if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
		d += performance.now(); //use high-precision timer if available
	}
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
}

$(function() {
	$.ajax({
		url: postbackEndpoint,
		data: {
			type: "logging_client_events",
			data: JSON.stringify(ajaxData)
		},
		method: "POST"
	})
	$.ajax({
		url: postbackEndpoint,
		data: {
			type: "logging_url_data",
			data: JSON.stringify({
				"deviceID": deviceID,
				"clickID": urlSearch.get("cpclid"),
				"clickTimeStamp": urlSearch.get("cpclts"),
				"clickUUID": urlSearch.get("cpcluid"),
				"utm": {
					"source": urlSearch.get("utm_source"),
					"medium": urlSearch.get("utm_medium"),
					"term": urlSearch.get("utm_term"),
					"campaign": urlSearch.get("utm_campaign"),
					"content": urlSearch.get("utm_content")
				},
				"fullUrl": new URL(location).toString(),
				"time": Date.now(),
				"info": ajaxData
			})
		},
		method: "POST"
	})
	var mousePos;
	document.addEventListener("onmousemove", handleMouseMove)

	function handleMouseMove(event) {
		var dot, eventDoc, doc, body, pageX, pageY;
		event = event || window.event; // IE-ism
		// If pageX/Y aren't available and clientX/Y are,
		// calculate pageX/Y - logic taken from jQuery.
		// (This is to support old IE)
		if (event.pageX == null && event.clientX != null) {
			eventDoc = (event.target && event.target.ownerDocument) || document;
			doc = eventDoc.documentElement;
			body = eventDoc.body;

			event.pageX = event.clientX +
				(doc && doc.scrollLeft || body && body.scrollLeft || 0) -
				(doc && doc.clientLeft || body && body.clientLeft || 0);
			event.pageY = event.clientY +
				(doc && doc.scrollTop || body && body.scrollTop || 0) -
				(doc && doc.clientTop || body && body.clientTop || 0);
		}

		mousePos = {
			x: event.pageX,
			y: event.pageY
		};
		mousePositionData.push({
			data: mousePos,
			detectTime: Data.now()
		})

	}
	setTimeout(function() {
		//一分鐘瀏覽關卡
		ajaxData.event.push({
			"eventName": "pageView",
			"eventType": "impression",
			"data": {
				"timeLevel": "1分鐘"
			},
			"dispatchTime": Date.now()
		})
		$.ajax({
			url: postbackEndpoint,
			data: {
				type: "logging_client_events",
				data: JSON.stringify(ajaxData)
			},
			method: "POST"
		})
	}, 1000 * 60)
	setTimeout(function() {
		//五分鐘瀏覽關卡
		ajaxData.event.push({
			"eventName": "pageView",
			"eventType": "impression",
			"data": {
				"timeLevel": "5分鐘"
			},
			"dispatchTime": Date.now()
		})
		$.ajax({
			url: postbackEndpoint,
			data: {
				type: "logging_client_events",
				data: JSON.stringify(ajaxData)
			},
			method: "POST"
		})
	}, 1000 * 60 * 5)
})

$.each($("a"), function(i, elem) {
	elem.addEventListener("click", function(e) {
		e.preventDefault()
		let url = new URL(this.href)
		let uuid = genUUID()
		$.ajax({
			url: postbackEndpoint,
			data: {
				type: "logging_url_data",
				data: JSON.stringify({
					"uuid": uuid,
					"urlToGo": url.toString(),
					"time": Date.now(),
					"info": ajaxData,
					"logType": "generate"
				})
			},
			method: "POST"
		})
		//click uuid
		url.searchParams.set("cpclid", uuid)

		//click device ID
		url.searchParams.set("cpcluid", deviceID)

		//click TimeStamp
		url.searchParams.set("cpclts", Date.now())
		window._copy_open(url.toString(), "_blank")
	})
})
window._copy_open = window.open
window.open = function(param_url, target) {
	let url = new URL(param_url)
	let uuid = genUUID()
	$.ajax({
		url: postbackEndpoint,
		data: {
			type: "logging_url_data",
			data: JSON.stringify({
				"uuid": uuid,
				"urlToGo": url.toString(),
				"time": Date.now(),
				"clickType": {
					"type": "window.open",
					"target": target
				},
				"info": ajaxData,
				"logType": "generate"
			})
		},
		method: "POST"
	})
	//click uuid
	url.searchParams.set("cpclid", uuid)

	//click device ID
	url.searchParams.set("cpcluid", deviceID)

	//click TimeStamp
	url.searchParams.set("cpclts", Date.now())
	window._copy_open(url.toString(), target)
}
window.addEventListener("hashchange", function() {
	ajaxData.event.push({
		"eventName": "hashChange",
		"eventType": "action",
		"data": {
			"hash": location.hash
		},
		"dispatchTime": Date.now()
	})
	$.ajax({
		url: postbackEndpoint,
		data: {
			type: "logging_client_events",
			data: JSON.stringify(ajaxData)
		},
		method: "POST"
	})
}, false);
$(document).ajaxError(function(event, request, settings) {
	console.log(settings.url)
	console.log(settings.data)
});
$(window).on("beforeunload", function() {
	$.ajax({
		url: postbackEndpoint,
		data: {
			type: "logging_userAction_data",
			data: JSON.stringify(mousePositionData)
		},
		method: "POST"
	})
})
