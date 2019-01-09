var exp;

function setup() {
    createCanvas(windowWidth, windowHeight);
    var conditions = [
        {'rect_pos' : [0.2, 0.2], 'rect_width' : 0.1, 'rect_height' : 0.1, 'rect_color': [0,0,255], 'poly_pos' : [0.4, 0.4], 'poly_v' : 5, 'poly_radius' : 0.05, 'poly_color' : [0, 255,0]},
        {'rect_pos' : [0.4, 0.2], 'rect_width' : 0.1, 'rect_height' : 0.1, 'rect_color': [255,0,255], 'poly_pos' : [0.6, 0.2], 'poly_v' : 7, 'poly_radius' : 0.05, 'poly_color' : [255, 255,0]},
        {'rect_pos' : [0.2, 0.4], 'rect_width' : 0.1, 'rect_height' : 0.1, 'rect_color': [0,255,255], 'poly_pos' : [0.2, 0.8], 'poly_v' : 3, 'poly_radius' : 0.05, 'poly_color' : [255,0,0]}
    ];

    console.log(conditions);

    var instr = new Routine();
    instr.addComponent(new TextStimulus({name : 'instruction',
                                         text :
        '\
        Welcome to our little experiment! \n  \
        Click on a shape that is not a rectangle... \n  \
        Press ENTER to start an experiment! \n \
        '
                                        }));

    instr.addComponent(new KeyboardResponse({name: 'instr_resp'}));

    var trials = new Loop(conditions, 2);
    var displayPolygons = new Routine();
    rect1 = new RectComponent({name: 'rect1',
                               width: function() {return trials.currentTrial['rect_width'];}, // accepts string or function
                               height: function() {return trials.currentTrial['rect_height'];}, // accepts string or function
                               pos: function() {return trials.currentTrial['rect_pos'];}, // accepts string or function
                               fill_color: function() {return trials.currentTrial['rect_color'];}
                              }); // accepts Array[3] or function

    poly1 = new PolygonComponent({name : 'polygon1',
                                  radius : function() {return trials.currentTrial['poly_radius'];}, // accepts string or function
                                  n_v: function() {return trials.currentTrial['poly_v'];}, // accepts string or function
                                  pos: function() {return trials.currentTrial['poly_pos'];}, // accepts string or function
                                  fill_color: function() {return trials.currentTrial['poly_color'];}
                                 }); // accepts Array[3] or function

    displayPolygons.addComponent(rect1);
    displayPolygons.addComponent(poly1);
    displayPolygons.addComponent(new MouseResponse({name:'polygons_response', valid : [poly1]}));

    var interStimuliBreak = new Routine();
    interStimuliBreak.addComponent(new TextStimulus({name:'break_text',
                                                     text : 'Next trial will start in a moment',
                                                     timestart : 200,
                                                     timestop: 1700}));

    trials.addRoutine(interStimuliBreak);
    trials.addRoutine(displayPolygons);

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
