from flask import Flask, request, send_from_directory, render_template
from flask_bootstrap import Bootstrap
import os.path
from flask_autoindex import AutoIndex
from glob import glob
from collections import defaultdict
from random import randint
from random import shuffle

import pandas as pd
import simplejson
from pprint import pprint as print


app = Flask(__name__)
Bootstrap(app)
base_url = '/var/www/apps/p5psych/'

AutoIndex(app, browse_root='base_url')


@app.route('/saveData', methods = ['GET', 'POST'])
def saveData():
    if request.method == 'POST':
        data = simplejson.loads(request.data)
        print(data)
        prefix = data['expname']
        data_df = pd.DataFrame(data['body'])
        data_df.to_excel(base_url + 'results/' + prefix + '_' + data['date'] + '.xlsx')

    return 'Sukces! Udało się zapisać dane. Możesz wyłączyć okienko przeglądarki.'

@app.route('/examples/<path:path>')
def serve_file(path):
    return send_from_directory('.', path)

@app.route('/examples', strict_slashes=False)
def examples():
    return(render_template('examples.html'))


@app.route('/cb/<exp>/<nmax>')
def return_cb(exp, nmax):
    completed = glob('results/{exp}*.xlsx'.format(exp = exp))
    counter = {str(i) : 0 for i in range(1,int(nmax)+1)}
    for result in completed:
        v = result.split('_')[1]
        counter[v] += 1
    inv_counter = defaultdict(list)
    for k, v in counter.items():
        inv_counter[v].append(k)

    minval = inv_counter[min(inv_counter.keys())]
    shuffle(minval)
    print(counter)
    print(inv_counter)
    print(minval)



    try:
        return str(minval[0])
    except Exception as e:
        print(e)
        return str(randint(1, int(nmax)))



@app.route('/badania/badanie_marzec', strict_slashes=False)
def badanie1():
    return(render_template('badanie1.html'))

@app.route('/badania/badanie_kwiecien', strict_slashes=False)
def badanie2():
    return(render_template('badanie2.html'))

@app.route('/badania/badanie_maj', strict_slashes=False)
def badanie3():
    return(render_template('badanie3.html'))

@app.route('/badania/badanie_esee', strict_slashes=False)
def badanie_esee():
    return(render_template('badanie4.html'))
