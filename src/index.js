//@ts-check

const mount = document.getElementById("mount");
const audioUrl = "https://wasabi.i3s.unice.fr/WebAudioPluginBank/BasketCaseGreendayriffDI.mp3";

const audioCtx = new AudioContext();
/** @type {HTMLButtonElement} */
// @ts-ignore
const btnStart = document.getElementById("btn-start");
/** @type {HTMLInputElement} */
// @ts-ignore
const inputLoop = document.getElementById("input-loop");

// Fonction to connect plugins of the audioNode.

const connectPlugin = (sourceNode, audioNode) => {
    sourceNode.connect(audioNode);
    audioNode.connect(audioCtx.destination);
}

// Fonction to connect plugins of the audioNode.

const mountPlugin = (domModel) => {
    mount.innerHTML = '';
    mount.appendChild(domModel);
}

(async () => {
    const { default: OperableAudioBuffer } = await import("./operable-audio-buffer.js");
    const { default: AudioPlayerNode } = await import("./audio-player-node.js");
    await audioCtx.audioWorklet.addModule("./audio-player-processor.js");

    const response = await fetch(audioUrl);
    const audioArrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);

    /** @type {import("./operable-audio-buffer.js").default} */
    const operableAudioBuffer = Object.setPrototypeOf(audioBuffer, OperableAudioBuffer.prototype);
    const node = new AudioPlayerNode(audioCtx, 2);

    node.setAudio(operableAudioBuffer.toArray());
    node.connect(audioCtx.destination);
    node.parameters.get("playing").value = 0;
    node.parameters.get("loop").value = 1;

    // plugin loading and initialization

    const { default: initializeWamHost } = await import("./plugins/testBern/utils/sdk/src/initializeWamHost.js");
    const [hostGroupId] = await initializeWamHost(audioCtx);

    const { default: WAM } = await import ("./plugins/testBern/index.js");
    const instance = await WAM.createInstance(hostGroupId, audioCtx);
    connectPlugin(node, instance._audioNode);

    const pluginDomModel = await instance.createGui();
    mountPlugin(pluginDomModel);

    
    btnStart.onclick = () => {
        if (audioCtx.state === "suspended") audioCtx.resume();
        const playing = node.parameters.get("playing").value;
        if (playing === 1) {
            node.parameters.get("playing").value = 0;
            btnStart.textContent = "Start";
        } else {
            node.parameters.get("playing").value = 1;
            btnStart.textContent = "Stop";
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
