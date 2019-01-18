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

    instr.addComponent(new KeyboardResponse({name :'instr_resp'}));

    var trials = new Loop(conditions, 2);
    var displayGFMTStimulus = new Routine();
    displayGFMTStimulus.addComponent(new ImageStimulus({name : 'faces_image',
                                                        img: function () {return trials.currentTrial['image'];},
                                                        rotation : function () {return trials.currentTrial['rotation'];}
                                                       }));
    displayGFMTStimulus.addComponent(new KeyboardResponse({name: 'faces_response', keys : [113, 119]}));

    var interStimuliBreak = new Routine();
    interStimuliBreak.addComponent(new TextStimulus({name:'break_text',
                                                     text : 'Next trial will start in a moment',
                                                     timestart : 200,
                                                     timestop: 1700}));

    trials.addRoutine(interStimuliBreak);
    trials.addRoutine(displayGFMTStimulus);

    var thanks = new Routine();
    thanks.addComponent(new TextStimulus({name : 'thankyou',
                                          text : 'Thank you for your paricipation',
                                          timestop : 2000}));


    if (window.location['host'] == 'kognilab.pl'){
        var url = 'http://kognilab.pl/p5psych/saveData';
    } else {
        var url = 'http://localhost:5000/saveData';
    }

    exp = new Experiment(url);

    exp.addRoutine(instr);
    exp.addRoutine(trials);
    exp.addRoutine(thanks);
    exp.start();
}

function draw() {
    exp.update();
}


