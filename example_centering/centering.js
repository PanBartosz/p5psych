var exp;
var f1;
var f2;
var trials_data;
var instructions_data;
var conditions;
var instructions;
var instructions_loop;

function preload(){
    trials_data = loadTable('trials.csv', 'csv', 'header');
    instructions_data = loadTable('instructions.csv', 'csv', 'header');
}

function setup() {
    conditions = LoadP5TableData(trials_data);
    instructions = LoadP5TableData(instructions_data);

    createCanvas(windowWidth, windowHeight);
    var instructions_loop = new Loop(instructions, 1);
    var instr = new Routine();
    instr.addComponent(new TextStimulus({name: 'instruction',
                                         text: function() {return instructions_loop.currentTrial['instructions'];},
                                         pos: [0.5, 0.5]
                                        }
                                       ));
    instr.addComponent(new KeyboardResponse({ name : 'instr_resp'}));


    var trials = new Loop(conditions, 2);

    var displaySentence1 = new Routine();

    f1 = new TextStimulus({name : 'f1', text: function() {return trials.currentTrial['F1'];}});
    var response1 = new KeyboardResponse({name : 'sentence_response'});

    displaySentence1.addComponent(f1);
    displaySentence1.addComponent(response1);

    var displaySentence2 = new Routine();

    f2 = new TextStimulus({name : 'f2', text: function() {return trials.currentTrial['F2'];}});
    var response2 = new KeyboardResponse({name : 'sentence_response'});

    displaySentence2.addComponent(f2);
    displaySentence2.addComponent(response2);


    var interStimuliBreak = new Routine();


    var break_text = new TextStimulus({name : 'break_text', text: 'Zaraz rozpocznie się kolejna próba', timestop: 2000, pos: [0.5, 0.3]});
    var sph = new CodeComponent({name: 'break_randomizer'});
    var progress_bar = new RectComponent({name : 'progress_bar',
                                      height: 0.05,
                                      width: function() {
                                          return 0.5 - (0.5 * (millis() - break_text.t_start)/break_text.timestop);},
                                          pos: [0.2, 0.8],
                                          fill_color : [255,0,0],
                                          timestop: 2000
                                         });

    sph.at_the_start.push(function() {var timestop = random(500, 2000); progress_bar.timestop = timestop; break_text.timestop = timestop; });

    interStimuliBreak.addComponent(sph);
    interStimuliBreak.addComponent(break_text);
    interStimuliBreak.addComponent(progress_bar);


    instructions_loop.addRoutine(instr);

    trials.addRoutine(interStimuliBreak);
    trials.addRoutine(displaySentence1);
    trials.addRoutine(displaySentence2);

    var thanks = new Routine();
    thanks.addComponent(new TextStimulus({name :'thankyou', text: 'Thank you for your paricipation', timestop: 2000}));


    if (window.location['host'] == 'kognilab.pl'){
        var url = 'http://kognilab.pl/p5psych/saveData';
    } else {
        var url = 'http://localhost:5000/saveData';
    }

    exp = new Experiment(url);


    var exp_info_box = new ExpInfoBox({name : 'expinfo', data: ['participant', 'sex (M/F)', 'age', 'gender']});

    exp.addRoutine(exp_info_box);
    exp.addRoutine(instructions_loop);
    exp.addRoutine(trials);
    exp.addRoutine(thanks);
    exp.start();
}

function draw() {
    exp.update();
}
