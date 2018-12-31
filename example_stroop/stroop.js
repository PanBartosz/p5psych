var exp;

function setup() {
    createCanvas(windowWidth, windowHeight);
    var conditions = [
        {'word' : 'green', 'color': [0,0,255]},
        {'word' : 'red', 'color': [0,255,0]},
        {'word' : 'blue', 'color': [255,0,0]},
    ];

    var instr = new Routine();
    instr.addComponent(new TextStimulus(
        '\
        Welcome to our little experiment! \n  \
        Press Q if a displayed word is blue \n \
        Press W if a displayed word is red \n \
        Press R if a displayed word is green \n \
        Press ENTER to start an experiment! \n \
        '
    ));
    instr.addComponent(new KeyboardResponse());

    var trials = new Loop(conditions, 2);
    var displayStroopStimulus = new Routine();
    displayStroopStimulus.addComponent(new TextStimulus(function() {return trials.currentTrial['word'];}, // accepts string or function
                                                      32,
                                                      [0.5, 0.5],
                                                      function() {return trials.currentTrial['color'];} )); // accepts Array[3] or function
    displayStroopStimulus.addComponent(new KeyboardResponse([113, 119, 101]));

    var interStimuliBreak = new Routine();
    interStimuliBreak.addComponent(new TextStimulus('Next trial will start in a moment', 32, [0.5, 0.5], [0,0,0], 200, 1700));

    trials.addRoutine(interStimuliBreak);
    trials.addRoutine(displayStroopStimulus);

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
