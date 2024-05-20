# flask_app.py
from flask import Flask, request, jsonify
import csv
import re
import warnings

# import joblib
import numpy as np
import pandas as pd
from sklearn import preprocessing
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, _tree

warnings.filterwarnings("ignore")

# تعريف متغير عام
# global_variable = 10

# def modify_global():
#     global global_variable  # استخدام الكلمة المفتاحية global لتغيير قيمة المتغير العام
#     global_variable = 20
#     print(f"Value inside modify_global: {global_variable}")

# def print_global():
#     print(f"Value inside print_global: {global_variable}")

# # استدعاء الدالة التي تعدل المتغير العام
# modify_global()

# # استدعاء الدالة التي تطبع قيمة المتغير العام
# print_global()

app = Flask(__name__)
# Load training and testing data
training = pd.read_csv('Data/Training.csv')
testing = pd.read_csv('Data/Testing.csv')
cols = training.columns
cols = cols[:-1]  # All columns except the last one
x = training[cols]
y = training['prognosis']
y1 = y

# Group training data by prognosis and get max value for each group
reduced_data = training.groupby(training['prognosis']).max()

# Label encoding for target variable 'prognosis'
le = preprocessing.LabelEncoder()
le.fit(y)
y = le.transform(y)

# Split data into training and testing sets
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.33, random_state=42)
testx = testing[cols]
testy = testing['prognosis']
testy = le.transform(testy)

# Initialize and train Decision Tree Classifier
clf1 = DecisionTreeClassifier()
clf = clf1.fit(x_train, y_train)

# Initialize dictionaries
severityDictionary = dict()
description_list = dict()
precautionDictionary = dict()
symptoms_dict = {}

# Map symptoms to their indices
for index, symptom in enumerate(x):
    symptoms_dict[symptom] = index


# Function to calculate condition based on symptoms and duration
def calc_condition(exp, days):
    sum = 0
    for item in exp:
        sum += severityDictionary.get(item, 0)
    if ((sum * days) / (len(exp) + 1) > 13):  # threshold value
        return "You should take the consultation from doctor."
    else:
        return "It might not be that bad but you should take precautions."


