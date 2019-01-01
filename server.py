from flask import Flask, request, send_from_directory
import pandas as pd
import simplejson
from pprint import pprint as print

app = Flask(__name__)

@app.route('/saveData', methods = ['GET', 'POST'])
def saveData():
    if request.method == 'POST':
        data = simplejson.loads(request.data)
        print(data)
        data_df = pd.DataFrame(data['body'])
        data_df.to_excel(data['date'] + '.xlsx')

    return 'Success!'

@app.route('/examples/<path:path>')
def serve_file(path):
    return send_from_directory('.', path)
