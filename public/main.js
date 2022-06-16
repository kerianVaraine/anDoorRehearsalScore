//  viewBox="0 0 288000 2879" original
// viewBox="0 0 1000 190"

///////////////////////
// Socket.io         //
///////////////////////
// open connection to server
var webSocket = io();

///////////////////////
// anDoor Specific
///////////////////////
// Score reference
// TODO: make into a score object
let score = document.getElementById("fullScore");
let getScoreViewBox = function () {
    return score.attributes.viewBox.value.split(" ")
};
// continually observe viewbox x1 via GSAP timeline update callback function
viewBoxX1 = 0;
let getViewBoxX1 = function () {
    return parseInt(getScoreViewBox()[0]);
}
let setViewBoxX1 = function (int) {
    viewBoxX1 = int;
}


// Helpers
let inRange = function (low, high, x) {
    return (low <= x && x <= high);
}


// Conductor checkbox
let isConductor = false;
let conductorSelect = document.getElementById("conductorSelect");
conductorSelect.onclick = function () {
    isConductor = !isConductor;
} //Flips value on click

///////////////////////
// Timeline  Create  //
///////////////////////
let pieceDuration = (14 * 60) + 5; //14:30

let updateRate = 60; // rate to update viewbox X1 position in timeline.onUpdate function
let updateTrack = 0; // modulo track time for timeline.onUpdate function

let tl = gsap.timeline({
    paused: true, //start paused for loading and sync
    onUpdate: () => {
        updateTrack++;
        document.querySelector("#viewboxXpos").textContent = "viewbox X: " + getViewBoxX1().toString(); // TEMP FOR DYNAMICS ENTRY

        if (updateTrack % updateRate == 0) {
            viewBoxX1 = getViewBoxX1();
            if (performerValue !== ("allParts" || "bassPerformer")) {
                // dynamicsUpdate();
                updateDynamics();
            }
        }
    }
});

////////////////////
// Dynamics stave //
////////////////////
/* svg path id = #ads
 default set at: d="M 0.2,10 7.0,0.2 12.0,4.15 H 30"
 params as : d = "M ax,ay attackRate,attackAmp decayRate,decayAmp H 30"
*/
let dynamics = {
    dynamicsStave: document.querySelector("#ads"),
    ax: 0.2,
    ay: 10.0,
    attackRate: 7.0,
    attackAmp: 0.2,
    decayRate: 12.0,
    decayAmp: 4.15,
    dString: function () {
        return "M " + this.ax + "," + this.ay + " " + this.attackRate + "," + this.attackAmp + " " + this.decayRate + "," + this.decayAmp + " H 30";
    },

//TODO: this function name clashes with the update dynamics function for playback dynamics....
    updateDynamics: function () {
        this.dynamicsStave.setAttribute("d", this.dString());
    },

    resetDefault: function () {
        this.ax = 0.2,
            this.ay = 10.0,
            this.attackRate = 7.0,
            this.attackAmp = 0.2,
            this.decayRate = 12.0,
            this.decayAmp = 4.15,
            this.updateDynamics();
    },

    //helper to have numbers for from 0-10 (soft/slow to loud/fast), but 0==0.3 and 10==9.6 for svg overlap
    flipScale: function (n) {
        m = (n * -1 + 10);
        switch (m) {
            case 0:
                return 0.3;
                break;
            case 10:
                return 9.6;
                break;
            default:
                return m;
                break;
        }
    },
    setAttackRate: function (rate) {
        if (rate < this.getDecayRate()) {
            this.attackRate = rate;
        } else {
            this.attackRate = this.getDecayRate();
        }
        this.updateDynamics();
    },
    getAttackRate: function () {
        return this.attackRate
    },

    setAttackAmp: function (amp) {
        this.attackAmp = this.flipScale(amp);
        this.updateDynamics();
    },
    getAttackAmp: function () {
        return this.attackAmp
    },

    setDecayRate: function (rate) {
        if (rate > 0) {
            this.decayRate = rate + this.getAttackRate();
        } else {
            this.decayRate = this.getAttackRate();
        }
        this.updateDynamics();
    },
    getDecayRate: function () {
        return this.decayRate
    },

    setDecayAmp: function (amp) {
        this.decayAmp = this.flipScale(amp);
        this.updateDynamics();
    },
    getDecayAmp: function () {
        return this.decayAmp
    },

    generateADS: function (attR, attA, decR, decA) {
        this.setAttackRate(attR);
        this.setAttackAmp(attA);
        this.setDecayRate(decR);
        this.setDecayAmp(decA)
    },

}

