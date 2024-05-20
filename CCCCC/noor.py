import csv
import re
import warnings

import joblib
import numpy as np
import pandas as pd
from sklearn import preprocessing
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, _tree
from joblib import dump

# تعطيل ظهور الأخطاء
warnings.filterwarnings("ignore")  # Disable warnings

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

# Function to display a welcome message
def welcome_message():
    print("\n\n\n\t\t\t\t\t\tWelcome to your DOC!")

# Call the function to display the welcome message
welcome_message()

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
        print("You should take the consultation from doctor.")
    else:
        print("It might not be that bad but you should take precautions.")

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
def getInfo():
    print("\nWhat's your Name? \t\t\t\t", end="->\t")
    name = input("")  # endpoint
    print("Hello, ", name)

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

# Function to convert decision tree to code
def tree_to_code(tree, feature_names):
    tree_ = tree.tree_
    feature_name = [
        feature_names[i] if i != _tree.TREE_UNDEFINED else "undefined!"
        for i in tree_.feature
    ]

    chk_dis = ",".join(feature_names).split(",")
    symptoms_present = []

    while True:
        print("\nEnter the symptom you are experiencing  \t\t", end="->")
        disease_input = input("")# بص هنا
        conf, cnf_dis = check_pattern(chk_dis, disease_input)
        if conf == 1:
            print("searches related to input: ")
            for num, it in enumerate(cnf_dis):
                print(num, ")", it)
            if num != 0:
                print(f"Select the one you meant (0 - {num}):  ", end="")
                conf_inp = int(input("")) # بص هنا
            else:
                conf_inp = 0

            disease_input = cnf_dis[conf_inp]
            break
        else:
            print("Enter valid symptom.")

    while True:
        try:
            num_days = int(input("Okay. From how many days ? : "))# بص هنا
            break
        except:
            print("Enter valid input.")

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
            print("Are you experiencing any " + symptoms_given, "? : ", end='')
            print("\n\n\tPlease answer by 'yes' or 'no' and then press Enter to answer each question")
            for syms in list(symptoms_given):
                inp = ""

                while True:
                    inp = input("")# بص هنا
                    if (
                            inp == "yes" or inp == "Yes" or inp == "True" or inp == "true" or inp == "t" or inp == "y" or inp == "Y" or inp == "no" or inp == "No" or inp == "no" or inp == "n" or inp == "N"):
                        break
                    else:
                        print("provide answers (yes/no/y/n) : \n\n", end="")
                if (inp == "yes" or "Y" or "yes" or "y" or "Y" or "True" or "true" or "t"):
                    symptoms_exp.append(syms)

            second_prediction = sec_predict(symptoms_exp)
            # print(second_prediction)
            calc_condition(symptoms_exp, num_days)
            if (present_disease[0] == second_prediction[0]):
                print("You may have ", present_disease[0])
                print(description_list[present_disease[0]])

            else:
                print("You may have ", present_disease[0], "or ", second_prediction[0])
                print(description_list[present_disease[0]])
                print(description_list[second_prediction[0]])

            precution_list = precautionDictionary[present_disease[0]]
            print("Take following measures : ")
            for i, j in enumerate(precution_list):
                print(i + 1, ")", j)

    recurse(0, 1)

# Load data from CSV files into dictionaries
getSeverityDict()
getDescription()
getprecautionDict()

# Get user info
getInfo()

# Convert the decision tree to code and interact with user to diagnose
tree_to_code(clf, cols)

print("--------------------------------------Thank You--------------------------------------------------")

# Save the model to a file
joblib.dump(tree_to_code, 'model11.pk1')
