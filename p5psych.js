// Loading conditions from CSV file:
function LoadP5TableData(trials_data){
    var cond_obj = trials_data.getObject();
    var conditions = [];
    for (var val in cond_obj){
        var c = cond_obj[val];
        if (c != null){conditions.push(c);}
    }
    return conditions;
}

// Logic of the experiment
function Experiment(url = null){
    this.routines = [];
    this.currentRoutine = null;
    this.routineCounter = 0;
    this.server_url = url;
    this.data = [];
    this.currentTrial = {};
    this.expInfo = {};
}
Experiment.prototype.addRoutine = function(routine){
    this.routines.push(routine);
};
Experiment.prototype.start = function(){
    this.currentRoutine = this.routines[this.routineCounter];
    this.currentRoutine.setExperiment(this);
    this.currentRoutine.start();
};
Experiment.prototype.nextRoutine = function(){
    if (this.routineCounter +1 == this.routines.length) {
        noLoop();
        this.sendData();
    } else{
        this.routineCounter += 1;
        this.currentRoutine = this.routines[this.routineCounter];
        this.currentRoutine.setExperiment(this);
        this.currentRoutine.start();
    }
};
Experiment.prototype.update = function(){
    next = this.currentRoutine.update();
    if (next){
        this.nextRoutine();
    }
};
Experiment.prototype.addData = function(data){
    var row = Object.assign({}, this.currentTrial);
    for (var attr in this.expInfo) {row[attr] = this.expInfo[attr]; }
    for (var attr in data) {row[attr] = data[attr]; }
    this.data.push(row);
    console.log(this.data);
    console.log(row);
};
Experiment.prototype.sendData = function(){
    var date = [year(), month(), day(), hour(), minute(), second()].join('-');
    if (this.server_url != null) {
        httpPost(this.server_url, 'text', JSON.stringify({'title' : 'data', 'body' : this.data, 'date' : date}), function(result) {
            noLoop();
            background(255);
            fill(0);
            text('Uploading data...', width/2, height/2);
            text(result, width/2, height/1.5);
        });
    }
};

function Routine(background = [255,255,255]){
    this.components = [];
    this.t_start = null;
    this.experiment = null;
    this.background = background;
}
Routine.prototype.setExperiment = function(experiment){
        this.experiment = experiment;
};
Routine.prototype.addComponent = function(component){
        this.components.push(component);
};
Routine.prototype.start = function(){
        this.t_start = millis();
        for (var i = 0; i< this.components.length; i++){
            this.components[i].start(this.t_start);
            this.components[i].setExperiment(this.experiment);
        }
};
Routine.prototype.update = function(){
    background(color(this.background));
    var finished = [];
    for (var i = 0; i< this.components.length; i++){
        continueRoutine = this.components[i].update(this.t_start);
        this.components[i].draw();
        finished.push(this.components[i].finished);
    }

    if (continueRoutine == false){
        return true;
    }

    if (finished.every(x => x == true)){
        console.log(finished);
        return true;
    }
};

function Loop(conditions, nrep = 1){
    this.nrep = nrep;
    this.conditions = [];
    for (var i = 0; i < this.nrep; i++){
        this.conditions = this.conditions.concat(conditions);
    }
    this.routines = [];
    this.currentTrial = conditions[0];
    this.experiment = null;
    this.routineCounter = 0;
    this.trialCounter = 0;
    this.currentRoutine = null;
}
Loop.prototype.setExperiment = function(experiment){
    this.experiment = experiment;
};
Loop.prototype.addRoutine = function(routine){
    this.routines.push(routine);
};
Loop.prototype.nextRoutine = function(){
    if (this.routineCounter + 1 == this.routines.length){
        if (this.trialCounter + 1 == this.conditions.length){
            return true;
        } else {
            this.routineCounter = 0;
            this.trialCounter += 1;
        }
    } else {
        this.routineCounter += 1;
    }
    this.currentTrial = this.conditions[this.trialCounter];
    this.currentRoutine = this.routines[this.routineCounter];
    this.currentRoutine.setExperiment(this.experiment);
    this.experiment.currentTrial = this.currentTrial;
    this.currentRoutine.start();
};
Loop.prototype.start = function(){
    this.currentRoutine = this.routines[this.routineCounter];
    this.currentRoutine.setExperiment(this.experiment);
    this.currentTrial = this.conditions[this.trialCounter];
    this.experiment.currentTrial = this.currentTrial;
    console.log(this.currentTrial);
    this.currentRoutine.start();
    
};
Loop.prototype.update = function(){
    var next = this.currentRoutine.update();
    if (next){
        return this.nextRoutine();
    }
};

