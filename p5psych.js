function Experiment(){
    this.routines = [];
    this.currentRoutine = null;
    this.routineCounter = 0;

    this.addRoutine = function(routine){
        this.routines.push(routine);
    };

    this.start = function(){
        this.currentRoutine = this.routines[this.routineCounter];
        this.currentRoutine.setExperiment(this);
        this.currentRoutine.start();
    };

    this.nextRoutine = function(){
        this.routineCounter += 1;
        this.currentRoutine = this.routines[this.routineCounter];
        this.currentRoutine.setExperiment(this);
        this.currentRoutine.start();
    };

    this.update = function(){
        next = this.currentRoutine.update();
        if (next){
            this.nextRoutine();
        }
    };

    this.addData = function(data){
        // Tu jeszcze nic nie ma ale kiedyś na pewno będzie...
        console.log(data);
    };
}



function Loop(conditions, nrep = 1){
    this.nrep = nrep;
    this.conditions = [];
    for (var i = 0; i < this.nrep; i++){
        this.conditions = this.conditions.concat(conditions);
    }
    console.log(this.conditions);
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
        console.log(this.trialCounter);
        this.currentTrial = this.conditions[this.trialCounter];
        this.currentRoutine = this.routines[this.routineCounter];
        this.currentRoutine.setExperiment(this.experiment);
        this.currentRoutine.start();
        console.log(this.currentTrial);
    };

    this.start = function(){
        this.currentRoutine = this.routines[this.routineCounter];
        this.currentRoutine.setExperiment(this.experiment);
        this.currentTrial = this.conditions[this.trialCounter];
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

function TextStimulus(s_text, s_text_size = 32, pos = [0.5, 0.5], col = [0,0,0], timestart = 0, timestop = null){
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

function KeyboardResponse(keys = [ENTER]){
    this.keys = keys;
    this.t_start = null;
    this.experiment = null;
    this.routine = null;
    this.lock = false;
    this.finished = false;

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
            this.experiment.addData(['resp', millis() - this.t_start, keyCode]);
            return false;
        } else {
            return true;
        };
    };
}


function ImageStimulus(img, rotation = 0, pos = [0.5,0.5], timestart = 0, timestop = null){
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
                console.log(this.rotation);
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
