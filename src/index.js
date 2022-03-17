//@ts-check

// const audioUrl = "https://wasabi.i3s.unice.fr/WebAudioPluginBank/BasketCaseGreendayriffDI.mp3";
const audioUrl = ""
const audioCtx = new AudioContext();
const gainNode = audioCtx.createGain();
/** @type {HTMLButtonElement} */
// @ts-ignore
const btnStart = document.getElementById("btn-start");
/** @type {HTMLButtonElement} */
// @ts-ignore
const zoomIn = document.getElementById("btn-zoom-in");
/** @type {HTMLButtonElement} */
// @ts-ignore
const zoomOut = document.getElementById("btn-zoom-out");

var zoom = 1;

/** @type {HTMLInputElement} */
// @ts-ignore
const inputLoop = document.getElementById("btn-check-2-outlined");
//@ts-ignore
const volumeinput = document.getElementById("volume");

//@ts-ignore
const inputMute = document.getElementById("Mute");

//@ts-ignore
var launched ;
//@ts-ignore
var paused = false;


function drawBuffer (canvas, buffer, color,width,height) {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = width ;
    canvas.height = height;
    if (color) {
      ctx.fillStyle = color;
    }
  
      var data = buffer.getChannelData( 0 );
      var step = Math.ceil( data.length / width );
      var amp = height / 2;
      for(var i=0; i < width; i ++){
          var min =  1.0;
          var max = -1.0;
          for (var j=0; j<step * zoom; j++) {
              var datum = data[(i*step)+j];
              if (datum < min)
                  min = datum;
              if (datum > max)
                  max = datum;
          }
        ctx.fillRect(i,(1+min)*amp,1,Math.max(1,(max-min)*amp));
      }

      
  }
 
// @ts-ignore
function drawLine(canvas,audioBuffer){
    launched = true;
    var ctx = canvas.getContext('2d');
    var x = 0;
    // @ts-ignore
    var y = 50;
    // @ts-ignore
    var width = 10;
    // @ts-ignore
    var height = 10;
    function animate() {
        if(!paused){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
/*         drawBuffer(canvas,audioBuffer,'red',1000,300);
 */     ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        x++;}
        if(x <= canvas.width ) {
            setTimeout(animate, 33);
        }
        if(x > canvas.width){
            launched = false;
        }
    }
    
    animate();
}




  const connectPlugin = (sourceNode, audioNode) => {
    sourceNode.connect(audioNode);
    audioNode.connect(audioCtx.destination);
}

  function changeVol (vol){
      
      if(vol.value == 0 ){
        gainNode.gain.value = -1;
      }
      // @ts-ignore
      else if( !inputMute.checked) {

        gainNode.gain.value =  vol.value *  0.01;
      }
      
    }
function muteUnmuteTrack(btn){
    console.log(btn);

}


(async () => {
    const { default: OperableAudioBuffer } = await import("./operable-audio-buffer.js");
    const { default: AudioPlayerNode } = await import("./audio-player-node.js");
    await audioCtx.audioWorklet.addModule("./audio-player-processor.js");

    const response = await fetch(audioUrl);
    const audioArrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);
    var canvas0 = document.getElementById("layer0");
    var canvas1 = document.getElementById("layer1");
    // @ts-ignore
    canvas0.height = 300;
    // @ts-ignore
    canvas0.width = 1000;
    // @ts-ignore
    canvas1.height = 300;
    // @ts-ignore
    canvas1.width = 1000;
    console.log(canvas0);
    console.log(canvas1);
    
    
    
   drawBuffer(canvas0,audioBuffer,'red',1000,300);
    /** @type {import("./operable-audio-buffer.js").default} */
    const operableAudioBuffer = Object.setPrototypeOf(audioBuffer, OperableAudioBuffer.prototype);
    const node = new AudioPlayerNode(audioCtx, 2);

    node.setAudio(operableAudioBuffer.toArray());
    node.connect(audioCtx.destination);
    connectPlugin(node, gainNode);
    node.parameters.get("playing").value = 0;
    node.parameters.get("loop").value = 1;
    
    zoomIn.onclick = () => {
        zoom += 1000;
        drawBuffer(canvas0,audioBuffer,'red',1000,300);
    }
    zoomOut.onclick = () => {
        zoom -= 1000;
        zoom = zoom < 0 ? 1 : zoom;
        drawBuffer(canvas0,audioBuffer,'red',1000,300);
    }
    btnStart.onclick = () => {
        if (audioCtx.state === "suspended"){ 
            audioCtx.resume();
            
            
        }
        const playing = node.parameters.get("playing").value;
        if (playing === 1) {
            node.parameters.get("playing").value = 0;
            btnStart.textContent = "Start";
            paused = true;
        } else {
            node.parameters.get("playing").value = 1;
            btnStart.textContent = "Stop";
            paused = false;
            if(!launched){
            drawLine(canvas1,audioBuffer); }
        }
    }
    inputLoop.checked = true;
    inputLoop.onchange = () => {
        const loop = node.parameters.get("loop").value;
        if (loop === 1) {
            node.parameters.get("loop").value = 0;
            inputLoop.checked = false;
        } else {
            node.parameters.get("loop").value = 1;
            inputLoop.checked = true;
        }
    }
    btnStart.hidden = false;
  
    inputMute.onchange = () => {
        console.log(inputMute)

        // @ts-ignore
        if( inputMute.checked){
            gainNode.gain.value = -1;
        }
        else{
            changeVol(volumeinput)
        }
    }


})();