// Helpers
function setProperty(property){
    if (typeof property === "function"){
        return property();
    } else{
        return property;
    }
}

function ExpInfoBox({name,
                     pos,
                    data} = {}){
    BaseComponent.call(this, {name, pos});
    this.html_elements = [];
    this.data = data;
    this.clicked = false;
}
ExpInfoBox.prototype = Object.create(BaseComponent.prototype);
ExpInfoBox.prototype.start = function(){
    var y = height/2 - 1/2*50*this.data.length;
    for (var i=0; i< this.data.length; i++){
        var input = createInput('');
        input.position(width/2, y);
        y += 50;
        this.html_elements.push(input);
    }
    var button = createButton('Start');
    button.position(width/2, y);
    eb = this;
    button.mousePressed(function () {eb.clicked = true;});
    this.html_elements.push(button);
};
ExpInfoBox.prototype.update = function(){
    background(255);
    var y = height/2 - 1/2*50*this.data.length;
    for (var i=0; i< this.data.length; i++){
        textSize(20);
        textAlign(CENTER, TOP);
        text(this.data[i], width/2 - 115, y);
        y += 50;
    };
    if (this.clicked){
        expInfo = {};
        for (var i=0; i < this.data.length; i++){
            expInfo[this.data[i]] = this.html_elements[i].value();
        }
        this.experiment.expInfo = expInfo;
        for (var j = 0; j < this.html_elements.length; j++){
            this.html_elements[j].remove();
        }
        console.log(expInfo);
        return true;
    };
};
ExpInfoBox.constructor = ExpInfoBox;

// Components
function BaseComponent({name, pos = [0.5, 0.5]} = {}){
    this.name = name;
    this.pos = setProperty(pos);
    this.experiment = null;
    this.routine = null;
}
BaseComponent.prototype.setExperiment = function(experiment){
        this.experiment = experiment;
};
BaseComponent.prototype.setRoutine = function(routine){
        this.routine = routine;
};
BaseComponent.prototype.start = function(t_start){
    this.finished = null;
    this.t_start = t_start;
};

function P5Component({name, pos, rotation = 0, timestart = 0, timestop = null} = {}){
    BaseComponent.call(this, {name, pos});
    this.rotation = rotation;
    this.timestart = timestart;
    this.timestop = timestop;
    this.t_start = null;
    this.finished = null;
}
P5Component.prototype = Object.create(BaseComponent.prototype);
P5Component.prototype.drawDecorator = function(fun){
        if ((millis() - this.t_start > this.timestart)){
            if (this.timestop == null | (millis() - this.t_start) - this.timestop < 0 ){
                fun();
            }
        }
    };
P5Component.prototype.draw = function(){ };
P5Component.prototype.update = function(){
    for (var val in this.update_map){
        if (typeof this.update_map[val] !== 'undefined')
        {
            this[val] = setProperty(this.update_map[val]);
        }
    }
    if (this.timestop != null & (millis() - this.t_start) - this.timestop > 0 ){
        this.finished = true;
    }
    return true;
};
P5Component.constructor = P5Component;

function CodeComponent({name}){
    BaseComponent(this, {name});
    this.every_frame = [];
    this.at_the_start = [];
    this.finished = true;
}
CodeComponent.prototype = Object.create(BaseComponent.prototype);
CodeComponent.prototype.start = function(t_start){
    for (var i = 0; i < this.at_the_start.length; i++){
        this.at_the_start[i]();
    }
};
CodeComponent.prototype.update = function(){
    for (var i = 0; i < this.every_frame.length; i++){
        this.every_frame[i]();
    }
};
CodeComponent.prototype.draw = function() {} ;
CodeComponent.constructor = CodeComponent;

