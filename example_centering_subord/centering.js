var exp;
var f1;
var f2;
var trials_data;
var instructions_data;
var intersession_instructions_data;
var conditions;
var training;
var training_data;
var instructions;
var intersession_instructions;
var instructions_loop;
var intersession_instructions_loop;
var version;
var rv;
var loaded = false;


function setup() {
    if (window.location['host'] == 'kognilab.pl'){
        var url = 'http://kognilab.pl/p5psych/cb/centerings/6';
    } else {
        var url = 'http://localhost:5000/cb/centerings/6';
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
                                         text: function() {return instructions_loop.currentTrial['instructions'];},
                                         pos: [0.5, 0.5]
                                        }
                                       ));
    instr.addComponent(new KeyboardResponse({ name : 'instr_resp'}));


    // Training session
    var training_loop = new Loop(training, 99);

    var interStimuliBreak_train = new Routine();


    var break_text_train = new TextStimulus({name : 'break_text', text: 'Zaraz rozpocznie się kolejna próba.', timestop: 2000, pos: [0.5, 0.5]});
    var sph_train = new CodeComponent({name: 'break_randomizer'});
    var progress_bar_train = new RectComponent({name : 'progress_bar',
                                      height: 0.05,
                                      width: function() {
                                          return 0.5 - (0.5 * (millis() - break_text_train.t_start)/break_text_train.timestop);},
                                          pos: [0.2, 0.8],
                                          fill_color : [255,0,0],
                                          timestop: 2000
                                         });

    sph_train.at_the_start.push(function() {var timestop = random(1000, 2000); progress_bar_train.timestop = timestop; break_text_train.timestop = timestop; });

    interStimuliBreak_train.addComponent(sph_train);
    interStimuliBreak_train.addComponent(break_text_train);
    interStimuliBreak_train.addComponent(progress_bar_train);

    var displaySentence1_train = new Routine();
    var displaySentence2_train = new Routine();
    var displayResponse_train = new Routine();
    var feedback_train = new Routine();
    var f1_train = new TextStimulus({name : 'f1train', text: function() {return training_loop.currentTrial['F1'];}});
    var f2_train = new TextStimulus({name : 'f2train', text: function() {return training_loop.currentTrial['F2'];}});
    var response1_train = new KeyboardResponse({name : 'sentence_response_training'});
    var response2_train = new KeyboardResponse({name : 'sentence_response_training'});
    var resp_prompt_train = new TextStimulus({name: 'prompt', text : '?'});
    var resp_tip_train = new TextStimulus({name : 'tip', text : 'Q = nonsensowna, E = sensowna', pos : [0.5, 0.8]});
    var response_sensible_train = new KeyboardResponse({name: 'response_sensible', keys: [113, 101]});

    var tsb = new CodeComponent({name : 'training_session_breaker'});

    tsb.p_counter = 0;
    tsb.n_counter = 0;
    tsb.at_the_start.push(function() {
        tsb.p_counter = tsb.n_counter;
        console.log(tsb.n_counter);
        console.log(tsb.p_counter);
        if (tsb.n_counter == 6) {tsb.experiment.nextRoutine();} });

    var feedback_text = new TextStimulus({name : 'feedback_text', text: function() {
        if (response_sensible_train.response == training_loop.currentTrial['corr']) {
            tsb.n_counter = tsb.p_counter + 1;
            console.log(tsb.n_counter);
            return 'Twoja odpowiedź była prawidłowa.';
        } else{
            tsb.n_counter = 0;
            return "Twoja odpowiedź była nieprawidłowa.";
        }
           }});


    var response3_train = new KeyboardResponse({name : 'feedback_next_training'});

    interStimuliBreak_train.addComponent(tsb);
    displaySentence1_train.addComponent(f1_train);
    displaySentence1_train.addComponent(response1_train);

    displaySentence2_train.addComponent(f2_train);
    displaySentence2_train.addComponent(response2_train);

    displayResponse_train.addComponent(resp_prompt_train);
    displayResponse_train.addComponent(resp_tip_train);
    displayResponse_train.addComponent(response_sensible_train);

    feedback_train.addComponent(feedback_text);
    feedback_train.addComponent(response3_train);


    // Inter-session instruction
    var intersession_instructions_loop = new Loop(intersession_instructions, 1);
    var inter_instr = new Routine();
    inter_instr.addComponent(new TextStimulus({name: 'intersession_instruction',
                                         text: function() {return intersession_instructions_loop.currentTrial['instructions'];},
                                         pos: [0.5, 0.5]
                                        }
                                       ));
    inter_instr.addComponent(new KeyboardResponse({ name : 'iinstr_resp'}));





    // Main session
    var trials = new Loop(conditions, 1);

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

    var displayResponse = new Routine();
    var resp_prompt = new TextStimulus({name: 'prompt', text : '?'});
    var resp_tip= new TextStimulus({name : 'tip', text : 'Q = nonsensowna, E = sensowna', pos : [0.5, 0.8]});
    var response_sensible = new KeyboardResponse({name: 'response_sensible', keys: [113, 101]});

    displayResponse.addComponent(resp_prompt);
    displayResponse.addComponent(resp_tip);
    displayResponse.addComponent(response_sensible);


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

    training_loop.addRoutine(interStimuliBreak_train);
    training_loop.addRoutine(displaySentence1_train);
    training_loop.addRoutine(displaySentence2_train);
    training_loop.addRoutine(displayResponse_train);
    training_loop.addRoutine(feedback_train);

    intersession_instructions_loop.addRoutine(inter_instr);

    trials.addRoutine(interStimuliBreak);
    trials.addRoutine(displaySentence1);
    trials.addRoutine(displaySentence2);
    trials.addRoutine(displayResponse);


    var thanks = new Routine();
    thanks.addComponent(new TextStimulus({name :'thankyou', text: 'Dziękujemy za udział w badaniu! Prosimy nie wyłączać przeglądarki, dopóki na ekranie nie pojawiła się odpowiedni komunikat. Zespół KogniLab UW', timestop: 2000}));


    if (window.location['host'] == 'kognilab.pl'){
        var url = 'http://kognilab.pl/p5psych/saveData';
    } else {
        var url = 'http://localhost:5000/saveData';
    }

    exp = new Experiment(url, 'centerings' + '_' + version);


    var exp_info_box = new ExpInfoBox({name : 'expinfo', data: ['płeć (K/M/inne)', 'wiek'], additional_info : {'uczestnik' : Math.random().toString(36).substring(7)}});

    exp.addRoutine(exp_info_box);
    exp.addRoutine(instructions_loop);
    exp.addRoutine(training_loop);
    exp.addRoutine(intersession_instructions_loop);
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
