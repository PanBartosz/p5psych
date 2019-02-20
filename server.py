from flask import Flask, request, send_from_directory, render_template
from flask_bootstrap import Bootstrap
import os.path
from flask_autoindex import AutoIndex
from glob import glob
from collections import defaultdict
from random import randint

import pandas as pd
import simplejson
from pprint import pprint as print


app = Flask(__name__)
Bootstrap(app)
AutoIndex(app, browse_root='/var/www/apps/p5psych')


@app.route('/saveData', methods = ['GET', 'POST'])
def saveData():
    if request.method == 'POST':
        data = simplejson.loads(request.data)
        print(data)
        prefix = data['expname']
        data_df = pd.DataFrame(data['body'])
        data_df.to_excel('results/' + prefix + '_' + data['date'] + '.xlsx')

    return 'Success!'

@app.route('/examples/<path:path>')
def serve_file(path):
    return send_from_directory('.', path)

@app.route('/examples', strict_slashes=False)
def examples():
    return(render_template('examples.html'))

@app.route('/cb/<exp>/<nmax>')
def return_cb(exp, nmax):
    completed = glob('results/{exp}*.xlsx'.format(exp = exp))
    counter = {str(i) : 0 for i in range(1,int(nmax+1))}
    for result in completed:
        v = result.split('_')[1]
        counter[v] += 1
    c_sorted = sorted(counter, key = counter.get)
    try:
        return str(c_sorted[0])
    except Exception as e:
        print(e)
        return str(randint(1, int(nmax)))



