function Experiment(url){
    this.routines = [];
    this.currentRoutine = null;
    this.routineCounter = 0;
    this.server_url = url;
    this.data = [];
    this.currentTrial = {};
    this.expInfo = {};

    this.addRoutine = function(routine){
        this.routines.push(routine);
    };

    this.start = function(){
        this.currentRoutine = this.routines[this.routineCounter];
        this.currentRoutine.setExperiment(this);
        this.currentRoutine.start();
    };

    this.nextRoutine = function(){
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

    this.update = function(){
        next = this.currentRoutine.update();
        if (next){
            this.nextRoutine();
        }
    };

    this.addData = function(data){
        var row = Object.assign({}, this.currentTrial);
        for (var attr in this.expInfo) {row[attr] = this.expInfo[attr]; }
        for (var attr in data) {row[attr] = data[attr]; }
        this.data.push(row);
        console.log(this.data);
        console.log(row);
    };

    this.sendData = function(){
        var date = [year(), month(), day(), hour(), minute(), second()].join('-');
        //console.log(this.data);
        httpPost(this.server_url, 'text', JSON.stringify({'title' : 'data', 'body' : this.data, 'date' : date}), function(result) {
            noLoop();
            background(255);
            fill(0);
            text('Uploading data...', width/2, height/2);
            text(result, width/2, height/1.5);
        });
    };
}



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


    swap = function(obj1, obj2){
        for (var key in obj2){
            obj1[key] = obj2[key];
        }
    };

    // Loop ma z punktu widzenia eksperymentu przyjmować te same argumenty co Routine...
    // Jak zrobić uzmiennienie???? Nie mam pojęcia prawdopodobnie "eval" ale czy to nie jest niggerlicious?
    this.setExperiment = function(experiment){
        this.experiment = experiment;
    };

    this.addRoutine = function(routine){
        this.routines.push(routine);
    };

    this.nextRoutine = function(){
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

    this.start = function(){
        this.currentRoutine = this.routines[this.routineCounter];
        this.currentRoutine.setExperiment(this.experiment);
        this.currentTrial = this.conditions[this.trialCounter];
        this.experiment.currentTrial = this.currentTrial;
        this.currentRoutine.start();

    };

    this.update = function(){
        next = this.currentRoutine.update();
        if (next){
            return this.nextRoutine();
        }
    };

}

function Routine(){
    this.components = [];
    this.t_start = null;
    this.experiment = null;

    this.setExperiment = function(experiment){
        this.experiment = experiment;
    };

    this.addComponent = function(component){
        this.components.push(component);
    };

    this.start = function(){
        this.t_start = millis();
        for (var i = 0; i< this.components.length; i++){
            this.components[i].start(this.t_start);
            this.components[i].setExperiment(this.experiment);
        }
    }

    this.update = function(){
        background(255);
        finished = [];
        for (var i = 0; i< this.components.length; i++){
            continueRoutine = this.components[i].update(this.t_start);
            this.components[i].draw();
            finished.push(this.components[i].finished);
            if (continueRoutine == false){
                return true;
            };
            if (finished.every(x => x == true)){
                return true;
            }
        }
    };

    }

// Components

function TextStimulus(name, s_text, s_text_size = 32, pos = [0.5, 0.5], col = [0,0,0], timestart = 0, timestop = null){
    this.name = name;
    if (typeof s_text === "function"){
        this.text = s_text();
    } else{
    this.text = s_text;
    }

    if (typeof col === "function"){
        this.color = color(col());
    } else{
        this.color = color(col);
    }

    if (typeof s_text_size === "function"){
        this.textSize = s_text_size();
    } else{
        this.textSize = s_text_size;
    }

    this.t_start = null;
    this.experiment = null;
    this.routine = null;
    this.posx = pos[0] * width;
    this.posy = pos[1] * height;
    this.finished = null;

    this.setExperiment = function(experiment){
        this.experiment = experiment;
    };

    this.setRoutine = function(routine){
        this.routine = routine;
    };

    this.draw = function(){
        if ((millis() - this.t_start > timestart)){
            if (timestop == null | (millis() - this.t_start) - timestop < 0 ){
            fill(this.color);
            textSize(this.textSize);
            textAlign(CENTER);
            text(this.text, this.posx, this.posy);
            }

        }
    };

    this.update = function(){
        if (typeof s_text === "function"){
            this.text = s_text();
        }

        if (typeof col === "function"){
            this.color = color(col());
        }
        if (timestop != null & (millis() - this.t_start) - timestop > 0 ){
            this.finished = true;
        }
        return true;
    };

    this.start = function(t_start){
        this.t_start = t_start;
        this.finished = false;

    };


}

function KeyboardResponse(name, keys = [ENTER], force_end_of_routine = true){
    this.name = name;
    this.keys = keys;
    this.t_start = null;
    this.experiment = null;
    this.routine = null;
    this.lock = false;
    this.finished = false;
    this.response = null;
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
}


function ImageStimulus(name, img, rotation = 0, pos = [0.5,0.5], timestart = 0, timestop = null){
    this.name = name;
    if (typeof img === "function"){
        this.img = img();
    } else{
        this.img = img;
    }

    if (typeof rotation === "function"){
        this.rotation = rotation();
    } else{
        this.rotation = rotation;
    }

    this.t_start = null;
    this.experiment = null;
    this.routine = null;
    this.posx = pos[0] * width;
    this.posy = pos[1] * height;
    this.finished = null;

    this.setExperiment = function(experiment){
        this.experiment = experiment;
    };

    this.setRoutine = function(routine){
        this.routine = routine;
    };

    this.draw = function(){
        if ((millis() - this.t_start > timestart)){
            if (timestop == null | (millis() - this.t_start) - timestop < 0 ){
                push();
                translate(this.img.width/2 + this.posx/2, this.img.height/2 + this.posy/2);
                rotate(radians(this.rotation));
                imageMode(CENTER);
                image(this.img, 0, 0);
                pop();

            }

        }
    };

    this.update = function(){
        if (typeof img === "function"){
            this.img = img();
        } else{
            this.img = img;
        }

        if (typeof rotation === "function"){
            this.rotation = rotation();
        } else{
            this.rotation = rotation;
        }
        if (timestop != null & (millis() - this.t_start) - timestop > 0 ){
            this.finished = true;
        }

        return true;
    };

    this.start = function(t_start){
        this.t_start = t_start;
        this.finished = false;
    };
}


function SliderResponse(name, label, confirm_label, min = 1, max = 7, step = 1, pos = [0.5, 0.65]){
    this.name = name;
    this.slider = null;
    this.posx = pos[0];
    this.posy = pos[1];
    this.resp = null;
    this.t_start = null;
    this.confirm_button = null;
    this.clicked = false;

    this.setExperiment = function(experiment){
        this.experiment = experiment;
    };

    this.setRoutine = function(routine){
        this.routine = routine;
    };

    this.start = function(t_start){
        this.t_start = t_start;
        this.clicked = false;
        this.slider = createSlider(min, max, min, step);
        this.slider.position(this.posx * width - width/8, this.posy * height);
        this.slider.style('width', width/4 + 'px');
        this.slider.elt.setAttribute('list', 'steplist');
        this.confirm_button = createButton(confirm_label);
        this.confirm_button.position(this.posx * width, this.posy * height + 0.1*height);
        s = this;
        this.confirm_button.mousePressed(function(){s.clicked = true; console.log(this.clicked);});

        dlist = document.createElement('datalist');
        dlist.setAttribute('id', 'steplist');
        for (var i = min; i<max+1; i++){
            o = document.createElement('option');
            o.innerHTML = i;
            dlist.appendChild(o);
        }
        document.body.appendChild(dlist);
    };

    this.draw = function(){ };

    this.update = function() {
        this.resp = this.slider.value();
        console.log(this.clicked);
        if (this.clicked){
            this.experiment.addData({name: this.name, 'rt': millis() - this.t_start, 'resp' : this.resp});
            this.slider.remove();
            this.confirm_button.remove();
            return false;
        }
    };
    };



function CodeComponent(name){
    this.name = name;
    this.every_frame = [];
    this.at_the_start = [];

    this.setExperiment = function(experiment){
        this.experiment = experiment;
    };

    this.setRoutine = function(routine){
        this.routine = routine;
    };

    this.start = function(t_start){
        for (var i = 0; i < this.at_the_start.length; i++){
            this.at_the_start[i]();
        }
    };


    this.update = function(){
        for (var i = 0; i < this.every_frame.length; i++){
            this.every_frame[i]();
        }

    };

    this.draw = function() {} ;

}



function ExpInfoBox(data){
    this.html_elements = [];
    this.data = data;
    this.clicked = false;


    this.setExperiment = function(experiment){
        this.experiment = experiment;
    };

    this.setRoutine = function(routine){
        this.routine = routine;
    };

    this.start = function(){
        var y = height/2 - 1/2*50*data.length;
        for (var i=0; i< data.length; i++){
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

    this.update = function(){
        background(255);
        var y = height/2 - 1/2*50*data.length;
        for (var i=0; i< data.length; i++){
            textSize(20);
            textAlign(CENTER, TOP);
            text(data[i], width/2 - 115, y);
            y += 50;
        };
        if (this.clicked){
            expInfo = {};
            for (var i=0; i < data.length; i++){
                expInfo[data[i]] = this.html_elements[i].value();
            }
            this.experiment.expInfo = expInfo;
            for (var j = 0; j < this.html_elements.length; j++){
                this.html_elements[j].remove();
            }
            console.log(expInfo);
            return true;
        };
    };

}



//TODO: Dopiero zacząłem...
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
