console.log(`It's working !`)

// We define our video input as the <video> tag (id = webcam)
var webcam = document.getElementById('webcam');
// Define a new tracker object
var ctracker = new clm.tracker({useWebGL : true});
// We initialize the object with a model and start it for the webcam stream
ctracker.init(pModel);
ctracker.start(webcam);


// Access to webcam stuff
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia 
|| navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
 
if (navigator.getUserMedia) {       
    navigator.getUserMedia({video: true}, handleVideo, videoError);
}
 
function handleVideo(stream) {
    webcam.src = window.URL.createObjectURL(stream);
}
 
function videoError(e) {
    console.log("Camera stream is not working, please allow access or try on a recent browser.");
}


// Get current face data positions at every frame
function positionLoop() {
	requestAnimationFrame(positionLoop);
	var positions = ctracker.getCurrentPosition();
// Doing stuff with positions in a if statement, otherwise positions return null  
      if (positions) {
    //     for (var p = 15; p <= 18; p++) {
    //     console.log("positions x = " + positions[p][0] + "\nposition y = " + positions[p][1]); 
    // }
      var eyebrowLeftHeight = positions[19][1] + positions[20][1] + positions[21][1] + positions[22][1];
      var eyebrowLeftOK = eyebrowLeftHeight / 4;
      var eyebrowRightHeight = positions[18][1] + positions[17][1] + positions[16][1] + positions[15][1];
      var eyebrowRightOK = eyebrowRightHeight / 4;      
      console.log("eyebrow left height : " + eyebrowLeftOK + "\neyebrow right height : " + eyebrowRightOK
        + "\nnose : = " + positions[33][1]);

	// Callback if the tracking fit your face or not
	  var ok = "Your face is successfuly tracked !";
	  var notok = "Tracking not working...";
	  var score = ctracker.getScore();
	  if(score > 0.60) {
		document.getElementById('tracked').innerHTML = ok;
	  } else {
		document.getElementById('tracked').innerHTML = notok;
	  }
	}
}

  positionLoop();

// Draw the face
var canvasInput = document.getElementById('drawCanvas');
var cc = canvasInput.getContext('2d');

function drawLoop() {
    requestAnimationFrame(drawLoop);
    cc.clearRect(0, 0, canvasInput.width, canvasInput.height);
    ctracker.draw(canvasInput);
  }

   drawLoop();




  // ----------------- STUFF I DON'T NEED RIGHT NOW BUT I LEFT IT HERE FOR THE MOMENT ----------------------


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