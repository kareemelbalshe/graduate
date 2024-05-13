import json
from flask import Flask, request, jsonify
import pickle

from noor import clf, check_pattern, print_disease, reduced_data, sec_predict, calc_condition, description_list, \
    precautionDictionary, cols

app = Flask(__name__)

# Load the model
with open("model11.pk1", "rb") as model_file:
    model = pickle.load(model_file)


def predict_symptoms(symptoms):
    # Your symptom prediction logic goes here
    # This function should take symptoms as input and return a prediction
    # For demonstration purposes, let's assume we return a dummy prediction
    return "Dummy prediction"


@app.route('/predict_symptoms', methods=['POST'])
def predict_symptoms_route():
    # Get data from the request
    data = request.json

    # Extract relevant data from the request JSON
    name = data.get('name', '')
    disease_input = data.get('disease_input', '')
    num_days = data.get('num_days', 0)
    syms = data.get('syms', '').split(',')

    # Perform any necessary processing on the input data

    # Call the predict_symptoms function with the extracted symptoms
    prediction = predict_symptoms(syms)

    # Return the prediction as JSON
    return jsonify({'name': name, 'prediction': prediction})


if __name__ == "__main__":
    app.run(debug=True)
