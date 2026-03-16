// Web Worker for running Transformers.js TTS entirely in the background thread

import { pipeline, env } from '@xenova/transformers';

// Skip local model check if running on a standard web deployment path
env.allowLocalModels = false;
env.useBrowserCache = true; // Cache weights in IndexedDB so subsequent loads are instant

// Using the highly optimized, tiny ~15MB English TTS model as the default
// Note: If using a custom model like 'ekwek/Soprano-1.1-80M', ensure it's converted to ONNX and compatible with Transformers.js pipeline.
const MODEL_ID = 'Xenova/mms-tts-eng';

class TTSPipeline {
    static task = 'text-to-speech';
    static instance: any = null;

    static async getInstance(progress_callback?: Function) {
        if (this.instance === null) {
            // Set up pipeline with progress callback so UI can show loading states
            this.instance = pipeline(this.task as any, MODEL_ID, {
                progress_callback,
            });
        }
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event: MessageEvent) => {
    const { text, type } = event.data;

    if (type !== 'synthesize') return;

    try {
        // Send a message to indicate we're starting synthesis
        self.postMessage({ status: 'working' });

        const synthesizer = await TTSPipeline.getInstance((progress: any) => {
            self.postMessage({ status: 'loading', payload: progress });
        });

        // Generate the audio
        // The mms-tts-eng model produces raw audio waveform data
        const output = await synthesizer(text);

        // the output contains audio array and sampling rate
        self.postMessage({
            status: 'complete',
            payload: {
                audio: output.audio, // Float32Array of raw PCM audio data
                sampling_rate: output.sampling_rate
            }
        });

    } catch (error: any) {
        self.postMessage({ status: 'error', payload: error.message });
    }
});