function TextStimulus({name,
                       text,
                       textSize = 32,
                       pos,
                       color = [0,0,0],
                       rotation,
                       timestart,
                       timestop} = {}){
    P5Component.call(this, {name, pos, rotation, timestart, timestop});
    this.text = setProperty(text);
    this.color = setProperty(color);
    this.textSize = setProperty(textSize);
    this.update_map = {'text' : text, 'textSize' : textSize, 'pos' : pos, 'color' : color, 'rotation': rotation};
}
TextStimulus.prototype = Object.create(P5Component.prototype);
TextStimulus.prototype.draw = function(){
    var that = this;
    this.drawDecorator(function(){
        fill(color(that.color));
        textSize(that.textSize);
        textAlign(CENTER);
        text(that.text, that.pos[0] * width, that.pos[1] * height);
    });
};
TextStimulus.constructor = TextStimulus;

function ImageStimulus({name,
                        img,
                        pos,
                        rotation,
                        timestop,
                        timestart} = {}){
    P5Component.call(this, {name, pos, rotation, timestart, timestop});
    this.img = setProperty(img);
    this.update_map = {'img' : img, 'pos' : pos,  'rotation': rotation};
}
ImageStimulus.prototype = Object.create(P5Component.prototype);
ImageStimulus.prototype.draw = function(){
        var that = this;
        this.drawDecorator(function() {
                push();
                translate(that.img.width/2 + that.pos[0]/2, that.img.height/2 + that.pos[1]/2);
                rotate(radians(that.rotation));
                imageMode(CENTER);
                image(that.img, 0, 0);
                pop();
        });
};
ImageStimulus.constructor = ImageStimulus;

function PolygonComponent({name,
                           radius,
                           n_v,
                           pos,
                           rotation,
                           fill_color = [0,0,0],
                           border_color = [0,0,0],
                           timestart,
                           timestop} = {}){
    P5Component.call(this, {name, pos, timestart, timestop});
    this.radius = setProperty(radius);
    this.n_v = setProperty(n_v);
    this.fill_color = setProperty(fill_color);
    this.border_color = setProperty(border_color);
    this.vectors = [];
    this.update_map = {'radius' : radius, 'n_v' : n_v, 'pos' : pos, 'rotation': rotation, 'fill_color' : fill_color, 'border_color' : border_color};
}
PolygonComponent.prototype = Object.create(P5Component.prototype);
PolygonComponent.prototype.draw = function(){
    var that = this;
    this.drawDecorator(function(){
                fill(that.fill_color);
                var angle = TWO_PI / that.n_v;
                beginShape();
                this.vectors = [];
                for (var a = 0; a < TWO_PI; a += angle) {
                    var sx = that.pos[0] * width + cos(a) * that.radius * width;
                    var sy = that.pos[1] * height + sin(a) * that.radius * width;
                    that.vectors.push(createVector(sx,sy));
                    vertex(sx, sy);
                }
                endShape(CLOSE);
    });
};
PolygonComponent.prototype.contains =  function(mx, my){
        return collidePointPoly(mx, my, this.vectors);
};
PolygonComponent.constructor = PolygonComponent;

function RectComponent({name,
                           width,
                           height,
                           pos,
                           rotation,
                           fill_color = [0,0,0],
                           border_color = [0,0,0],
                           timestart,
                           timestop} = {}){
    P5Component.call(this, {name, pos, timestart, timestop});
    this.width = setProperty(width);
    this.height = setProperty(height);
    this.fill_color = setProperty(fill_color);
    this.border_color = setProperty(border_color);
    this.update_map = {'width' : width, 'height' : height, 'pos' : pos, 'rotation': rotation, 'fill_color' : fill_color, 'border_color' : border_color};
}
RectComponent.prototype = Object.create(P5Component.prototype);
RectComponent.prototype.draw = function(){
    var that = this;
    this.drawDecorator(function(){
        fill(that.fill_color);
        rect(that.pos[0] * width, that.pos[1] * height, that.width*width, that.height * height,);
    });
};

RectComponent.prototype.contains =  function(mx, my){
    return collidePointRect(mx, my, this.pos[0] * width, this.pos[1] * height, this.width * width, this.height * height);
};
RectComponent.constructor = RectComponent;