# Function to load symptom descriptions
def getDescription():
    global description_list
    with open('MasterData/symptom_Description.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        for row in csv_reader:
            _description = {row[0]: row[1]}
            description_list.update(_description)


# Function to load symptom severity dictionary
def getSeverityDict():
    global severityDictionary
    with open('MasterData/symptom_severity.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        try:
            for row in csv_reader:
                _diction = {row[0]: int(row[1])}
                severityDictionary.update(_diction)
        except:
            pass


# Function to load symptom precaution dictionary
def getprecautionDict():
    global precautionDictionary
    with open('MasterData/symptom_precaution.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        for row in csv_reader:
            _prec = {row[0]: [row[1], row[2], row[3], row[4]]}
            precautionDictionary.update(_prec)


# Function to get user's name
# def getInfo():
#     print("\nWhat's your Name? \t\t\t\t", end="->\t")
#     name = input("")  # endpoint
#     print("Hello, ", name)

# Function to check if a pattern matches any disease name
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


# Function to make a secondary prediction
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


# Function to print the disease based on tree node value
def print_disease(node):
    node = node[0]
    val = node.nonzero()
    disease = le.inverse_transform(val[0])
    return list(map(lambda x: x.strip(), list(disease)))


getSeverityDict()
getDescription()
getprecautionDict()

disease_input = ""
conf_inp = 0
num_days = 0


@app.route('/welcome', methods=['POST'])
# Function to display a welcome message
def welcome_message():
    return jsonify({"message": "Welcome to your DOC!", "message2": "Enter the symptom you are experiencing ->"})


@app.route('/set_disease', methods=['POST'])
def set_disease():
    global disease_input

    chk_dis = ",".join(cols).split(",")
    disease_input = request.json.get('disease_input')
    conf, cnf_dis = check_pattern(chk_dis, disease_input)

    if conf == 1:
        back = [(num, it) for num, it in enumerate(cnf_dis)]
        nu = len(cnf_dis) - 1
        return jsonify({
            "message": "searches related to input:",
            "message2": back,
            "message3": f"Select the one you meant (0 - {nu}):"
        })
    else:
        return jsonify({"message": "Enter valid symptom."})


@app.route('/set_num_disease', methods=['POST'])
def set_num_disease():
    global disease_input, conf_inp

    chk_dis = ",".join(cols).split(",")
    conf, cnf_dis = check_pattern(chk_dis, disease_input)

    if conf == 1:
        back = [(num, it) for num, it in enumerate(cnf_dis)]
        n1 = len(back) - 1

        if n1 != 0:
            conf_inp = int(request.json.get('conf_inp'))
            if conf_inp is None or not isinstance(conf_inp, int) or conf_inp < 0 or conf_inp > n1:
                return jsonify({"message": f"Invalid input. Please select a number between 0 and {n1}."})
        else:
            conf_inp = 0

        disease_input = cnf_dis[conf_inp]
        return jsonify({"message": "Okay. From how many days?"})
    else:
        return jsonify({"message": "Enter valid symptom."})


@app.route('/set_num_days', methods=['POST'])
def tree_to_code():
    global disease_input, conf_inp, num_days

    # Assuming clf, cols, and other necessary components are defined elsewhere
    chk_dis = ",".join(cols).split(",")
    conf, cnf_dis = check_pattern(chk_dis, disease_input)

    if conf == 1:
        back = [(num, it) for num, it in enumerate(cnf_dis)]
        n1 = len(back) - 1

        if n1 != 0:
            if conf_inp is None or not isinstance(conf_inp, int) or conf_inp < 0 or conf_inp > n1:
                return jsonify({"message": f"Invalid input. Please select a number between 0 and {n1}."})
        else:
            conf_inp = 0

        disease_input = cnf_dis[conf_inp]
    else:
        return jsonify({"message": "Enter valid symptom."})

    try:
        num_days = int(request.json.get('num_days'))
    except (ValueError, TypeError):
        return jsonify({"message": "Enter valid input for the number of days."})

    tree_ = clf.tree_
    feature_name = [
        cols[i] if i != _tree.TREE_UNDEFINED else "undefined!"
        for i in tree_.feature
    ]
    symptoms_present = []

    def recurse(node, depth):
        if tree_.feature[node] != _tree.TREE_UNDEFINED:
            name = feature_name[node]
            threshold = tree_.threshold[node]

            if name == disease_input:
                val = 1
            else:
                val = 0
            if val <= threshold:
                return recurse(tree_.children_left[node], depth + 1)
            else:
                symptoms_present.append(name)
                return recurse(tree_.children_right[node], depth + 1)
        else:
            present_disease = print_disease(tree_.value[node])
            red_cols = reduced_data.columns
            symptoms_given = red_cols[reduced_data.loc[present_disease].values[0].nonzero()]
            symptoms_with_index = [{"index": i, "symptom": symptom} for i, symptom in enumerate(symptoms_given)]
            return jsonify({
                "message": symptoms_with_index,
                "message2": "Please answer by 'yes' or 'no' and then press Enter to answer each question."
            })

    return recurse(0, 1)


@app.route('/set_y_n', methods=['POST'])
def set_y_n():
    global disease_input, conf_inp, num_days

    chk_dis = ",".join(cols).split(",")
    conf, cnf_dis = check_pattern(chk_dis, disease_input)

    if conf == 1:
        back = [(num, it) for num, it in enumerate(cnf_dis)]
        n1 = len(back) - 1

        if n1 != 0:
            if conf_inp is None or not isinstance(conf_inp, int) or conf_inp < 0 or conf_inp > n1:
                return jsonify({"message": f"Invalid input. Please select a number between 0 and {n1}."})
        else:
            conf_inp = 0

        disease_input = cnf_dis[conf_inp]
    else:
        return jsonify({"message": "Enter valid symptom."})

    tree_ = clf.tree_
    feature_name = [
        cols[i] if i != _tree.TREE_UNDEFINED else "undefined!"
        for i in tree_.feature
    ]
    symptoms_present = []

    def recurse(node, depth):
        if tree_.feature[node] != _tree.TREE_UNDEFINED:
            name = feature_name[node]
            threshold = tree_.threshold[node]

            if name == disease_input:
                val = 1
            else:
                val = 0
            if val <= threshold:
                return recurse(tree_.children_left[node], depth + 1)
            else:
                symptoms_present.append(name)
                return recurse(tree_.children_right[node], depth + 1)
        else:
            present_disease = print_disease(tree_.value[node])
            red_cols = reduced_data.columns
            symptoms_given = red_cols[reduced_data.loc[present_disease].values[0].nonzero()]
            symptoms_exp = []
            inp = request.json.get('inp')
            word_list = inp.split()
            for syms in list(symptoms_given):
                i = 0
                if word_list[i] is None or word_list[i].lower() not in ['yes', 'no', 'y', 'n']:
                    return jsonify({"message": "Provide answers (yes/no/y/n):"})
                if word_list[i].lower() in ['yes', 'y']:
                    symptoms_exp.append(syms)
                i = i + 1

            second_prediction = sec_predict(symptoms_exp)
            message = calc_condition(symptoms_exp, num_days)
            message1 = ""
            message2 = ""
            message3 = ""
            if present_disease[0] == second_prediction[0]:
                message1 = f"You may have {present_disease[0]}"
                message2 = description_list[present_disease[0]]
            else:
                message1 = f"You may have {present_disease[0]} or {second_prediction[0]}"
                message2 = description_list[present_disease[0]]
                message3 = description_list[second_prediction[0]]

            precaution_list = precautionDictionary[present_disease[0]]
            precautions = [(i + 1, j) for i, j in enumerate(precaution_list)]
            return jsonify({
                "message": message,
                "message1": message1,
                "message2": message2,
                "message3": message3,
                "message4": "Take following measures:",
                "message5": precautions
            })

    return recurse(0, 1)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')

# def tree_to_code(tree, feature_names):
#     tree_ = tree.tree_
#     feature_name = [
#         feature_names[i] if i != _tree.TREE_UNDEFINED else "undefined!"
#         for i in tree_.feature
#     ]

#     chk_dis = ",".join(feature_names).split(",")
#     symptoms_present = []

#     while True:
#         print("\nEnter the symptom you are experiencing  \t\t", end="->")
#         disease_input = input("")# بص هنا
#         conf, cnf_dis = check_pattern(chk_dis, disease_input)
#         if conf == 1:
#             print("searches related to input: ")
#             for num, it in enumerate(cnf_dis):
#                 print(num, ")", it)
#             if num != 0:
#                 print(f"Select the one you meant (0 - {num}):  ", end="")
#                 conf_inp = int(input("")) # بص هنا
#             else:
#                 conf_inp = 0

#             disease_input = cnf_dis[conf_inp]
#             break
#         else:
#             print("Enter valid symptom.")

#     while True:
#         try:
#             num_days = int(input("Okay. From how many days ? : "))# بص هنا
#             break
#         except:
#             print("Enter valid input.")

#     def recurse(node, depth):
#         indent = "  " * depth
#         if tree_.feature[node] != _tree.TREE_UNDEFINED:
#             name = feature_name[node]
#             threshold = tree_.threshold[node]

#             if name == disease_input:
#                 val = 1
#             else:
#                 val = 0
#             if val <= threshold:
#                 recurse(tree_.children_left[node], depth + 1)
#             else:
#                 symptoms_present.append(name)
#                 recurse(tree_.children_right[node], depth + 1)
#         else:
#             present_disease = print_disease(tree_.value[node])
#             red_cols = reduced_data.columns
#             symptoms_given = red_cols[reduced_data.loc[present_disease].values[0].nonzero()]
#             symptoms_exp = []
#             print("Are you experiencing any " + symptoms_given, "? : ", end='')
#             print("\n\n\tPlease answer by 'yes' or 'no' and then press Enter to answer each question")
#             for syms in list(symptoms_given):
#                 inp = ""

#                 while True:
#                     inp = input("")# بص هنا
#                     if (
#                             inp == "yes" or inp == "Yes" or inp == "True" or inp == "true" or inp == "t" or inp == "y" or inp == "Y" or inp == "no" or inp == "No" or inp == "no" or inp == "n" or inp == "N"):
#                         break
#                     else:
#                         print("provide answers (yes/no/y/n) : \n\n", end="")
#                 if (inp == "yes" or "Y" or "yes" or "y" or "Y" or "True" or "true" or "t"):
#                     symptoms_exp.append(syms)

#             second_prediction = sec_predict(symptoms_exp)
#             # print(second_prediction)
#             calc_condition(symptoms_exp, num_days)
#             if (present_disease[0] == second_prediction[0]):
#                 print("You may have ", present_disease[0])
#                 print(description_list[present_disease[0]])

#             else:
#                 print("You may have ", present_disease[0], "or ", second_prediction[0])
#                 print(description_list[present_disease[0]])
#                 print(description_list[second_prediction[0]])

#             precution_list = precautionDictionary[present_disease[0]]
#             print("Take following measures : ")
#             for i, j in enumerate(precution_list):
#                 print(i + 1, ")", j)

#     recurse(0, 1)
