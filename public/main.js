///////////////////////
// Socket.io         //
///////////////////////
// open connection to server
var webSocket = io();

/////////////////////
// anDoor Specific //
/////////////////////
//
// Score reference
let score = document.getElementById("fullScore"); // also used in load performer part
let partStave = document.getElementById("partStave"); // for loading of parts stave and clef
let getScoreViewBox = function () {
    return score.attributes.viewBox.value.split(" ")
};

// x axis value of svg viewbox.
let viewBoxX1 = 0;
let getViewBoxX1 = function () {
    return parseInt(getScoreViewBox()[0]);
}

// Helpers
let inRange = function (low, high, x) {
    return (low <= x && x <= high);
}

// Conductor checkbox
let isConductor = false;
let conductorSelect = document.getElementById("conductorSelect");
conductorSelect.onclick = function () {
    isConductor = !isConductor; //Flips value on click
    if(isConductor){
        document.querySelector("#conductorText").innerText = "You are a conductor: playback and rehearsal mark controls effect all online users.";
    } else {
        document.querySelector("#conductorText").innerText = "";
    }
} 

///////////////////////
// Timeline  Create  //
///////////////////////
let pieceDuration = (14 * 60) + 5; //14:30

let timer = document.querySelector("#timer");
let timerDuration = "14:04";
timer.innerHTML = "00.0%"; //init default text
let secondsToTime = function(seconds){
    return new Date(seconds*1000).toISOString().substring(14,19);
}



let updateRate = 60; // rate to update viewbox X1 position in timeline.onUpdate function
let updateTrack = 0; // modulo track time for timeline.onUpdate function
// let debugTime = document.querySelector("#debugPlayValue");
gsap.ticker.fps(updateRate);

let tl = gsap.timeline({
    paused: true, //start paused for loading and sync
    onUpdate: () => {

        updateTrack++;
        // rate of dynamics update
        if (updateTrack % 60 == 0) {
            updateDynamics();
        }
        if (updateTrack % 60 && tl.isActive()) { //only check every second-ish and when timeline is active
            // timer.innerHTML = secondsToTime(tl.time()) + " / " + timerDuration; //timer is not accurate and causes confusion
            timer.innerHTML = ((Math.round((tl.totalProgress() * 100) * 10)/10).toFixed(1).toString() + "%").padStart(5, "00.0%"); //percentage of piece complete.
        }
        // debugTime.innerText = getViewBoxX1();
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

    updateADSGraph: function () {
        this.dynamicsStave.setAttribute("d", this.dString());
    },

    resetDefault: function () {
        this.ax = 0.2,
            this.ay = 10.0,
            this.attackRate = 7.0,
            this.attackAmp = 0.2,
            this.decayRate = 12.0,
            this.decayAmp = 4.15,
            this.updateADSGraph();
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
        this.updateADSGraph();
    },
    getAttackRate: function () {
        return this.attackRate
    },

    setAttackAmp: function (amp) {
        this.attackAmp = this.flipScale(amp);
        this.updateADSGraph();
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
        this.updateADSGraph();
    },
    getDecayRate: function () {
        return this.decayRate
    },

    setDecayAmp: function (amp) {
        this.decayAmp = this.flipScale(amp);
        this.updateADSGraph();
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
// TODO: clean this copyPasta up, and integrate with dynamics object
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
            dynamics.updateADSGraph()
        }
    });
}

// Predefined dynamic staves for parts.
let dynamicPreset = {
    currentDynamic: "", // check to avoid dynamic display update 
    partDynamicsArrayPosition: 0, // for individual part dynamic display logic

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
    "long attack, short decay, F sustain": () => animateSetADS(8,10,1,8,1),

    "final dim": () => animateSetADS(3,4,3,1,22),

    "end of piece": () => animateSetADS(0,0,0,0,1)
}

////////////////////////////////
// Part Specific information  //
////////////////////////////////
/* 
ViewBox magic numbers were found using inkscape.
    Create a rectangle the width and height you want to display (2nd pair of coords in viewBox)
    Align rectangle with stave in inkscape and use the numbers in the top coordinate bar while in the move tool.

Dynamics are entered following this convention:
    [ xPosition at end of dynamic section, dynamic preset to call ]
    must include an end of array dummy call to avoid out of bounds error
*/

// Bass Part
let bassPerformer = {
    start: "0 127.188 1000 550",
    end: "288000 127.188 1000 550",
    clef: "./assets/Score/clefBass.svg",
    // staveToFetch: "./assets/Score/BassStave.svg",
    scoreToFetch: "./assets/Score/BassPart.svg" 
}

// Performer 1 Part
let performer1 = {
    start: "0 654.813 1000 550",
    end: "288000 654.813 1000 550",
    clef: "./assets/Score/clefTreble.svg",
    // staveToFetch: "./assets/Score/Violin1Stave.svg",
    scoreToFetch: "./assets/Score/Violin1Part.svg", 
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
        [288000, "end of array"]
    ]
}
// Performer 2 Part
let performer2 = {
    start: "0 1182.438 1000 550",
    end: "288000 1182.438 1000 550",
    clef: "./assets/Score/clefTreble.svg",
    // staveToFetch: "./assets/Score/Violin2Stave.svg",
    scoreToFetch: "./assets/Score/Violin2Part.svg", 
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
        [288000, "end of array"]
    ]
}
// Performer 3 Part
let performer3 = {
    start: "0 1710.063 1000 550",
    end: "288000 1710.063 1000 550",
    clef: "./assets/Score/clefAlto.svg",
    // staveToFetch: "./assets/Score/ViolaStave.svg",
    scoreToFetch: "./assets/Score/ViolaPart.svg", 
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
        [288000, "end of array"]
    ]
}
// Performer 4 Part
let performer4 = {
    start: "0 2237.688 1000 550",
    end: "288000 2237.688 1000 550",
    clef: "./assets/Score/clefBass.svg",
    // staveToFetch: "./assets/Score/CelloStave.svg",
    scoreToFetch: "./assets/Score/CelloPart.svg", 
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
        [288000, "end of array"]
    ]
}

