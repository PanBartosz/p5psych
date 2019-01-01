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
    thanks.addComponent(new TextStimulus('Thank you for your paricipation', 32, [0.5,0.5], [0,0,0], 0, 2000));


    exp = new Experiment('http://localhost:5000/saveData');

    exp.addRoutine(instr);
    exp.addRoutine(trials);
    exp.addRoutine(thanks);
    exp.start();
}

function draw() {
    exp.update();
}


