export class ScreenshotEngine {
    constructor(canvasId) {
        this.canvasId = canvasId;
    }

    capture() {
        const canvas = document.getElementById(this.canvasId);
        if (!canvas) return;
        
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `dojutsu-record-${timestamp}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
}