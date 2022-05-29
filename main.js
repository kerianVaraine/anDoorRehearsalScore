//  viewBox="0 0 288000 2879" original
// viewBox="0 0 1000 190"

//TODO: Create a Timer to display or performers using timeline totalProgress() function written at bottom
//TODO: change speed using timeScale(), so pieceDuration never changes from the set time.

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
    part.set(eval(performerMenu.value)); // I know this using eval() is bad, but it will do for now.
};



//////////////////////
// rehearsal marks  //
//////////////////////
const rehearsalMarkMenu = document.querySelector("#rehearsalMarkMenu");
const rehearsalMarkSeek = document.querySelector("#rehearsalMarkSeek");

rehearsalMarkSeek.onclick = function(){
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

//////////////////////
// Playback Buttons //
//////////////////////
const play = document.querySelector("#play");
const pause = document.querySelector("#pause");
const resume = document.querySelector("#resume");

play.onclick = function() {
    tl.play();
}

pause.onclick = function() {
    tl.pause();
 }


// Timeline ideas from manual
//
// Get or set the progress of the timeline using its progress() or totalProgress() methods (totalProgress() just includes any repeats). For example, to skip to the halfway point, set myTimeline.progress(0.5);.
//
// Tween the time(), totalTime(), progress(), or totalProgress() to fast-forward or rewind the timeline. You could even attach a slider to one of these to give the user the ability to drag forward or backward through the timeline.