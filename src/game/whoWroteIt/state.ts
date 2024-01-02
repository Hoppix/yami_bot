//        ┌─────────────────────────────────────────┐
//        │                                         │
//        │                                         │
// ┌──────┴──┐          ┌──────────┐           ┌────▼───┐
// │         │          │          │           │        │
// │ Created ├───────┐  │ Guessing ├───────────► Ended  │
// │         │       │  │          │           │        │
// └─────────┘       │  └────▲─────┘           └────────┘
//                   │       │
//                   │       │
//               ┌───▼───────┴─┐
//               │             │
//               │Inizializing │
//               │             │
//               └─────────────┘

export enum wwiState {
    CREATED,
    ENDED,
    GUESSING,
    INITIALIZING
}

export class wwiStateMachine {

    public static initialize(state: wwiState): wwiState {
        if (state != wwiState.CREATED) {
            throw new Error("Illegal state transition from: " + state.toString() + " to " + wwiState.INITIALIZING.toString())
        }

        return wwiState.INITIALIZING;
    }

    public static end(state: wwiState): wwiState {
        if (state == wwiState.INITIALIZING) {
            throw new Error("Illegal state transition from: " + state.toString() + " to " + wwiState.ENDED.toString())
        }

        if (state == wwiState.ENDED) {
            throw new Error("Illegal state transition from: " + state.toString() + " to " + wwiState.ENDED.toString())
        }

        return wwiState.ENDED;
    }

    public static start(state: wwiState): wwiState {
        if (state != wwiState.INITIALIZING) {
            throw new Error("Illegal state transition from: " + state.toString() + " to " + wwiState.ENDED.toString())
        }

        return wwiState.GUESSING;
    }

}