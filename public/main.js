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
gsap.ticker.fps(updateRate);

// let debugTime = document.querySelector("#debugPlayValue");

let tl = gsap.timeline({
    paused: true, //start paused for loading and sync
    onUpdate: () => {

        updateTrack++;
        // rate of dynamics update
        if (updateTrack % 30 == 0) {
            updateDynamics();
        }
        if (updateTrack % 60 && tl.isActive()) { //only check every second-ish and when timeline is active
            // timer.innerHTML = secondsToTime(tl.time()) + " / " + timerDuration; //timer is not accurate and causes confusion
            timer.innerHTML = ((Math.round((tl.totalProgress() * 100) * 10)/10).toFixed(1).toString() + "%").padStart(5, "00.0%"); //percentage of piece complete.

        }
        // debugTime.innerText = getViewBoxX1();
    }
});

/////////////////////
// PERFORMER PARTS //
/////////////////////
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
        [0, "short attack MF, short decay MF"],
        [13800, "short attack MP, short decay F"],
        [20800, "mid attack MF, long decay F"],
        [22350, "mid attack MP, short decay MP, long change"],
        //R1
        [31220, "long attack F, long decay MF, long change"],
        [34700, "short attack F, short decay MF"],
        [35914, "short attack MF, long decay MF, long change"],
        [46587, "short attack MF, short decay MP"],
        [53021, "short attack MF, short decay P"],
        //R2
        [73330, "mid attack F, mid decay F"],
        [79150, "short attack F, short decay F"],
        [86600, "long attack F, mid decay F"],
        [94250, "short attack F, short decay M"],
        [98630, "short attack F, short decay P, long change"],
        [102165, "long attack F, mid decay M"],
        [121290, "short attack F, short decay M"],
        //R3
        [137997, "long attack MP, mid decay P, 10 change"], // bass melody
        [147400, "long attack PP, mid decay MP"],
        [153400, "short attack P, mid decay PP"],
        [171700, "short attack P, long decay PP"],
        [179488, "short attack MP, long decay F, 20 change"],
        //R4
        [185100, "short attack MP, mid decay P"],
        [217000, "long attack P, mid decay PP"],
        [226154, "long attack MF, long decay MF, 12 change"],
        //R5
        [235500, "short attack MF, long decay MP"],
        [238262, "short attack MF, long decay MF, 5 change"],
        [240279, "short attack MF, long decay MP, 5 change"],        
        [242726, "short attack MF, long decay MF, 5 change"],
        [245496, "short attack MF, long decay MP, 5 change"],
        [249472, "short attack MF, long decay MF, 5 change"],
        [252164, "short attack MF, long decay MP, 5 change"],
        [254707, "short attack MF, long decay MF, 5 change"],
        [257621, "short attack MF, long decay MF, 4 change"],
        [267344, "long attack MF, mid decay MP, 4 change"],
        [274550, "long attack MF, mid decay F, 9 change"],

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
        [0, "long attack MF, long decay MP"],
        [13600, "short attack MP, short decay MP"],
        [16960, "short attack MP, long decay F"],
        [23350, "long attack F, long decay MF, long change"],
        [27800, "short attack MP, short decay MP"],
        //R1
        [30570, "short attack F, long decay MP, long change"],
        [35910, "short attack MF, long decay MF, 12 change"],
        [40500, "short attack MP, short decay P, long change"],
        [44650, "short attack F, long decay MF, long change"],
        [53021, "short attack F, short decay P"],
        [56190, "mid attack F, short decay P"],
        [59937, "short attack F, long decay MP, long change"],
        //R2
        [73330, "mid attack MP, mid decay MF"],
        [78500, "short attack MF, short decay MP"],
        [98630, "short attack MP, short decay MF"],
        [117670, "short attack MF, short decay MP, long change"],
        //R3
        [134850, "short attack F, short decay F"],
        [138570, "long attack MP, long decay P"], // bass melody
        [141777, "mid attack MP, mid decay PP"],
        [147400, "short attack MP, mid decay MP"],
        [150400, "long attack MF, mid decay P"],
        [155340, "long attack P, long decay PP, 12 change"],
        [160880, "long attack MF, long decay P, 15 change"],
        [165800, "short attack MP, short decay PP"],
        [171700, "short attack P, long decay PP, 10 change"],
        [181400, "short attack MF, long decay F, 20 change"],
        //R4
        [182795, "short attack MP, mid decay P, 21 change"],
        [210830, "short attack PP, long decay MP"],
        [232299, "short attack MP, long decay F, 7 change"],
        //R5
        [235500, "short attack F, long decay MF"],
        [238262, "short attack F, long decay FF, 5 change"],
        [240279, "short attack F, long decay MF, 5 change"],
        [242726, "short attack F, long decay FF, 5 change"],
        [245496, "short attack F, long decay MF, 5 change"],
        [249472, "short attack F, long decay FF, 5 change"],
        [252164, "short attack F, long decay MF, 5 change"],
        [254707, "short attack F, long decay FF, 5 change"],
        [257621, "short attack F, mid decay MF, 4 change"],
        [263319, "short attack F, mid decay FF, 4 change"],
        [265384, "long attack MF, mid decay MP"],

        [277523, "long attack MF, short decay F, 5 change"],


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
        [0, "long attack F, mid decay MF"],
        [8700, "short attack MP, long decay MP"],
        [17300, "short attack MF, long decay MP"],
        [23200, "short attack F, long decay F"],
        //R1
        [31220, "long attack FF, long decay MF"],
        [44600, "short attack F, long decay F"],
        [47335, "short attack F, short decay F"],
        [53021, "short attack F, short decay P"],
        [56190, "mid attack F, mid decay F"],
        [60000, "short attack F, short decay M, long change"],
        //R2
        [73330, "mid attack F, mid decay F"],
        [82225, "short attack F, short decay F"],
        [86570, "short attack F, short decay M"],
        [91591, "mid attack F, mid decay F"],
        [94905, "short attack F, mid decay P"],
        [98630, "long attack MP, long decay P, 9 change"],
        [121290, "short attack F, short decay M"],
        //R3
        [134364, "long attack F, long decay F"],
        [138555, "long attack P, long decay MP"], //bass melody
        [142000, "long attack P, long decay PP, 15 change"],
        [149750, "long attack P, long decay MP, 12 change"],
        [155340, "long attack P, long decay PP, 12 change"],
        [160880, "long attack MF, long decay P, 15 change"],
        [170800, "long attack MF, long decay MP, 15 change"],
        [179488, "short attack MF, long decay F, 20 change"],
        //R4
        [182795, "short attack MP, mid decay P, 21 change"],
        [213600, "short attack PP, long decay MP"],
        [226154, "long attack MF, long decay MF, 12 change"],
        [232299, "short attack MP, long decay F, 7 change"],
        //R5
        [238262, "short attack F, long decay FF, 5 change"],
        [240279, "short attack F, long decay MF, 5 change"],
        [242726, "short attack F, long decay FF, 5 change"],
        [245496, "short attack F, long decay MF, 5 change"],
        [249472, "short attack F, long decay FF, 5 change"],
        [252164, "short attack F, long decay MF"],
        [254707, "short attack F, long decay FF, 5 change"],
        [257621, "short attack F, mid decay MF, 4 change"],
        [266690, "long attack MF, mid decay MP, 2 change"],
        [276813, "long attack MF, mid decay F, 6 change"],


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
        [0, "long attack F, mid decay MF"],
        [14400, "mid attack MP, long decay MF"],
        [21356, "mid attack MP, long decay F, long change"],
        [23530, "mid attack MP, long decay MP, long change"],
        //R1
        [32000, "short attack F, long decay F, 10 change"],
        [35530, "short attack F, long decay P, long change"],
        [37000, "mid attack MP, long decay MF"],
        [41100, "short attack MF, long decay MF"],
        [45330, "long attack F, long decay FF"],
        [49427, "long attack F, long decay MP, 10 change"],
        [53021, "short attack F, short decay P, 10 change"],
        [56190, "short attack F, short decay MF, 10 change"],
        [59989, "mid attack MP, short decay P, 17 change"],

        //R2
        [73330, "mid attack MP, mid decay MF, long change"],
        [79480, "short attack MF, short decay F, 10 change"],
        [84563, "long attack MF, mid decay F, 12 change"],
        [98630, "short attack MP, short decay MP"],
        [117670, "short attack MF, short decay P, 10 change"],
        //R3
        [134850, "long attack F, mid decay F"],
        [138565, "short attack MP, mid decay P"], // bass melody
        [142000, "long attack MP, long decay PP, 12 change"],
        [151775, "long attack P, long decay MP, 12 change"],
        [163280, "long attack MP, long decay PP"],
        [163280, "long attack MP, long decay MF, 10 change"],
        [170250, "short attack MF, short decay MP"],
        [181900, "short attack MF, long decay F"],
        //R4
        [182795, "short attack MP, mid decay P, 21 change"],
        [220300, "long attack MF, long decay P"],
        [226154, "long attack MF, long decay MF, 12 change"],
        [232299, "short attack MP, long decay F, 7 change"],
        //R5
        [238262, "short attack F, long decay FF, 5 change"],
        [240279, "short attack F, long decay MF, 5 change"],
        [242726, "short attack F, long decay FF, 5 change"],
        [245496, "short attack F, long decay MF, 5 change"],
        [249472, "short attack F, long decay FF, 5 change"],
        [252164, "short attack F, long decay MF, 5 change"],
        [254707, "short attack F, long decay FF, 5 change"],
        [257621, "short attack F, mid decay MF, 4 change"],
        [263319, "short attack F, mid decay FF, 4 change"],
        [265384, "long attack MF, mid decay MP"],

        [274550, "long attack MF, short decay F, 9 change"],

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
                        // dynamicPreset[partChosen.partDynamics[i][1]](); //orig
                        parseStringEnvelope(partChosen.partDynamics[i][1]);
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
