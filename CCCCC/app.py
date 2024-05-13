import re
import pandas as pd
import pyttsx3
from sklearn import preprocessing
from sklearn.tree import DecisionTreeClassifier, _tree
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
import csv
import warnings

from flask import Flask, render_template, request

app = Flask(__name__)

# Disable warnings
warnings.filterwarnings("ignore")

# Load data
training = pd.read_csv('Data/Training.csv')
testing = pd.read_csv('Data/Testing.csv')
cols = training.columns
cols = cols[:-1]

# Mapping strings to numbers
le = preprocessing.LabelEncoder()
le.fit(training['prognosis'])
y = le.transform(training['prognosis'])

x_train, x_test, y_train, y_test = train_test_split(training[cols], y, test_size=0.33, random_state=42)

# Train models
clf = DecisionTreeClassifier()
clf.fit(x_train, y_train)

model = SVC()
model.fit(x_train, y_train)

# Other functions
description_list = {}
severityDictionary = {}
precautionDictionary = {}

def welcome_message():
    print("\n\n\n\t\t\t\t\t\tWelcome to your DOC!")

def getDescription():
    global description_list
    with open('MasterData\symptom_Description.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        for row in csv_reader:
            description_list[row[0]] = row[0]

def getseverityDict():
    global severityDictionary
    with open('MasterData\Symptom_severity.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        for row in csv_reader:
            severityDictionary[row[0]] = int(row[2])

def getprecautionDict():
    global precautionDictionary
    with open('MasterData\symptom_precaution.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        for row in csv_reader:
            precautionDictionary[row[0]] = [row[1], row[2], row[3], row[4]]

def getInfo():
    print("\nWhat's your Name? \t\t\t\t", end="->\t")
    name = input("")
    print("Hello, ", name)

def check_pattern(dis_list, inp):
    pred_list = []
    inp = inp.replace(' ', '_')
    patt = f"{inp}"
    regexp = re.compile(patt)
    pred_list = [item for item in dis_list if regexp.search(item)]
    if (len(pred_list) > 0):
        return 1, pred_list
    else:
        return 0, []

def sec_predict(symptoms_exp):
    df = pd.read_csv('Data/Training.csv')
    X = df.iloc[:, :-1]
    y = df['prognosis']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=20)
    rf_clf = DecisionTreeClassifier()
    rf_clf.fit(X_train, y_train)

    symptoms_dict = {symptom: index for index, symptom in enumerate(X)}
    input_vector = np.zeros(len(symptoms_dict))
    for item in symptoms_exp:
        input_vector[[symptoms_dict[item]]] = 1

    return rf_clf.predict([input_vector])

def print_disease(node):
    node = node[0]
    val = node.nonzero()
    disease = le.inverse_transform(val[0])
    return list(map(lambda x: x.strip(), list(disease)))

def calc_condition(exp, days):
    sum = 0
    for item in exp:
        sum += severityDictionary.get(item, 0)
    if ((sum * days) / (len(exp) + 1) > 13):
        return "You should take the consultation from doctor."
    else:
        return "It might not be that bad but you should take precautions."

def tree_to_code(tree, feature_names, symptoms_exp, num_days):
    tree_ = tree.tree_
    feature_name = [
        feature_names[i] if i != _tree.TREE_UNDEFINED else "undefined!"
        for i in tree_.feature
    ]

    chk_dis = ",".join(feature_names).split(",")
    symptoms_present = []

    for item in symptoms_exp:
        if item in feature_names:
            disease_input = item
            break

    for i in range(len(feature_name)):
        if (feature_name[i] == disease_input):
            break

    def recurse(node, depth):
        indent = "  " * depth
        if tree_.feature[node] != _tree.TREE_UNDEFINED:
            name = feature_name[node]
            threshold = tree_.threshold[node]

            if name == disease_input:
                val = 1
            else:
                val = 0
            if val <= threshold:
                recurse(tree_.children_left[node], depth + 1)
            else:
                symptoms_present.append(name)
                recurse(tree_.children_right[node], depth + 1)
        else:
            present_disease = print_disease(tree_.value[node])
            red_cols = reduced_data.columns
            symptoms_given = red_cols[reduced_data.loc[present_disease].values[0].nonzero()]
            symptoms_exp = []

            for syms in list(symptoms_given):
                inp = ""
                inp = input(f"Are you experiencing any {syms}? (yes/no): ")
                if inp.lower() in ['yes', 'y', 'true', 't']:
                    symptoms_exp.append(syms)

            second_prediction = sec_predict(symptoms_exp)
            severity_level = calc_condition(symptoms_exp, num_days)

            if (present_disease[0] == second_prediction[0]):
                result = f"You may have {present_disease[0]}\n\nDescription: {description_list[present_disease[0]]}\n\n"
            else:
                result = f"You may have {present_disease[0]} or {second_prediction[0]}\n\nDescription: {description_list[present_disease[0]]}\n\n"
                result += f"Description: {description_list[second_prediction[0]]}\n\n"

            result += "Take the following measures:\n"
            precautions = precautionDictionary[present_disease[0]]
            for i, j in enumerate(precautions):
                result += f"{i+1}) {j}\n"

            return result

    return recurse(0, 1)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/diagnose', methods=['POST'])
def diagnose():
    symptoms_exp = request.form.getlist('symptoms')
    num_days = request.form['days']
    result = tree_to_code(clf, cols, symptoms_exp, num_days)
    return render_template('result.html', result=result)


def getseverityDict():
    pass


if __name__ == "__main__":
    welcome_message()
    getDescription()
    getseverityDict()
    getprecautionDict()
    getInfo()
    app.run(debug=True)