// Dynamics fluid animation
// gsap.to(dynamics, {attackRate: 1, duration:1, onUpdate: function() {dynamics.updateDynamics()}})
// TODO: clean this copyPasta up
let animateSetADS = function (attR, attA, decR, decA, duration) {
    //Logic needed again for making parameter input sane...
    if (attR < dynamics.getDecayRate()) {
        attR = attR;
    } else {
        attR = dynamics.getDecayRate();
    };

    attA = dynamics.flipScale(attA);

    if (decR > 0) {
        decR = decR + dynamics.getAttackRate();
    } else {
        decR = dynamics.getAttackRate();
    }

    decA = dynamics.flipScale(decA);

    gsap.to(dynamics, {
        attackRate: attR,
        attackAmp: attA,
        decayRate: decR,
        decayAmp: decA,
        duration: duration,
        onUpdate: function () {
            dynamics.updateDynamics()
        }
    });
}

// Predefined dynamic staves for parts.
let dynamicPreset = {
    currentDynamic: "",
    partDynamicsArrayPosition: 0,
    "a1": () => animateSetADS(3, 10, 6, 7, 1),
    "a2": () => animateSetADS(1, 10, 2, 3, 1),
    "a3": () => animateSetADS(1, 10, 2, 9.5, 1),
    
    "short attack, short decay, F sustain": () => animateSetADS(1, 10, 1, 8, 1),
    "short attack, short decay, M sustain": () => animateSetADS(1, 10, 1, 5, 1),
    "short attack, short decay, M sustain, long change": () => animateSetADS(1, 10, 1, 5, 10),
    "short attack, short decay, P sustain": () => animateSetADS(1, 10, 1, 3, 1),
    "short attack, short decay, P sustain, long change": animateSetADS(1, 10, 1, 3, 10),

    "short attack, long decay, F sustain": () => animateSetADS(1, 10, 3, 8, 1),
    "short attack, long decay, F sustain, long change": () => animateSetADS(1, 10, 3, 8, 10),
    "short attack, long decay, M sustain, long change": () => animateSetADS(1,10,3,5,10),
    "short attack, long decay, P sustain": () => animateSetADS(1, 10, 3, 3, 1),

    "short attack, mid decay, M sustain": () => animateSetADS(1, 10, 3, 8, 1),

    "mid attack, mid decay, F sustain": () => animateSetADS(3, 10, 3, 8, 1),
    "mid attack, mid decay, M sustain": () => animateSetADS(3, 10, 3, 5, 1),
    "mid attack, mid decay, P sustain": () => animateSetADS(3, 10, 3, 3, 1),

    "long attack, mid decay, F sustain": () => animateSetADS(8, 10, 3, 8, 1),
    "long attack, mid decay, M sustain": () => animateSetADS(8, 10, 3, 5, 1),

    "final dim": () => animateSetADS(3,4,3,1,22),

    "end of piece": () => animateSetADS(0,0,0,0,1)
}

// Reset dynamic array to current viewboxX1
let updateDynamics = function () {
    let x1 = getViewBoxX1()
    if (partChosen.partDynamics) {
        for (let i = 0; i < partChosen.partDynamics.length - 1; i++) {
            if (inRange(partChosen.partDynamics[i][0], partChosen.partDynamics[i + 1][0], x1)) {
                // console.log(x1 + " falls in range of index " + i);
                partChosen.partDynamicsArrayPosition = i;

                if (dynamicPreset.currentDynamic != partChosen.partDynamics[i][1]) {
                    dynamicPreset[partChosen.partDynamics[i][1]]();

                    dynamicPreset.currentDynamic = partChosen.partDynamics[i][1];
                }
            }
        }
    }
}

//////////////////////////////////
// Create Part ViewBox values   //
//////////////////////////////////
// ViewBox magic numbers were found using inkscape.
// Create a rectangle the width and height you want to display (2nd pair of coords in viewBox)
// Align rectangle with stave in inkscape and use the numbers in the top coordinate bar while in the move tool.
// 
// improve part creation attackAmp using less magic numbers,
//      ie: individual parts share x1,x2,x3 of start and end

