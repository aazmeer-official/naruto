export class StateMemory {
    constructor(storageKey = 'dojutsu_core_states') {
        this.storageKey = storageKey;
    }

    save(states) {
        localStorage.setItem(this.storageKey, JSON.stringify(states));
    }

    load(defaultStates) {
        const savedData = localStorage.getItem(this.storageKey);
        if (savedData) {
            try {
                return { ...defaultStates, ...JSON.parse(savedData) };
            } catch (e) {
                return defaultStates;
            }
        }
        return defaultStates;
    }
}