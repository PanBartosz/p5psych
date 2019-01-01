var exp;

function setup() {
    createCanvas(windowWidth, windowHeight);


    var conditions = [
        {'sentence' : 'This is a first sentence'},
        {'sentence' : 'This is a second sentence'},
        {'sentence' : 'This is a third sentence'},
    ];

    var instr = new Routine();
    instr.addComponent(new TextStimulus('instruction',
        '\
        Welcome to our little experiment! \n  \
        Press ENTER to show next word. \n  \
        Press ENTER to start an experiment! \n \
        '
    ));

    instr.addComponent(new KeyboardResponse('instr_resp'));

    var trials = new Loop(conditions, 2);
    var displaySentence = new Routine();

    var sentence = new TextStimulus('sentence', '');
    var response = new KeyboardResponse('sentence_response');

    var sph = new CodeComponent('selfpacing');

    sph.at_the_start.push(function() {
        sph.counter = 0;
        sph.text = trials.currentTrial['sentence'].split(" ");
        response.force_end_of_routine = false;
        response.response = null;
        sentence.text = '';
        console.log(sph.text);
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
    interStimuliBreak.addComponent(new TextStimulus('break_text', 'Next trial will start in a moment', 32, [0.5, 0.5], [0,0,0], 200, 1700));

    var likenessRating = new Routine();
    likenessRating.addComponent(new TextStimulus('like_text', 'Did you like that sentence?', 32, [0.5, 0.5], [0,0,0]));
    likenessRating.addComponent(new SliderResponse('sliderLikeness', '1=a little bit, 7=very much', 'next trial'));

    trials.addRoutine(interStimuliBreak);
    trials.addRoutine(displaySentence);
    trials.addRoutine(likenessRating);

    var thanks = new Routine();
    thanks.addComponent(new TextStimulus('thankyou', 'Thank you for your paricipation', 32, [0.5,0.5], [0,0,0], 0, 2000));


    exp = new Experiment('http://localhost:5000/saveData');


    var exp_info_box = new ExpInfoBox(['participant', 'sex (M/F)', 'age', 'gender']);

    exp.addRoutine(exp_info_box);
    exp.addRoutine(instr);
    exp.addRoutine(trials);
    exp.addRoutine(thanks);
    exp.start();
}

function draw() {
    exp.update();
}
