export class HapticFeedback {
    constructor() {
        this.hasHaptics = 'vibrate' in navigator;
    }

    pulse() {
        if (this.hasHaptics) navigator.vibrate(40);
    }

    shockwave() {
        if (this.hasHaptics) navigator.vibrate([100, 50, 200]);
    }

    overdriveHeartbeat() {
        if (this.hasHaptics) navigator.vibrate([50, 100, 50]);
    }
}