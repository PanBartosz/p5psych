var exp;

function setup() {
    createCanvas(windowWidth, windowHeight);
    var conditions = [
        {'word' : 'green', 'color': [0,0,255]},
        {'word' : 'red', 'color': [0,255,0]},
        {'word' : 'blue', 'color': [255,0,0]},
    ];

    var instr = new Routine();
    instr.addComponent(new TextStimulus('instruction',
        '\
        Welcome to our little experiment! \n  \
        Press Q if a displayed word is blue \n \
        Press W if a displayed word is red \n \
        Press R if a displayed word is green \n \
        Press ENTER to start an experiment! \n \
        '
    ));
    instr.addComponent(new KeyboardResponse('instr_resp'));

    var trials = new Loop(conditions, 2);
    var displayStroopStimulus = new Routine();
    displayStroopStimulus.addComponent(new TextStimulus('stroop_word', function() {return trials.currentTrial['word'];}, // accepts string or function
                                                      32,
                                                      [0.5, 0.5],
                                                      function() {return trials.currentTrial['color'];} )); // accepts Array[3] or function
    displayStroopStimulus.addComponent(new KeyboardResponse('stroop_response', [113, 119, 101]));

    var interStimuliBreak = new Routine();
    interStimuliBreak.addComponent(new TextStimulus('break_text', 'Next trial will start in a moment', 32, [0.5, 0.5], [0,0,0], 200, 1700));

    trials.addRoutine(interStimuliBreak);
    trials.addRoutine(displayStroopStimulus);

    var thanks = new Routine();
    thanks.addComponent(new TextStimulus('thankyou', 'Thank you for your paricipation', 32, [0.5,0.5], [0,0,0], 0, 2000));


    exp = new Experiment('http://localhost:5000/saveData');

    exp.addRoutine(instr);
    exp.addRoutine(trials);
    exp.addRoutine(thanks);
    exp.start();
}

function draw() {
    exp.update();
}
