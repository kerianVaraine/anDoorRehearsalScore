////////////////////
// Dynamics stave //
////////////////////
/* svg path id = #ads
 default set at: d="M 0.2,10 7.0,0.2 12.0,4.15 H 30"
 params as : d = "M ax,ay attackRate,attackAmp decayRate,decayAmp H 30"
// */

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
    partDynamicsArrayPosition: 0, // for individual part dynamic display logic //Depreciated

}

//attempt to modularise this more
// ff = 10, f= 8, mf=6, mp=4, p = 2, pp = 1
// decay amp == sustain amp... damn.

// input ex; modAD("slow", "p", "slow", "f")

let rateParse = function (rate) {
    switch (rate.toLowerCase()) {
        case "short":
        case "fast":
            return 2;
            break;
        case "mid":
            return 5;
            break;
        case "slow":
        case "long":
            return 8;
            break;
        default:
            return 5;
            break;
    }
}

let ampParse = function (dynamicMark) {
    switch (dynamicMark.toLowerCase()) {
        case "ff":
            return 10;
            break;
        case "f":
            return 8;
            break;
        case "mf":
            return 6;
            break;
        case "mp":
            return 4;
            break;
        case "p":
            return 2;
            break;
        case "pp":
            return 1;
            break;
        default:
            return 5;
            break;
    }
}

let lerpDurationParse = function (duration) {
    let regEx = /\d+/;
    if(duration == ("fast" || "short")) {
        return 2;
    } else if (duration == "mid"){
        return 5;
} else if (duration == ("slow" || "long")){
    return 8;
} else if (regEx.test(duration)){
    return parseInt(duration);
} else return 1;

// switch (duration.toLowerCase()) {
//         case "fast":
//             return 2;
//             break;
//             case "mid":
//                 return 5;
//                 break;
//                 case "slow":
//                     case "long":
//                     return 8;
//                 break;
//                 case "":
//                     return 20;
//                 break;
//         default:
//             return 1;
//             break;
    // }
    
}
//takes strings, rate = long, mid, slow, amp = ff, f, mf, mp, p, pp, duration == seconds
let modAD = function (attackRate, attackAmp, decayRate, decayAmp, duration) {
    attackRate = rateParse(attackRate);
    attackAmp = ampParse(attackAmp);

    decayRate = rateParse(decayRate);
    decayAmp = ampParse(decayAmp);

    duration = lerpDurationParse(duration);
    animateSetADS(attackRate, attackAmp, decayRate, decayAmp, duration);
}

//Very particular about how you call it, but should still display nice in full score view...
// input: parseStringEnvelope("slow attack P, slow decay f, slow change")
// output: modAD("slow", "p", "slow", "f", "long")
// special cases: ["final dim"],
        //        ["end of piece"],
        //        ["end of array"]
let parseStringEnvelope = function (instruction) {
    if (instruction == ["final dim"]) {
        animateSetADS(3, 4, 3, 1, 22);
    } else if (instruction == ["end of piece"] || instruction == ["end of array"]) {
        animateSetADS(0, 0, 0, 0, 1);
    } else {
        // input "slow attack P, slow decay f, slow change"
        let allWords = instruction.toLowerCase().split(','); //[ "slow attack p", " slow decay f", " slow change" ]
        let attack = allWords[0].trim().split(' '); // ["slow", "attack", "p"]
        let decay = allWords[1].trim().split(' '); // ["slow", "decay", "f"]
        let duration = ["1"];
        if (allWords.length == 3) {
            duration = allWords[2].trim().split(' '); //["slow", "change"];
        }
        modAD(attack[0], attack[2], decay[0], decay[2], duration[0]);
    }
}
