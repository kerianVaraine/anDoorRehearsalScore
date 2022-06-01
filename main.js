//  viewBox="0 0 288000 2879" original
// viewBox="0 0 1000 190"

//TODO: Create a Timer to display or performers using timeline totalProgress() function written at bottom
//TODO: change speed using timeScale(), transport functions 5xrewind 1xrewind pause play1x play5x

// Score reference
let score = document.getElementById("fullScore");

///////////////////////
// Timeline  Create  //
///////////////////////
let pieceDuration = (14*60)+40;
let pieceProgress = 0;
let tl = gsap.timeline({
    paused:true,                //start paused for loading and sync
    // onUpdate: function(){ pieceProgress = this.totalProgress(); }
    }); 

//////////////////////////////////
// Create Part ViewBox values   //
//////////////////////////////////

// All Parts
let allParts = {
    start: "0 240 5000 2400",
    end: "288000 240 5000 2400"
}

// Bass Part
let bassPerformer = {
    start: "0 250 1000 300",
    end: "288000 250 1000 300"
}

// Performer 1 Part
let performer1 = {
    start: "0 800 1000 300",
    end: "288000 800 1000 300"
}
// Performer 2 Part
let performer2 = {
    start: "0 1300 1000 300",
    end: "288000 1300 1000 300"
}
// Performer 3 Part
let performer3 = {
    start: "0 1850 1000 300",
    end: "288000 1850 1000 300"
}
// Performer 4 Part
let performer4 = {
    start: "0 2350 1000 300",
    end: "288000 2350 1000 300"
}

/////////////////////////////////////////////////////////////
// Generic Part Object to load Part ViewBox values into

let part = {
    viewBox : {
        start: "",
        end: ""
    },
    gsapTo : null,
    
    initView : function () {
        score.setAttribute("viewBox", this.viewBox.start);
    },

    set : function (performer){
        this.viewBox.start = performer.start;
        this.viewBox.end = performer.end;
        this.gsapTo =  gsap.to(
            "#fullScore", {
            attr: {
                viewBox: performer.end
            },
            duration: pieceDuration,
            repeat: 0,
            ease: "none"
            }
        );
            // Timelineclear and add newly created part
        tl.clear();
        tl.pause();
        tl.add(this.gsapTo);
        this.initView();
    }
}

//////////////////////////////////////
// Create part and init all things  //
//////////////////////////////////////
// default to bass, TODO: make default to whole score?
part.set(bassPerformer);

const performerMenu = document.querySelector("#performerMenu");
const performerLoad = document.querySelector("#performerLoad");


performerLoad.onclick = function(){
    timeOnClick = tl.totalTime();
    isActive = tl.isActive();
    performerValue = performerMenu.value
    partChosen = "";
    switch (performerValue) {
        case "allParts":
            partChosen = allParts;
            document.querySelector("#playLine").setAttribute("style", "z-index:100; position:absolute; width: 7.6%; height: 90%;");
            //Ugly way to resize playLine
            break;
        case "bassPerformer":
            partChosen = bassPerformer;
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
console.log(performerValue);
    if(performerValue != "allParts") {
        //Ugly way to resize playLine
        document.querySelector("#playLine").setAttribute("style", "z-index:100; position:absolute; width: 37.4%; height: 60%;");

        
    }
    part.set(partChosen);
    tl.totalTime(timeOnClick);
    if(isActive) {tl.play()};
    
};

//////////////////////
// rehearsal marks  //
//////////////////////
const rehearsalMarkMenu = document.querySelector("#rehearsalMarkMenu");
const rehearsalMarkSeek = document.querySelector("#rehearsalMarkSeek");

// Values found by nearest guess using minutes:seconds from notation software, then refined using totalTime() in browser
 test = function(){
    console.log(rehearsalMarkMenu.value);
    switch (rehearsalMarkMenu.value) {
        case "R0":
            tl.totalTime(0);
            break;            
        case "R1":
            tl.totalTime(94);
                break;
        case "R2":
            tl.totalTime(224);
            break;
        case "R3":
            tl.totalTime(408);
            break;
        case "R4":
            tl.totalTime(557);
            break;
        case "R5":
            tl.totalTime(718.5);
            break;
        default:
            break;
    } 
}
rehearsalMarkSeek.onclick = function(){test()};




//////////////////////
// Playback Buttons //
//////////////////////
const play = document.querySelector("#play");
const pause = document.querySelector("#pause");
const speedBackward = document.querySelector("#speedBackward");
const speedForward = document.querySelector("#speedForward");

play.onclick = function() {
    tl.timeScale(1);
    tl.play();
}

pause.onclick = function() {
    tl.pause();
 }


 //If timeline is NOT active(ie:playing), start playing, then set timeScale()
 speedBackward.onclick = function(){
    if(!tl.isActive()){
        tl.play();
    } 
    tl.timeScale(-5);
 }
 
 speedForward.onclick = function(){
    if(!tl.isActive()){
        tl.play();
    } 
    tl.timeScale(5);
 }