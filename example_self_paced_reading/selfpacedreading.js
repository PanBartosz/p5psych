var exp;
var sentence;

function setup() {
    createCanvas(windowWidth, windowHeight);


    var conditions = [
        {'sentence' : 'This is a first sentence'},
        {'sentence' : 'This is a second sentence'},
        {'sentence' : 'This is a third sentence'},
    ];

    var instr = new Routine();
    instr.addComponent(new TextStimulus({name: 'instruction', text:
        '\
        Welcome to our little experiment! \n  \
        Press ENTER to show next word. \n  \
        Press ENTER to start an experiment! \n \
        '
                                        }
                                       ));

    instr.addComponent(new KeyboardResponse({ name : 'instr_resp'}));

    var trials = new Loop(conditions, 2);
    var displaySentence = new Routine();

    sentence = new TextStimulus({name : 'sentence', text: ''});
    var response = new KeyboardResponse({name : 'sentence_response'});

    var sph = new CodeComponent({name : 'selfpacing'});

    sph.at_the_start.push(function() {
        sph.counter = 0;
        sph.text = trials.currentTrial['sentence'].split(" ");
        response.force_end_of_routine = false;
        response.response = null;
        sentence.text = '';
        delete sentence.update_map['text']; // If you want to inject your code You must disable automatic updater of the property.
    });

    sph.every_frame.push(function() {
        if (response.response != null){
            sph.counter += 1;
            response.response = null;
        }
        if (sph.counter +1 > sph.text.length - 1){
            response.response = null;
            response.force_end_of_routine = true;
        }
        sentence.text = sph.text[sph.counter];
    });



    displaySentence.addComponent(sentence);
    displaySentence.addComponent(sph);
    displaySentence.addComponent(response);

    var interStimuliBreak = new Routine();
    interStimuliBreak.addComponent(new TextStimulus({name : 'break_text', text: 'Next trial will start in a moment', timestart: 200, timestop: 1700}));

    var likenessRating = new Routine();
    likenessRating.addComponent(new TextStimulus({name: 'like_text', text: 'Did you like that sentence?'}));
    likenessRating.addComponent(new SliderResponse({name : 'sliderLikeness', label : '1=a little bit, 7=very much', confirm_label : 'next trial'}));

    trials.addRoutine(interStimuliBreak);
    trials.addRoutine(displaySentence);
    trials.addRoutine(likenessRating);

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
    exp.addRoutine(instr);
    exp.addRoutine(trials);
    exp.addRoutine(thanks);
    exp.start();
}

function draw() {
    exp.update();
    console.log(sentence.text);
}
