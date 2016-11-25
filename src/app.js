console.log(`It's working !`)

/* ------------------------------------------------------------------- */


// We define our video input as the <video> tag (id = webcam)
var webcam = document.getElementById('webcam');


/* ------------------------------------------------------------------- */


// Access to webcam stuff
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia 
|| navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
 
if (navigator.getUserMedia) {       
    navigator.getUserMedia({video: true}, handleVideo, videoError);
}
 
// Create the actual webcam stream into our webcam HTML object 
function handleVideo(stream) {
    webcam.src = window.URL.createObjectURL(stream);
}
 
function videoError(e) {
    console.log("Camera stream is not working, please allow access or try on a recent browser.");
}


// Define a new tracker object
var ctracker = new clm.tracker({useWebGL : true});
// We initialize the object with a face model and start to track the webcam stream
ctracker.init(pModel);
ctracker.start(webcam);


/* ------------------------------------------------------------------- */


// Draw the face
var canvasInput = document.getElementById('drawCanvas');
var cc = canvasInput.getContext('2d');

function drawLoop() {
    requestAnimationFrame(drawLoop);
    cc.clearRect(0, 0, canvasInput.width, canvasInput.height);
    ctracker.draw(canvasInput);
  }

drawLoop();
   

/* ------------------------------------------------------------------- */

// Get current face data positions at every frame
function positionLoop() {
	requestAnimationFrame(positionLoop);
	var positions = ctracker.getCurrentPosition();
// Put "positions" in an if statement (otherwise positions return null) 
    if (positions) {

      var eyebrowLeftHeight = positions[19][1] + positions[20][1] + positions[21][1] + positions[22][1];
      var eyebrowLeftOK = eyebrowLeftHeight / 4;
      var eyebrowRightHeight = positions[18][1] + positions[17][1] + positions[16][1] + positions[15][1];
      var eyebrowRightOK = eyebrowRightHeight / 4;
      var averageEyebro = (eyebrowLeftOK + eyebrowRightOK) / 2      
      var nose = positions[33][1];
  

	// Callback if the tracking fit your face or not
	  var ok = "Your face is successfuly tracked !";
	  var notok = "Tracking not working...";
	  var score = ctracker.getScore();
	  if(score > 0.50) {
		document.getElementById('tracked').innerHTML = ok;
	  } else {
		document.getElementById('tracked').innerHTML = notok;
	  }

	// Draw the face bounding box  
	  var myBox = getAABB(positions);
	  cc.strokeStyle="#FF0000";
	  cc.strokeRect(myBox.x, myBox.y, myBox.width, myBox.height);
	// Print the values
	// diff is the distance between eyebrows and nose in relation to the bounding box
	  var diff = Math.abs((nose - averageEyebro) / myBox.height) * 100;
      console.log("averageEyebro: " + averageEyebro + "\nnose: " + nose + "\ndiff: " + diff);
	 	
	if(diff > 13) {
	  cc.strokeStyle="#0023FF";
	  cc.lineWidth=5;
	  cc.strokeRect(myBox.x, myBox.y, myBox.width, myBox.height);
	} else {
	 	cc.lineWidth=1;
	}
  }
}

  positionLoop();


/* ------------------------------------------------------------------- */



// Function to get the axis aligned bounding box (AABB)

function getAABB(points) {
  if (points && points.length > 0) {
    let min = {x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY };
    let max = {x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY };
    for (let i = 0; i < points.length; i++) {
      let point = points[i];
      let x = point[0];
      let y = point[1];
      if (x < min.x) min.x = x;
      else if (x > max.x) max.x = x;

      if (y < min.y) min.y = y;
      else if (y > max.y) max.y = y;
    }

    let w = Math.abs(max.x - min.x);
    let h = Math.abs(max.y - min.y);

    return {
      x: min.x,
      y: min.y,
      center: {x: min.x + w / 2, y: min.y + h / 2},
      width: w,
      height: h
    };
  } else return null;
}


/* ------------------------------------------------------------------- */



/* --- STUFF I DON'T NEED RIGHT NOW BUT I LEFT IT HERE FOR THE MOMENT --- */


// function enablestart() {
// 		var startbutton = document.getElementById('startbutton');
// 		startbutton.value = "start";
// 		startbutton.disabled = null;
// 	}


// // check for camerasupport
// if (navigator.getUserMedia) {
// 	// set up stream
// 	var videoSelector = {video : true};
// 	if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
// 		var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
// 		if (chromeVersion < 20) {
// 			videoSelector = "video";
// 		}
// 	}
// }

// // put the webcam video flux in <video> tag (id = webcam)
// navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
// window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;
	
// navigator.getUserMedia(videoSelector, function( stream ) {
// 	if (webcam.mozCaptureStream) {
// 		webcam.mozSrcObject = stream;
// 	} else {
// 		webcam.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
// 	}
// 	webcam.play();
// }



// // The canplay event (type) occurs when the browser can start playing the specified audio/video.
// webcam.addEventListener('canplay', enablestart, false);
	
// This function is triggered by a button (see HTML page)
// function startVideo() {
// 	// start video
// 	webcam.play();
// 	// start tracking
// 	ctrack.start(webcam);
// 	// start loop to draw face
// 	// drawLoop();
// }


// 	var overlay = document.getElementById('overlay');
// 	var overlayCC = overlay.getContext('2d');

// stats = new Stats();
// stats.domElement.style.position = 'absolute';
// stats.domElement.style.top = '0px';
// document.getElementById('container').appendChild( stats.domElement );
	
	
// var insertAltVideo = function(video) {// 	if (supports_video()) {// 		if (supports_ogg_theora_video()) {// 			video.src = "./media/cap12_edit.ogv";// 		} else if (supports_h264_baseline_video()) {// 			video.src = "./media/cap12_edit.mp4";// 		} else {// 			return false;// 		}// 		//video.play();// 		return true;// 	} else return false;// }

	
// function drawLoop() {
// 	requestAnimFrame(drawLoop);
// 	overlayCC.clearRect(0, 0, 400, 300);
// 	//psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);
// 	if (ctrack.getCurrentPosition()) {
// 		ctrack.draw(overlay);
// 	}
// }
	
// // update stats on every iteration
// document.addEventListener('clmtrackrIteration', function(event) {
// 	stats.update();
// }, false);