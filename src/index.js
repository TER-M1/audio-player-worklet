//@ts-check

const audioUrl = "https://wasabi.i3s.unice.fr/WebAudioPluginBank/BasketCaseGreendayriffDI.mp3";

const audioCtx = new AudioContext();
/** @type {HTMLButtonElement} */
// @ts-ignore
const btnStart = document.getElementById("btn-start");
/** @type {HTMLInputElement} */
// @ts-ignore
const inputLoop = document.getElementById("input-loop");
//@ts-ignore


function drawBuffer (canvas, buffer, color,width,height) {
    var ctx = canvas.getContext('2d');
    canvas.width = width ;
    canvas.height = height;
    if (color) {
      ctx.fillStyle = color;
    }
  
      var data = buffer.getChannelData( 0 );
      var step = Math.ceil( data.length / width );
      var amp = height / 2;
      for(var i=0; i < width; i++){
          var min = 1.0;
          var max = -1.0;
          for (var j=0; j<step; j++) {
              var datum = data[(i*step)+j];
              if (datum < min)
                  min = datum;
              if (datum > max)
                  max = datum;
          }
        ctx.fillRect(i,(1+min)*amp,1,Math.max(1,(max-min)*amp));
      }
  }


(async () => {
    const { default: OperableAudioBuffer } = await import("./operable-audio-buffer.js");
    const { default: AudioPlayerNode } = await import("./audio-player-node.js");
    await audioCtx.audioWorklet.addModule("./audio-player-processor.js");

    const response = await fetch(audioUrl);
    const audioArrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);
    var canva = document.querySelector("canvas");
/*     // @ts-ignore
    var Spectrum = WaveSurfer.create({
        audioContext: audioCtx,
        container: '#waveform',
        progressColor: "#03a9f4",
        barWidth: 1,
        cursorWidth: 1,
        pixelRatio: 1,
        height: 100,
        normalize: true,
        responsive: true,
        waveColor: '#ccc',
        cursorColor: '#4a74a5'
    });

    Spectrum.loadDecodedBuffer(audioBuffer);
 */
   drawBuffer(canva,audioBuffer,'red',1000,300);
    /** @type {import("./operable-audio-buffer.js").default} */
    const operableAudioBuffer = Object.setPrototypeOf(audioBuffer, OperableAudioBuffer.prototype);
    const node = new AudioPlayerNode(audioCtx, 2);

    node.setAudio(operableAudioBuffer.toArray());
    node.connect(audioCtx.destination);
    node.parameters.get("playing").value = 0;
    node.parameters.get("loop").value = 1;

    btnStart.onclick = () => {
        if (audioCtx.state === "suspended"){ 
            audioCtx.resume(); 
            // Spectrum.play();
        }
        const playing = node.parameters.get("playing").value;
        if (playing === 1) {
            node.parameters.get("playing").value = 0;
            btnStart.textContent = "Start";
            // Spectrum.pause();
        } else {
            node.parameters.get("playing").value = 1;
            btnStart.textContent = "Stop";
            // Spectrum.play();
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


})();