function KeyboardResponse({name,
                           keys = [ENTER],
                           force_end_of_routine = true} = {}){
    P5Component.call(this, {name});
    this.keys = keys;
    this.lock = true;
    this.response = null;
    this.force_end_of_routine = force_end_of_routine;
}
KeyboardResponse.prototype = Object.create(P5Component.prototype);
KeyboardResponse.prototype.update = function(){
    if (!keyIsPressed & this.lock){
        this.lock = false;
    }
    if (keyIsPressed & this.keys.indexOf(keyCode) > -1 & !this.lock){
        this.lock = true;
        this.response = keyCode;
        this.experiment.addData({name: this.name, 'rt': millis() - this.t_start, 'resp' : this.response});
        if (this.force_end_of_routine){
            return false;
        } else{
            return true;
        }
    } else {
        return true;
    };
};
KeyboardResponse.constructor = KeyboardResponse;

function MouseResponse({name,
                        valid = [],
                        force_end_of_routine = true} = {}){
    P5Component.call(this, {name});
    this.valid = setProperty(valid);
    this.routine = null;
    this.response = null;
    this.force_end_of_routine = force_end_of_routine;
    this.updatate_map = {'valid' : valid};
}
MouseResponse.prototype = Object.create(P5Component.prototype);
MouseResponse.prototype.update = function(){
    for (var val in this.update_map){
        if (typeof this.update_map[val] !== 'undefined')
        {
            this[val] = setProperty(this.update_map[val]);
        }
    }
    if (mouseIsPressed){
        for (var i=0; i < this.valid.length; i++){
            if (this.valid[i].contains(mouseX, mouseY)){
                this.experiment.addData({name: this.name, 'rt': millis() - this.t_start, 'resp' : this.valid[i].name});
                if (this.force_end_of_routine){
                    return false;
                } else {
                    return true;}
            } else{
                return true;
            }
        }
    }
};
MouseResponse.constructor = MouseResponse;

function SliderResponse({name,
                         label,
                         confirm_label,
                         min = 1,
                         max = 7,
                         step = 1,
                         pos = [0.5, 0.65]} = {}){
    BaseComponent.call(this, {name, pos});
    this.slider = null;
    this.resp = null;
    this.confirm_button = null;
    this.clicked = false;
    this.min = min;
    this.max = max;
    this.step = step;
    this.confirm_label = confirm_label;
    this.label = label;

}
SliderResponse.prototype = Object.create(BaseComponent.prototype);
SliderResponse.prototype.start = function(t_start){
    BaseComponent.prototype.start(t_start);
    this.clicked = false;
    this.slider = createSlider(this.min, this.max, this.min, this.step);
    this.slider.position(this.pos[0] * width - width/8, this.pos[1] * height);
    this.slider.style('width', width/4 + 'px');
    this.slider.elt.setAttribute('list', 'steplist');
    this.confirm_button = createButton(this.confirm_label);
    this.confirm_button.position(this.pos[0] * width, this.pos[1] * height + 0.1*height);
    var that = this;
    this.confirm_button.mousePressed(function(){that.clicked = true;});
    dlist = document.createElement('datalist');
    dlist.setAttribute('id', 'steplist');
    for (var i = this.min; i<this.max+1; i++){
        o = document.createElement('option');
        o.innerHTML = i;
        dlist.appendChild(o);
    }
    document.body.appendChild(dlist);
};
SliderResponse.prototype.draw = function(){ };
SliderResponse.prototype.update = function() {
    this.resp = this.slider.value();
    console.log(this.clicked);
    if (this.clicked){
        this.experiment.addData({name: this.name, 'rt': millis() - this.t_start, 'resp' : this.resp});
        this.slider.remove();
        this.confirm_button.remove();
        return false;
    }
};
SliderResponse.constructor = SliderResponse;

// TODO
function ButtonResponse(name, label = 'Next', force_end_of_routine = true){
    this.name = name;
    this.t_start = null;
    this.experiment = null;
    this.routine = null;
    this.force_end_of_routine = force_end_of_routine;

    this.setExperiment = function(experiment){
        this.experiment = experiment;
    };

    this.setRoutine = function(routine){
        this.routine = routine;
    };

    this.draw = function(){};

    this.start = function(t_start){
        this.t_start = t_start;
    };

    this.update = function(){
    };
}
