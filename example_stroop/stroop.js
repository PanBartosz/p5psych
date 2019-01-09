var exp;

function setup() {
    createCanvas(windowWidth, windowHeight);
    var conditions = [
        {'word' : 'green', 'color': [0,0,255]},
        {'word' : 'red', 'color': [0,255,0]},
        {'word' : 'blue', 'color': [255,0,0]},
    ];

    var instr = new Routine();
    var instruction_text = new TextStimulus({name : 'instruction',
                                             text :
        '\
        Welcome to our little experiment! \n  \
        Press Q if a displayed word is blue \n \
        Press W if a displayed word is red \n \
        Press R if a displayed word is green \n \
        Press ENTER to start an experiment! \n \
        '
                                            });

    instr.addComponent(instruction_text);
    instr.addComponent(new KeyboardResponse({name : 'instr_resp'}));

    var trials = new Loop(conditions, 2);

    var displayStroopStimulus = new Routine();
    var stroop_word = new TextStimulus({ name : 'stroop_word',
                                         text: function() {return trials.currentTrial['word'];},
                                         color : function() {return trials.currentTrial['color'];}
                                       });
    displayStroopStimulus.addComponent(stroop_word);
    displayStroopStimulus.addComponent(new KeyboardResponse({name :'stroop_response', keys : [113, 119, 101]}));

    var interStimuliBreak = new Routine();
    interStimuliBreak.addComponent(new TextStimulus({name:'break_text',
                                                     text : 'Next trial will start in a moment',
                                                     timestart : 200,
                                                     timestop: 1700}));
    trials.addRoutine(interStimuliBreak);
    trials.addRoutine(displayStroopStimulus);

    var thanks = new Routine();
    thanks.addComponent(new TextStimulus({name : 'thankyou',
                                          text : 'Thank you for your paricipation',
                                          timestop : 2000}));

    exp = new Experiment('http://localhost:5000/saveData');

    exp.addRoutine(instr);
    exp.addRoutine(trials);
    exp.addRoutine(thanks);
    exp.start();
}

function draw() {
    exp.update();
}
