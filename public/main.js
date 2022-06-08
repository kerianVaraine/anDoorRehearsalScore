//  viewBox="0 0 288000 2879" original
// viewBox="0 0 1000 190"

//TODO: Create a Timer to display or performers using timeline totalProgress() function written at bottom


///////////////////////
// Socket.io         //
///////////////////////
// open connection to server
var webSocket = io();

///////////////////////
// anDoor Specific
///////////////////////
// Score reference
let score = document.getElementById("fullScore");

// Conductor checkbox
let isConductor = false;
let conductorSelect = document.getElementById("conductorSelect");
conductorSelect.onclick = function () {isConductor = !isConductor;} //Flips value on click


///////////////////////
// Timeline  Create  //
///////////////////////
let pieceDuration = (14 * 60) + 5; //14:30
let pieceProgress = 0;
let tl = gsap.timeline({
    paused: true, //start paused for loading and sync
});

////////////////////
// Dynamics stave //
////////////////////
/* svg path id = #ads
 default set at: d="M 0.2,10 7.0,0.2 12.0,4.15 H 30"
 params as : d = "M ax,ay attackRate,attackAmp decayRate,decayAmp H 30"
*/
let dynamics = {
    dynamicsStave : document.querySelector("#ads"),
    ax : 0.2,
    ay : 10.0,
    attackRate : 7.0,
    attackAmp : 0.2,
    decayRate : 12.0,
    decayAmp : 4.15,
    dString : function() {
        return "M " + this.ax + "," + this.ay + " " + this.attackRate + "," + this.attackAmp + " " + this.decayRate + "," + this.decayAmp + " H 30";
    },

    updateDynamics: function (){
        this.dynamicsStave.setAttribute("d", this.dString());
    },

    resetDefault: function(){
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
    setAttackRate: function(rate) {
        if(rate < this.getDecayRate()){
        this.attackRate = rate;
        } else {
            this.attackRate = this.getDecayRate();
        }
        this.updateDynamics();
    },
    getAttackRate: function() {return this.attackRate},

    setAttackAmp: function(amp) {this.attackAmp = this.flipScale(amp); this.updateDynamics();},
    getAttackAmp: function() {return this.attackAmp},

    setDecayRate: function(rate) {
        if(rate > 0){
        this.decayRate = rate + this.getAttackRate();
    } else {
        this.decayRate = this.getAttackRate();
    }
        this.updateDynamics();
    },
    getDecayRate: function() {return this.decayRate},

    setDecayAmp: function(amp) {this.decayAmp = this.flipScale(amp); this.updateDynamics();},
    getDecayAmp: function() {return this.decayAmp},

    generateADS: function(attR, attA, decR, decA) {this.setAttackRate(attR); this.setAttackAmp(attA); this.setDecayRate(decR); this.setDecayAmp(decA)},

}

// Dynamics fluid animation
// gsap.to(dynamics, {attackRate: 1, duration:1, onUpdate: function() {dynamics.updateDynamics()}})
let animateSetADS = function (attR, attA, decR, decA, duration) {
    //Logic needed again for making parameters sane...
    //Just copyPAsta from dynamics functions
    if(attR < dynamics.getDecayRate()){
        attR = attR;
        } else {
            attR = dynamics.getDecayRate();
    };

    attA = dynamics.flipScale(attA);

    if(decR > 0){
        decR = decR + dynamics.getAttackRate();
    } else {
        decR = dynamics.getAttackRate();
    }

    decA = dynamics.flipScale(decA);

    gsap.to(dynamics, {attackRate: attR, attackAmp: attA, decayRate: decR, decayAmp: decA, duration: duration, onUpdate: function() {dynamics.updateDynamics()}});
    console.log("animADS hit");
}

// Predefined dynamic staves for parts.
let dynamicPreset = {
    a1: () => animateSetADS(3,10,6,7,8),
    a2: () => animateSetADS(1,10,2,3,1),
    a3: () => animateSetADS(1,10,2,9.5,1)
}

// Dynamic changes on timeline
// Called when parts are created, but should be independent for parts
// take an array of dynamics and onset times, defined in each part.
let setDynamicsTime = function(timeline) {
    timeline.call(dynamicPreset.a1, null, 2)
    .call(dynamicPreset.a2, null, 12);
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

let viewBoxDim = {x1:0, x2 : 1000, y2: 550}

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
    end: "288000 654.813 1000 550"
}
// Performer 2 Part
let performer2 = {
    start: "0 1182.438 1000 550",
    end: "288000 1182.438 1000 550"
}
// Performer 3 Part
let performer3 = {
    start: "0 1710.063 1000 550",
    end: "288000 1710.063 1000 550"
}
// Performer 4 Part
let performer4 = {
    start: "0 2237.688 1000 550",
    end: "288000 2237.688 1000 550"
}

/////////////////////////////////////////////////////////////
// Generic Part Object to load Part ViewBox values into

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
        setDynamicsTime(tl); // part specific dynamics called here
        this.initView();
    }
}

//////////////////////////////////////
// Create part and init all things  //
//////////////////////////////////////

const performerMenu = document.querySelector("#performerMenu");
const performerLoad = document.querySelector("#performerLoad");

let loadPerformer = function() {
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
        if(performerValue != "bassPerformer") {
            document.querySelector("#ds").setAttribute("class", "");
    } // toggle hidden for dynamics stave
    }
    part.set(partChosen);
    tl.totalTime(timeOnClick);
    if (isActive) {
        tl.play()
    };
};

performerLoad.onclick = function () {loadPerformer();}

// init all parts
loadPerformer()

//////////////////////
// rehearsal marks  //
//////////////////////
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
}

rehearsalMarkSeek.onclick = function () {
    mark = rehearsalMarkMenu.value;
    if(isConductor){
        webSocket.emit("conductorRehearsalMark", mark);
    } else {
        seekToMark(mark);
    }
};



////////////////////////
// Playback Functions //
////////////////////////

playScore = function () {
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

play.onclick = function(){
    if(isConductor) {
        webSocket.emit("conductorSays", "play");
    } else {
    playScore();
    }
}

pause.onclick = function () {
    if(isConductor){
        webSocket.emit("conductorSays", "pause");
    } else {
        pauseScore();
    }
}

speedBackward.onclick = function () {fastBack();}
speedForward.onclick = function () {fastForward();}

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