let viewBoxDim = {
    x1: 0,
    x2: 1000,
    y2: 550
}

// All Parts
let allParts = {
    start: "0 140 5000 2635",
    end: "288000 140 5000 2635"
}
// part specific dynamics should entered here::

// Bass Part
let bassPerformer = {
    start: "0 127.188 1000 550",
    end: "288000 127.188 1000 550"
}

// Performer 1 Part
let performer1 = {
    start: "0 654.813 1000 550",
    end: "288000 654.813 1000 550",
    partDynamics: [
        // [ xPosition at end of dynamic section, dynamic preset to call ], must include end of piece entry
        [0, "mid attack, mid decay, F sustain"],
        [13800, "short attack, short decay, F sustain"],
        [20800, "mid attack, mid decay, F sustain"],
        //R1
        [34700, "short attack, short decay, F sustain"],
        [35914, "short attack, long decay, M sustain, long change"],
        [46587, "short attack, short decay, M sustain"],
        [53021, "short attack, short decay, P sustain"],
        //R2
        [73330, "mid attack, mid decay, F sustain"],
        [79150, "short attack, short decay, F sustain"],
        [86600, "long attack, mid decay, F sustain"],
        [94250, "short attack, short decay, M sustain"],
        [98630, "short attack, short decay, P sustain, long change"],
        [102165, "long attack, mid decay, M sustain"],
        [121290, "short attack, short decay, M sustain"],
        //R3
        [141777, "mid attack, mid decay, F sustain"],
        [147400, "mid attack, mid decay, M sustain"],
        [153500, "short attack, mid decay, M sustain"],
        [179000, "short attack, short decay, M sustain"],
        //R4
        [217000, "long attack, mid decay, M sustain"],
        //R5
        [249000, "short attack, short decay, M sustain"],
        [279000, "final dim"],
        [287600, "end of piece"],
        [288000, "end of piece"]
    ]
}
// Performer 2 Part
let performer2 = {
    start: "0 1182.438 1000 550",
    end: "288000 1182.438 1000 550",
    partDynamics: [
        [0, "mid attack, mid decay, F sustain"],
        [13600, "short attack, short decay, F sustain"],
        [16960, "short attack, long decay, F sustain"],
        [27800, "short attack, short decay, F sustain"],
        //R1
        [31503, "short attack, long decay, M sustain, long change"],
        [40380, "short attack, short decay, M sustain"],
        [40500, "short attack, short decay, P sustain, long change"],
        [44650, "short attack, long decay, F sustain, long change"],
        [53021, "short attack, short decay, P sustain"],
        [56190, "mid attack, short decay, P sustain"],
        [59937, "short attack, long decay, F sustain, long change"],
        //R2
        [73330, "mid attack, mid decay, F sustain"],
        [78500, "short attack, short decay, M sustain"],
        [98630, "short attack, short decay, F sustain"],
        [117670, "short attack, short decay, M sustain, long change"],
        //R3
        [134850, "short attack, short decay, F sustain"],
        [141777, "mid attack, mid decay, F sustain"],
        [147400, "short attack, short decay, M sustain"],
        [149000, "long attack, mid decay, F sustain"],
        [162530, "short attack, short decay, M sustain, long change"],
        //R4
        [211600, "short attack, long decay, F sustain, long change"],
        [215600, "short attack, short decay, F sustain"],
        //R5
        [235500, "short attack, short decay, M sustain"],
        [279000, "final dim"],
        [287600, "end of piece"],
        [288000, "end of piece"]
    ]
}
// Performer 3 Part
let performer3 = {
    start: "0 1710.063 1000 550",
    end: "288000 1710.063 1000 550",
    partDynamics: [
        [0, "mid attack, mid decay, F sustain"],
        [8700, "short attack, short decay, F sustain"],
        [23200, "short attack, long decay, F sustain"],
        //R1
        [36300, "short attack, short decay, M sustain"],
        [44600, "short attack, long decay, F sustain"],
        [47335, "short attack, short decay, F sustain"],
        [53021, "short attack, short decay, P sustain"],
        [56190, "mid attack, mid decay, F sustain"],
        [60000, "short attack, short decay, M sustain, long change"],
        //R2
        [73330, "mid attack, mid decay, F sustain"],
        [82225, "short attack, short decay, F sustain"],
        [86570, "short attack, short decay, M sustain"],
        [91591, "mid attack, mid decay, F sustain"],
        [94905, "short attack, short decay, P sustain"],
        [98630, "long attack, mid decay, F sustain"],
        [121290, "short attack, short decay, M sustain"],
        //R3
        [134364, "long attack, mid decay, F sustain"],
        //R4
        [215600, "long attack, short decay, F sustain"],
        //R5
        [279000, "final dim"],
        [287600, "end of piece"],
        [288000, "end of piece"]
    ]
}
// Performer 4 Part
let performer4 = {
    start: "0 2237.688 1000 550",
    end: "288000 2237.688 1000 550",
    partDynamics: [
        [0, "mid attack, mid decay, F sustain"],
        //R1
        [32000, "short attack, short decay, M sustain"],
        [37000, "mid attack, mid decay, M sustain"],
        [41500, "short attack, long decay, M sustain, long change"],
        [53021, "short attack, short decay, P sustain"],
        [56190, "short attack, short decay, M sustain, long change"],
        //R2
        [73330, "mid attack, mid decay, F sustain"],
        [79150, "short attack, short decay, F sustain"],
        [84563, "long attack, mid decay, F sustain"],
        [98630, "short attack, short decay, F sustain"],
        [117670, "short attack, short decay, M sustain, long change"],
        //R3
        [134850, "long attack, mid decay, F sustain"],
        [138730, "short attack, short decay, F sustain"],
        [163280, "long attack, mid decay, F sustain"],
        [170250, "short attack, short decay, F sustain"],
        //R4
        [220600, "long attack, mid decay, F sustain"],
        //R5
        [241000, "short attack, mid decay, M sustain"],
        [258900, "short attack, short decay, F sustain"],
        [279000, "final dim"],
        [287600, "end of piece"],
        [288000, "end of piece"]
    ]
}

