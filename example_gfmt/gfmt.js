var exp;
var conditions;

function preload(){
    conditions = [];
    for (var i =1; i<7; i++){
        conditions.push({'image' : loadImage('faces/' + i + '.jpg'),
                         'rotation' : (i % 2) * 180});
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    var instr = new Routine();
    instr.addComponent(new TextStimulus(
        '\
        Welcome to our little experiment! \n  \
        Press Q if the faces are the same \n \
        Press W if the faces are different \n \
        Press ENTER to start an experiment! \n \
        '
    ));
    instr.addComponent(new KeyboardResponse());

    var trials = new Loop(conditions, 2);
    var displayGFMTStimulus = new Routine();
    displayGFMTStimulus.addComponent(new ImageStimulus(function () {return trials.currentTrial['image'];},
                                                       function () {return trials.currentTrial['rotation'];}));
    displayGFMTStimulus.addComponent(new KeyboardResponse([113, 119]));

    var interStimuliBreak = new Routine();
    interStimuliBreak.addComponent(new TextStimulus('Next trial will start in a moment', 32, [0.5, 0.5], [0,0,0], 500, 1700));

    trials.addRoutine(interStimuliBreak);
    trials.addRoutine(displayGFMTStimulus);

    var thanks = new Routine();
    thanks.addComponent(new TextStimulus('Thank you for your paricipation'));


    exp = new Experiment();

    exp.addRoutine(instr);
    exp.addRoutine(trials);
    exp.addRoutine(thanks);
    exp.start();
}

function draw() {
    exp.update();
}


function ImageStimulus(img, rotation = 0, pos = [0.5,0.5], timestart = 0, timestop = null){
    if (typeof img === "function"){
        this.img = img();
    } else{
        this.img = img;
    }

    if (typeof rotation === "function"){
        this.rotation = rotation();
    } else{
        this.rotation = rotation;
    }

    this.t_start = null;
    this.experiment = null;
    this.routine = null;
    this.posx = pos[0] * width;
    this.posy = pos[1] * height;
    this.finished = null;

    this.setExperiment = function(experiment){
        this.experiment = experiment;
    };

    this.setRoutine = function(routine){
        this.routine = routine;
    };

    this.draw = function(){
        if ((millis() - this.t_start > timestart)){
            if (timestop == null | (millis() - this.t_start) - timestop < 0 ){
                push();
                translate(this.img.width/2 + this.posx/2, this.img.height/2 + this.posy/2);
                console.log(this.rotation);
                rotate(radians(this.rotation));
                imageMode(CENTER);
                image(this.img, 0, 0);
                pop();

            }

        }
    };

    this.update = function(){
        if (typeof img === "function"){
            this.img = img();
        } else{
            this.img = img;
        }

        if (typeof rotation === "function"){
            this.rotation = rotation();
        } else{
            this.rotation = rotation;
        }
        if (timestop != null & (millis() - this.t_start) - timestop > 0 ){
            this.finished = true;
        }

        return true;
    };

    this.start = function(t_start){
        this.t_start = t_start;
        this.finished = false;
    };
}