// All Parts, created at the end of performer list to collect dynamics from all parts.
let allParts = {
    start: "0 140 5000 2635",
    end: "288000 140 5000 2635",
    staveToFetch: "",
    scoreToFetch: "./assets/Score/FullScore.svg", 
    partDynamics: [performer1.partDynamics, performer2.partDynamics, performer3.partDynamics, performer4.partDynamics], // part dynamics collected in nested array for display
    dynamicDisplays: document.querySelector("#floatingTextDynamics").children, // HTML paragraph elements to display dynamics
}

/////////////////////////////////////////////////////////////
// Generic Part Object to load Part ViewBox values into
// TODO: this object could contain all dynamics

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
        // Loads and inserts the part.svg
        this.loadPart = (async () => {
            const clef = await (await fetch(performer.clef)).text();
            partStave.innerHTML = clef;
            const part = await (await fetch(performer.scoreToFetch)).text(); //fetch part
            score.innerHTML = part; //place part.svg into score div
        })();
        this.viewBox.start = performer.start;
        this.viewBox.end = performer.end;
        //define what is animated here.
        this.gsapTo = gsap.to(
            "#fullScore", {
                attr: {
                    viewBox: performer.end //this is the animated attribute
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

/////////////////////////////
// Dynamic display updates //
/////////////////////////////
// TODO: ideally include in dynamics object, will need a lot of "this."'s

let updateDynamics = function (x1) {
    if (typeof x1 === "undefined") {
        x1 = getViewBoxX1();
    }
    // Display dynamics if individual part chosen
    if (performerValue !== ("allParts" || "bassPerformer")) {
        if (partChosen.partDynamics) {
            for (let i = 0; i < partChosen.partDynamics.length - 1; i++) {
                if (inRange(partChosen.partDynamics[i][0], partChosen.partDynamics[i + 1][0], x1)) {
                    // console.log(x1 + " falls in range of index " + i);
                    partChosen.partDynamicsArrayPosition = i;

                    // avoid calling dynamic display change unless new dynamic is called
                    if (dynamicPreset.currentDynamic != partChosen.partDynamics[i][1]) {
                        dynamicPreset[partChosen.partDynamics[i][1]]();
                        dynamicPreset.currentDynamic = partChosen.partDynamics[i][1];
                    }
                }
            }
        }
    }
    // Display dynamic if whole score is displayed
    if (performerValue == "allParts") {
        for (let j = 0; j < allParts.partDynamics.length; j++) {
            for (let i = 0; i < allParts.partDynamics[j].length - 1; i++) {
                if (inRange(allParts.partDynamics[j][i][0], allParts.partDynamics[j][i + 1][0], x1)) {
                    // console.log("Part " + (j+1) + " dynamic is: " + allPartDynamics[j][i][1]);
                    allParts.dynamicDisplays[j].innerText = allParts.partDynamics[j][i][1];
                }
            }
        }
    }
}

//////////////////////////////////////
// Create part and init all things  //
//////////////////////////////////////

const performerMenu = document.querySelector("#performerMenu");

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
            document.querySelector("#floatingTextDynamics").setAttribute("class", ""); // toggle hidden for all dynamics text displays
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
        document.querySelector("#playLine").setAttribute("style", "z-index:100; position:absolute; width: 37.4%; height: 100%;"); // Ugly way to resize playLine
        document.querySelector("#floatingTextDynamics").setAttribute("class", "hidden"); // toggle hidden for all dynamics text displays
        if (performerValue != "bassPerformer") {
            document.querySelector("#ds").setAttribute("class", ""); // toggle hidden for dynamics stave
        } 
    }
    part.set(partChosen);
    tl.totalTime(timeOnClick);
    updateDynamics();
    if (isActive) {
        tl.play()
    };
};

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
            tl.totalTime(215.424);
            break;
        case "R3":
            tl.totalTime(392.268);
            break;
        case "R4":
            tl.totalTime(535.473);
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

// Performance Notes
performanceNotesState = false;
performanceNotes = document.querySelector("#performanceNotesDisplay");
performanceNotesButton = document.querySelector("#performanceNotesButton");

performanceNotesButton.onclick = function() {
    if (!performanceNotesState){
        performanceNotesButton.setAttribute("style", "background: #A44; color: #FFF");
    performanceNotes.setAttribute("class", "");
    document.querySelector("#scoreStage").setAttribute("class", "hidden");
    // inject svg here from external file
    (async () => {
        const perfNotesSVG = await (await fetch("./assets/performanceNotes.svg")).text();
        performanceNotes.innerHTML = perfNotesSVG;
    })();
    //
    }
    else {
        performanceNotesButton.setAttribute("style", "");
        performanceNotes.setAttribute("class", "hidden");
        performanceNotes.innerHTML = ''; //remove svg
    document.querySelector("#scoreStage").setAttribute("class", "");
    }
    performanceNotesState=!performanceNotesState;
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
