var exp;
var sentence;
var implicature;
var implicates;
var yes_t;
var no_t;
var trials_data;
var instructions_data;
var conditions;
var training;
var training_data;
var instructions;
var instructions_loop;
var intersession_instructions_loop;
var version;
var rv;
var loaded = false;


function setup() {
    if (window.location['host'] == 'kognilab.pl'){
        var url = 'http://kognilab.pl/p5psych/cb/eseenew/12';
    } else {
        var url = 'http://localhost:5000/cb/eseenew/12';
    }

    httpGet(url, function(response){version = response;})
        .then(function() {
            trials_data =  loadTable('wersja' + version + '.csv', 'csv', 'header',
                                     function() {
                                         conditions = LoadP5TableData(trials_data);
                                         instructions_data = loadTable('instructions.csv', 'csv', 'header',
                                                                       function(){
                                                                           instructions = LoadP5TableData(instructions_data);
                                                                           intersession_instructions_data = loadTable('intersession_instructions.csv', 'csv', 'header',
                                                                                                                      function(){
                                                                                                                          intersession_instructions = LoadP5TableData(intersession_instructions_data);
                                                                                                                          training_data = loadTable('training.csv', 'csv', 'header', function() {
                                                                                                                              training = LoadP5TableData(training_data);
                                                                                                                              setupExp();});   });
                                                                       });
                                     });});

}

function setupExp(){
    console.log(version);
    createCanvas(windowWidth, windowHeight);
    // Instructions
    var instructions_loop = new Loop(instructions, 1);
    var instr = new Routine();
    instr.addComponent(new TextStimulus({name: 'instruction',
                                         text: function() {return String(instructions_loop.currentTrial['instructions']).replace(/\\n/g, "\n");}, // String test
                                         pos: [0.5, 0.3],
                                         textSize: 24
                                        }
                                       ));
    instr.addComponent(new KeyboardResponse({ name : 'instr_resp'}));

    // Main session
    var trials = new Loop(conditions, 1);

    var displayStimuli = new Routine();

    sentence = new TextStimulus({name : 'sentence', text: function() {return trials.currentTrial['Zdanie'];}, pos : [0.5, 0.4], timestop: 10000});
    implicature = new TextStimulus({name : 'implicate', text: function() {return trials.currentTrial['Sugeruje, że'];}, pos: [0.5, 0.6], timestop: 10000});
    implicates = new TextStimulus({name : 'implicate', text: "sugeruje, że", pos: [0.5, 0.5], timestop:10000});
    yes_t = new TextStimulus({name : "yes_t", text : "TAK - E", pos: [0.8, 0.8], timestop:10000});
    no_t = new TextStimulus({name : "no_t", text : "NIE - Q", pos : [0.2, 0.8], timestop:10000});

    var response_implies = new KeyboardResponse({name: 'response_implies', keys: [81, 69], timestop:10000});

    displayStimuli.addComponent(sentence);
    displayStimuli.addComponent(implicature);
    displayStimuli.addComponent(implicates);
    displayStimuli.addComponent(yes_t);
    displayStimuli.addComponent(no_t);
    displayStimuli.addComponent(response_implies);


    var interStimuliBreak = new Routine();


    var break_text = new TextStimulus({name : 'break_text', text: 'Zaraz rozpocznie się kolejna próba', timestop: 2000, pos: [0.5, 0.5]});
    var sph = new CodeComponent({name: 'break_randomizer'});
    var progress_bar = new RectComponent({name : 'progress_bar',
                                      height: 0.05,
                                      width: function() {
                                          return 0.5 - (0.5 * (millis() - break_text.t_start)/break_text.timestop);},
                                          pos: [0.2, 0.8],
                                          fill_color : [255,0,0],
                                          timestop: 2000
                                         });

    sph.at_the_start.push(function() {var timestop = random(1000, 2000); progress_bar.timestop = timestop; break_text.timestop = timestop; });

    interStimuliBreak.addComponent(sph);
    interStimuliBreak.addComponent(break_text);
    interStimuliBreak.addComponent(progress_bar);


    instructions_loop.addRoutine(instr);

    trials.addRoutine(interStimuliBreak);
    trials.addRoutine(displayStimuli);

    var thanks = new Routine();
    thanks.addComponent(new TextStimulus({name :'thankyou', text: 'Dziękujemy za udział w badaniu! Zespół KogniLab UW', timestop: 2000}));


    if (window.location['host'] == 'kognilab.pl'){
        var url = 'http://kognilab.pl/p5psych/saveData';
    } else {
        var url = 'http://localhost:5000/saveData';
    }

    exp = new Experiment(url, 'eseenew' + '_' + version);


    var exp_info_box = new ExpInfoBox({name : 'expinfo', data: ['płeć (K/M/inne)', 'wiek'], additional_info : {'uczestnik' : Math.random().toString(36).substring(7)}});

    exp.addRoutine(exp_info_box);
    exp.addRoutine(instructions_loop);
    exp.addRoutine(trials);
    exp.addRoutine(thanks);
    exp.start();

    loaded = true;
}

function draw() {
    if (loaded){
    exp.update();
    }
}