/////////////////////////////////////////////////////////////
// Generic Part Object to load Part ViewBox values into
// TODO: this object should contain all dynamics

let part = {
    viewBox: {
        start: "",
        end: ""
    },
    dynamics: null,
    gsapTo: null,

    initView: function () {
        score.setAttribute("viewBox", this.viewBox.start);
    },

    set: function (performer) {
        this.viewBox.start = performer.start;
        this.viewBox.end = performer.end;
        this.gsapTo = gsap.to(
            "#fullScore", {
                attr: {
                    viewBox: performer.end
                },
                duration: pieceDuration,
                repeat: 0,
                ease: "none"
            }
        );
        // Timeline clear and add newly created part
        tl.clear();
        tl.pause();
        tl.add(this.gsapTo);
        this.initView();
    }
}

//////////////////////////////////////
// Create part and init all things  //
//////////////////////////////////////

const performerMenu = document.querySelector("#performerMenu");
const performerLoad = document.querySelector("#performerLoad");

let loadPerformer = function () {
    timeOnClick = tl.totalTime();
    isActive = tl.isActive();
    performerValue = performerMenu.value
    partChosen = "";
    switch (performerValue) {
        case "allParts":
            partChosen = allParts;
            document.querySelector("#playLine").setAttribute("style", "z-index:100; position:absolute; width: 7.6%; height: 90%;"); //Ugly way to resize playLine
            document.querySelector("#ds").setAttribute("class", "hidden"); // toggle hidden for dynamics stave
            break;
        case "bassPerformer":
            partChosen = bassPerformer;
            document.querySelector("#ds").setAttribute("class", "hidden"); // toggle hidden for dynamics stave
            break;
        case "performer1":
            partChosen = performer1;
            break;
        case "performer2":
            partChosen = performer2;
            break;
        case "performer3":
            partChosen = performer3;
            break;
        case "performer4":
            partChosen = performer4;
            break;
        default:
            break;
    }
    //console.log(performerValue);
    if (performerValue != "allParts") {
        //Ugly way to resize playLine
        document.querySelector("#playLine").setAttribute("style", "z-index:100; position:absolute; width: 37.4%; height: 100%;");
        if (performerValue != "bassPerformer") {
            document.querySelector("#ds").setAttribute("class", "");
        } // toggle hidden for dynamics stave
    }
    part.set(partChosen);
    tl.totalTime(timeOnClick);
    updateDynamics();
    if (isActive) {
        tl.play()
    };
};

performerLoad.onclick = function () {
    loadPerformer();
}

// init all parts
loadPerformer()

//////////////////////
// rehearsal marks  //
//////////////////////
// TODO: convert time to SVG coordinates
const rehearsalMarkMenu = document.querySelector("#rehearsalMarkMenu");
const rehearsalMarkSeek = document.querySelector("#rehearsalMarkSeek");

// Values found attackAmp nearest guess using minutes:seconds from notation software, then refined using totalTime() in browser
seekToMark = function (mark) {
    //    console.log(rehearsalMarkMenu.value);
    switch (mark) {
        case "R0":
            tl.totalTime(0);
            break;
        case "R1":
            tl.totalTime(90.709);
            break;
        case "R2":
            tl.totalTime(215.176);
            break;
        case "R3":
            tl.totalTime(392);
            break;
        case "R4":
            tl.totalTime(534.525);
            break;
        case "R5":
            tl.totalTime(690.268);
            break;
        default:
            break;
    }
    updateDynamics();
}

rehearsalMarkSeek.onclick = function () {
    mark = rehearsalMarkMenu.value;
    if (isConductor) {
        webSocket.emit("conductorRehearsalMark", mark);
    } else {
        seekToMark(mark);
    }
};



////////////////////////
// Playback Functions //
////////////////////////

playScore = function () {
    updateDynamics();
    tl.timeScale(1);
    tl.play();
}

pauseScore = function () {
    tl.pause();
}

fastBack = function () {
    //If timeline is NOT active(ie:playing), start playing, then set timeScale()
    if (!tl.isActive()) {
        tl.play();
    }
    tl.timeScale(-5);
}

fastForward = function () {
    if (!tl.isActive()) {
        tl.play();
    }
    tl.timeScale(5);
}

//////////////////////
// Playback Buttons //
//////////////////////
const play = document.querySelector("#play");
const pause = document.querySelector("#pause");
const speedBackward = document.querySelector("#speedBackward");
const speedForward = document.querySelector("#speedForward");

play.onclick = function () {
    if (isConductor) {
        webSocket.emit("conductorSays", "play");
    } else {
        playScore();
    }
}

pause.onclick = function () {
    if (isConductor) {
        webSocket.emit("conductorSays", "pause");
    } else {
        pauseScore();
    }
}

speedBackward.onclick = function () {
    fastBack();
}
speedForward.onclick = function () {
    fastForward();
}

//////////////////////////////////////
// Server message receive and act   //
//////////////////////////////////////

webSocket.on("serverSays", (arg) => {
    console.log("Server Says: " + arg);
    switch (arg) {
        case "play":
            playScore();
            break;
        case "pause":
            pauseScore();
            break;
        default:
            break;
    };
})
webSocket.on("serverRehearsalMark", (arg) => {
    seekToMark(arg);
})


///////////////////
// Dynamic Check

/////
// Collect all Part dynamics into an array
let allPartDynamics = [performer1.partDynamics, performer2.partDynamics, performer3.partDynamics, performer4.partDynamics];
// Returns all part dynamics at current ViewBoxX1 position
let getAllDynamics = function () {
    let x1 = getViewBoxX1();

    console.log("-------------------------------------------");
    console.log("At ViewboxX1 = " + x1 + " the dynamics are:");

    for (let j = 0; j < allPartDynamics.length; j++) {
        for (let i = 0; i < allPartDynamics[j].length - 1; i++) {
            if (inRange(allPartDynamics[j][i][0], allPartDynamics[j][i + 1][0], x1)) {
                console.log("Part " + (j+1) + " dynamic is: " + allPartDynamics[j][i][1]);
            }
        }
    }
}

// TODO: show all dynamics for whole score view...
// Going to need some serious refactoring of individual part dynamics
// create new dynamics object and treat it as such, make the animate function object specific
// STOP MIXING OOP with whatever it is you're doing!


/// Dom Button

let logAllDynamicsButton = document.querySelector("#getAllParts");
logAllDynamicsButton.onclick = function () { getAllDynamics()}