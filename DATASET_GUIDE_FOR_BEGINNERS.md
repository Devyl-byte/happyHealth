# Virtual Patient Model: Beginner-Friendly Dataset Guide

## Purpose of this guide

This document explains the datasets selected for the **Virtual Patient Model** in simple language. It describes:

- What each dataset contains
- What the technical terms mean
- Why each dataset is useful
- Where it will be used in the project
- What each dataset cannot reliably be used for

The basic project goal is:

> Build a research model that learns how a person's glucose may change after food, activity, medication, and other events.

This is a research project. The datasets and models should not be treated as validated medical advice or used independently for diagnosis, insulin dosing, or treatment decisions.

## Contents

1. [Basic concepts](#1-basic-concepts)
2. [ShanghaiT2DM and ShanghaiT1DM](#2-shanghait2dm-and-shanghait1dm)
3. [CGMacros](#3-cgmacros)
4. [Indian Food Composition Tables 2017](#4-indian-food-composition-tables-2017)
5. [BIG IDEAs](#5-big-ideas)
6. [Colás 2019](#6-colás-2019)
7. [Synthea](#7-synthea)
8. [Glucose-ML Project](#8-glucose-ml-project)
9. [How the datasets fit together](#9-how-the-datasets-fit-together)
10. [Recommended first implementation](#10-recommended-first-implementation)
11. [Beginner glossary](#11-beginner-glossary)

---

## 1. Basic concepts

### What is a dataset?

A **dataset** is an organised collection of information. Many datasets are arranged like spreadsheets:

- A **row** represents one observation, such as one glucose reading at a particular time.
- A **column** represents one kind of information, such as glucose, timestamp, carbohydrates, or heart rate.
- A **participant** is one person included in a research study.
- A **recording** is a period during which information was collected from a participant.
- A **time series** is a sequence of measurements arranged in time order.

Example:

| Time | Glucose | Carbohydrates | Heart rate |
| --- | ---: | ---: | ---: |
| 08:00 | 95 mg/dL | 0 g | 72 bpm |
| 08:15 | 103 mg/dL | 45 g | 74 bpm |
| 08:30 | 126 mg/dL | 0 g | 76 bpm |

This example shows that 45 grams of carbohydrate were recorded at 08:15 and were followed by an increase in glucose. A machine-learning model attempts to learn patterns like this from many meals and many participants.

### Type 1 and Type 2 diabetes

- **Type 1 diabetes (T1D or T1DM):** The immune system damages the cells that produce insulin. The body consequently produces little or no insulin.
- **Type 2 diabetes (T2D or T2DM):** The body may still produce insulin, but it does not use it effectively. This is commonly called **insulin resistance**.
- **Prediabetes:** Glucose regulation is worse than normal but has not reached the diagnostic level for Type 2 diabetes.

The first version of this project will focus mainly on Type 2 diabetes.

---

## 2. ShanghaiT2DM and ShanghaiT1DM

**Primary source:** [Chinese diabetes datasets for data-driven machine learning](https://www.nature.com/articles/s41597-023-01940-7)

**Dataset DOI:** [10.6084/m9.figshare.20425518.v5](https://doi.org/10.6084/m9.figshare.20425518.v5)

**Licence:** Creative Commons Attribution 4.0 (CC BY 4.0)

### What it contains

The downloaded dataset contains:

- 100 people with Type 2 diabetes
- 12 people with Type 1 diabetes
- 109 Type 2 diabetes recording files
- 16 Type 1 diabetes recording files
- Approximately 3–14 days of monitoring per recording
- Glucose measurements every 15 minutes
- Dietary information
- Insulin and non-insulin diabetes medication
- Clinical characteristics and laboratory results

Some people were recorded more than once. This is why 100 Type 2 participants produced 109 recording files.

### CGM glucose

**CGM** means **Continuous Glucose Monitor**. It is a small sensor worn on the body that repeatedly measures glucose.

The Shanghai dataset records CGM glucose approximately every 15 minutes. Glucose is reported in **mg/dL**, meaning milligrams of glucose per decilitre.

The CGM sequence is the main signal that our model will attempt to predict.

### CBG glucose

**CBG** means **Capillary Blood Glucose**. It is usually measured using a finger-prick glucose meter.

CGM and CBG are related but not identical:

- CBG measures blood obtained from a fingertip.
- CGM estimates glucose in the fluid surrounding cells.
- CBG is normally measured occasionally.
- CGM is measured repeatedly throughout the day.

CBG readings can help researchers check whether CGM measurements are reasonable.

### Dietary information

The dataset contains descriptions of what participants ate and when they ate it. Examples may include rice, vegetables, milk, bread, fruit, or meat.

This information is useful because it allows us to connect a meal with the glucose rise that follows it.

The dietary information is **self-reported**, meaning that the participant reported the meal. Self-reported data may sometimes be incomplete, approximate, or inaccurate.

### Insulin information

The dataset can contain several kinds of insulin information:

- **Subcutaneous insulin (s.c.):** Insulin injected under the skin.
- **Intravenous insulin (i.v.):** Insulin delivered directly into a vein.
- **Bolus insulin:** A dose commonly given around a meal to manage the expected glucose increase.
- **Basal insulin:** Background insulin intended to control glucose between meals and overnight.
- **CSII:** Continuous Subcutaneous Insulin Infusion, commonly known as an insulin pump.

Insulin information matters because a glucose change may be caused by both the meal and the insulin taken for that meal.

### Non-insulin hypoglycaemic agents

A **hypoglycaemic agent** is a medicine used to lower blood glucose. A non-insulin hypoglycaemic agent is therefore a diabetes medicine other than insulin.

These medicines may reduce glucose production, improve insulin sensitivity, slow carbohydrate absorption, or affect glucose through other mechanisms.

### Blood ketones

**Ketones** are chemicals produced when the body burns fat for energy. Very high ketones combined with high glucose may be associated with a dangerous condition called diabetic ketoacidosis.

Ketones were not measured continuously in this dataset. They were recorded when clinically relevant.

### Clinical and laboratory information

The summary spreadsheets contain information such as:

- Age and sex
- Height and weight
- BMI
- Diabetes duration
- Smoking and alcohol history
- Diabetes complications
- Other medical conditions
- Medication
- Laboratory results

Important terms include:

- **BMI:** Body Mass Index, calculated from height and weight. It is a rough measurement of body size.
- **HbA1c:** A blood test representing average glucose over approximately the previous two to three months.
- **Fasting glucose:** Glucose measured after a period without food.
- **Postprandial glucose:** Glucose measured after eating.
- **C-peptide:** A marker that helps estimate how much insulin the person's pancreas is producing.
- **Creatinine and eGFR:** Measurements related to kidney function.
- **Cholesterol and triglycerides:** Different types of fat found in the blood.
- **Comorbidity:** Another medical condition a participant has in addition to diabetes.

### Why it is useful

The Shanghai dataset can help us study:

- How glucose changes throughout the day
- How glucose rises after meals
- Whether insulin or medication changes the response
- Why different people respond differently
- Whether age, BMI, HbA1c, or diabetes duration affect glucose
- How much glucose changes during the next 30, 60, 90, or 120 minutes

### Where we will use it

ShanghaiT2DM will be the **main dataset for the first Virtual Patient Model**.

Possible model inputs include:

- Recent glucose readings
- Current time and time of day
- Meal description
- Insulin and medication
- Age, BMI, HbA1c, and other clinical characteristics

Possible model outputs include:

- Glucose after 30 minutes
- Glucose after 60 minutes
- Glucose after 120 minutes
- Maximum glucose after a meal
- Speed of the glucose rise
- Time required for glucose to return towards its earlier level

### Important limitation

All recordings from one person must remain in the same machine-learning group.

If one recording from a patient is used for training and another recording from the same patient is used for testing, the model has indirectly seen that patient before. This is called **data leakage** and can produce misleadingly good results.

---

## 3. CGMacros

**Primary source:** [CGMacros v1.0.0 on PhysioNet](https://physionet.org/content/cgmacros/1.0.0/)

**Licence:** Creative Commons Attribution-NonCommercial-ShareAlike 4.0 (CC BY-NC-SA 4.0)

### What it contains

CGMacros contains 45 participants:

- 14 with Type 2 diabetes
- 16 with prediabetes
- 15 considered healthy

Each participant was monitored for approximately ten days. The downloaded tabular data contains approximately 687,580 one-minute rows.

It combines:

- Two CGM devices
- Detailed meal nutrients
- Food photographs in the original archive
- Fitbit heart rate and activity
- Demographic information
- Body measurements
- Blood-test results
- Gut microbiome information

### Two CGM devices

Participants wore:

- A Dexcom G6 Pro
- A FreeStyle Libre Pro

Dexcom normally records approximately every five minutes, while Libre normally records approximately every 15 minutes.

The CGMacros participant files are organised into one-minute rows on a shared timeline. Some values between original sensor readings may have been aligned or estimated.

**Interpolation** means estimating a value between two measured points. For example, if glucose is 100 at 08:00 and 110 at 08:05, an estimated value at 08:01 may be around 102.

### Meal information

CGMacros has more detailed meal information than Shanghai. It includes:

- Meal time
- Meal type, such as breakfast, lunch, or dinner
- Calories
- Carbohydrates
- Protein
- Fat
- Fibre
- Estimated percentage of the meal consumed
- Meal photographs in the original archive

Important nutrition terms:

- **Calories:** A measurement of energy supplied by food.
- **Carbohydrates:** Sugars and starches. They normally have the most immediate effect on post-meal glucose.
- **Protein:** A nutrient used for muscles, enzymes, and tissue repair. Protein can also affect glucose, often more slowly than carbohydrates.
- **Fat:** A concentrated energy source. Fat can slow digestion and may delay the glucose peak.
- **Fibre:** A type of carbohydrate that is not fully digested. It can slow glucose absorption.
- **Macronutrients:** The major nutrient groups—carbohydrate, protein, and fat.

### Fitbit information

Participants wore a Fitbit smartwatch. Available fields include:

- Heart rate
- Estimated calories burned
- Physical activity
- MET values

**MET** means **Metabolic Equivalent of Task**. It represents activity intensity:

- Resting is approximately 1 MET.
- Light walking may be approximately 2–3 METs.
- More intense exercise produces a higher MET value.

The CGMacros file may store MET values after multiplying them by 10, so the data dictionary must be followed carefully.

### Personal and clinical information

CGMacros contains fields such as:

- Age
- Sex
- Ethnicity
- Height and weight
- BMI
- HbA1c
- Fasting glucose
- Insulin level
- Cholesterol
- Triglycerides
- Finger-prick glucose readings

### Gut microbiome

The **gut microbiome** is the community of microorganisms, mainly bacteria, living in the digestive system.

Researchers study the microbiome because gut bacteria may influence:

- Digestion
- Metabolism
- Inflammation
- Insulin sensitivity
- Responses to different foods

CGMacros contains the presence or absence of many bacterial types and several gut-health scores. The microbiome is not necessary for the first model because it adds substantial complexity, but it may be tested later.

### Why it is useful

CGMacros helps us learn that two meals with the same total calories can produce very different glucose responses.

For example:

- Meal A could be high in carbohydrate and low in fat.
- Meal B could contain less carbohydrate but more protein and fat.

Both meals might contain 500 calories, but their glucose curves may be different.

It can help answer questions such as:

- Did walking after a meal reduce the glucose rise?
- Did heart rate indicate physical activity?
- Does BMI affect meal response?
- Does HbA1c affect the size of the glucose spike?
- Does fibre reduce or delay the response?

### Where we will use it

CGMacros will be used to develop the **meal-response and activity components** of the Virtual Patient Model.

The model can learn a relationship such as:

```text
Meal carbohydrates
+ protein
+ fat
+ fibre
+ recent glucose
+ activity
+ heart rate
+ BMI
+ HbA1c
→ future glucose response
```

We should first build a basic model using ShanghaiT2DM and then gradually add features learned from CGMacros.

### Important limitations

- Only 14 participants have Type 2 diabetes.
- The licence contains a non-commercial restriction.
- Dates were deliberately shifted to protect privacy.
- The data dictionary appears to label HbA1c with the wrong unit. Values such as 4.6–8.5 behave like percentages, not mmol/mol. We must document this likely metadata error without changing the original raw data.
- Meal records can contain human reporting errors.

---

## 4. Indian Food Composition Tables 2017

**Primary source:** [Indian Food Composition Tables 2017, ICMR-NIN](https://www.nin.res.in/ebooks/IFCT2017.pdf)

### What it contains

The Indian Food Composition Tables contain nutrient information for approximately:

- 528 Indian foods
- 151 food components

Food groups include:

- Rice, wheat, and millets
- Pulses
- Vegetables and fruits
- Nuts and seeds
- Milk products
- Meat and fish
- Spices

For each food, the reference may include:

- Energy
- Carbohydrate
- Protein
- Fat
- Fibre
- Individual sugars
- Vitamins
- Minerals
- Amino acids
- Fatty acids
- Other food components

### Why it is useful

The Shanghai dataset may contain a meal description but not the exact nutrient values needed by a model.

For example:

> Two chapatis, dal, and vegetables

A model cannot directly use that sentence as a numerical input. We need to convert it into estimates such as:

- Carbohydrate grams
- Protein grams
- Fat grams
- Fibre grams
- Total energy

This process is called **nutrient mapping**.

### Where we will use it

We will use IFCT to create an Indian food lookup system.

Example:

```text
Food record: two chapatis
↓
Identify the matching wheat-flour entry
↓
Estimate the flour weight or serving size
↓
Look up nutrients per 100 grams
↓
Calculate nutrients for the estimated portion
```

If 100 grams of a food contains 60 grams of carbohydrate and the person ate 50 grams:

```text
Estimated carbohydrate = 60 × 50 ÷ 100 = 30 grams
```

Those 30 grams can then be supplied to the glucose model.

### Important limitations

- IFCT contains food composition, not patient or glucose measurements.
- Many entries describe raw foods, while people often eat cooked recipes.
- A dish such as biryani can vary considerably by recipe and portion size.
- Portion size must be measured, entered, or estimated.
- A calculated nutrient value is an estimate, not proof of exactly what a person consumed.

---

## 5. BIG IDEAs

**Primary source:** [BIG IDEAs v1.1.3 on PhysioNet](https://physionet.org/content/big-ideas-glycemic-wearable/1.1.3/)

**Licence:** Open Data Commons Attribution 1.0

### What we downloaded

For all 16 participants, we downloaded:

- Demographic information
- Dexcom CGM files
- Food logs
- Official licence
- Official checksum list

The selected local files contain:

- 36,962 numeric glucose readings
- 1,421 food-log rows
- HbA1c values ranging from 5.3% to 6.4%

The participants mainly had high-normal glucose or prediabetes, not established Type 2 diabetes.

### Food logs

Food logs can include:

- Date and time
- Food name
- Quantity and unit
- Calories
- Total carbohydrate
- Fibre
- Sugar
- Protein
- Fat

### What exists in the complete dataset

The complete BIG IDEAs dataset also contains signals from an Empatica wearable, including:

- Heart-rate-related signals
- Accelerometer measurements
- Skin temperature
- Electrodermal activity
- Blood-volume pulse

Technical terms:

- **Accelerometer:** A sensor that measures body movement.
- **Electrodermal activity (EDA):** Changes in the skin's electrical properties, often influenced by sweating and nervous-system activity.
- **Blood-volume pulse (BVP):** A light-based measurement of blood-volume changes associated with each heartbeat.
- **Wearable:** An electronic sensor worn on the body.

The full package was not downloaded because it would require approximately 34 GB after extraction. We selected the fields most relevant to the first model.

### Why it is useful

BIG IDEAs provides additional examples of:

- Timed food intake
- Glucose curves
- Early glucose-regulation problems
- Glucose responses before established Type 2 diabetes

It can help us examine the gradual difference between:

```text
High-normal glucose → Prediabetes → Type 2 diabetes
```

### Where we will use it

BIG IDEAs can be used for:

- Testing meal-extraction code
- Testing glucose-window generation
- Learning general glucose-curve patterns
- Pretraining an early model
- Checking whether a Type 2 model behaves sensibly for prediabetes

### Important limitation

The participants do not represent an established Type 2 diabetes population. BIG IDEAs should not be the main test dataset for the Type 2 Virtual Patient Model.

---

## 6. Colás 2019

**Primary source:** [Detrended Fluctuation Analysis in the prediction of Type 2 diabetes](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0225817)

**Licence:** Creative Commons Attribution 4.0 (CC BY 4.0)

### What it contains

The downloaded supplement contains:

- 208 participants
- 208 CGM case files
- 114,912 glucose readings
- Measurements every five minutes
- At least 24 hours of CGM per participant
- Approximately 48 hours for many participants
- Clinical and follow-up information

Participants initially had hypertension but did not have diagnosed diabetes. During follow-up, 17 participants developed Type 2 diabetes.

### Hypertension

**Hypertension** means persistently high blood pressure. It is associated with cardiovascular risk and often occurs alongside metabolic problems such as insulin resistance.

### What the study investigated

The researchers examined whether patterns in glucose signals could help predict who would later develop Type 2 diabetes.

They used measurements such as:

- Glucose variability
- MAGE
- CONGA-2
- Detrended Fluctuation Analysis
- Entropy-related measurements

### Glucose variability

**Glucose variability** describes how much glucose moves up and down.

Two people can have the same average glucose but different patterns:

- Person A stays close to 110 mg/dL all day.
- Person B repeatedly moves between 70 and 150 mg/dL.

Their averages may be similar, but Person B has greater glucose variability.

### MAGE

**MAGE** means **Mean Amplitude of Glycaemic Excursions**. It attempts to measure the average size of major glucose rises and falls.

### CONGA-2

**CONGA-2** compares glucose measurements separated by two hours and measures the variation in those differences.

### Entropy

In this context, **entropy** is a mathematical measurement of how irregular or unpredictable a glucose signal is.

### Detrended Fluctuation Analysis

**Detrended Fluctuation Analysis**, commonly abbreviated as DFA, is a mathematical technique used to study long-term patterns and complexity in a time series.

The important beginner-level idea is:

> Healthy glucose regulation may show a different pattern of complexity from impaired glucose regulation.

### Why it is useful

Colás may help us understand:

- Whether glucose patterns contain early warning signs
- Whether variability changes before diabetes develops
- How to calculate glucose-complexity features
- What a short CGM recording can reveal about metabolic condition

### Where we will use it

Colás is useful for a later **risk and progression module**.

Example:

```text
Short CGM recording
↓
Calculate glucose-pattern features
↓
Estimate whether the pattern resembles lower or higher metabolic risk
```

### Important limitation

This dataset does not contain detailed meal information. It is therefore not suitable as the main dataset for the first post-meal glucose-response model.

---

## 7. Synthea

**Primary source:** [Synthea downloads](https://synthetichealth.github.io/downloads.html)

### What synthetic data means

**Synthetic data** is computer-generated data designed to resemble real medical records. The patients are artificial and do not represent real people.

This makes synthetic data useful for safe software development and demonstrations.

### What it contains

The downloaded sample contains 108 synthetic patient rows and tables such as:

- Patients
- Medical conditions
- Encounters
- Observations
- Medications
- Procedures
- Care plans
- Allergies
- Immunisations
- Claims
- Healthcare organisations
- Healthcare providers

The sample contains:

- Six synthetic patients with a Type 2 diabetes condition record
- 34 synthetic patients with a prediabetes condition record

Important terms:

- **Encounter:** An interaction with the healthcare system, such as a clinic appointment or hospital visit.
- **Observation:** A recorded measurement or result, such as body weight, blood pressure, or a laboratory value.
- **Condition:** A diagnosis or health problem.
- **Care plan:** A structured plan for managing a patient's health.
- **Claim:** A billing record sent to an insurer or payer.
- **EHR:** Electronic Health Record, meaning a digital collection of medical information.

### Why it is useful

Synthea allows us to build and test the application without exposing real patient data.

We can use it to test:

- Patient registration
- Medical-history screens
- Medication timelines
- Database relationships
- API responses
- Dashboard layouts
- Exported patient reports

### Where we will use it

Synthea belongs mainly in the software layer:

```text
Synthetic patient
→ application database
→ patient timeline
→ dashboard
→ model-output demonstration
```

### Important limitation

Synthea does not contain realistic CGM trajectories for our purpose. It must not be used as evidence that the glucose prediction model is physiologically or clinically accurate.

---

## 8. Glucose-ML Project

**Primary source:** [Glucose-ML Project on GitHub](https://github.com/Augmented-Health-Lab/Glucose-ML-Project)

**Licence:** MIT for the repository code; underlying dataset licences vary

### What data harmonisation means

Different datasets often use different names and formats for the same concept.

Example:

| Dataset | Original glucose column |
| --- | --- |
| Shanghai | `CGM (mg / dl)` |
| CGMacros | `Dexcom GL` or `Libre GL` |
| BIG IDEAs | `Glucose Value (mg/dL)` |

**Data harmonisation** means converting these different formats into one consistent structure:

| participant_id | timestamp | glucose_mg_dl |
| --- | --- | ---: |
| P001 | 2026-01-01 08:00 | 104 |

### What the project contains

Glucose-ML includes:

- Dataset download programs
- Dataset-specific cleaning programs
- CGM harmonisation programs
- Standardised glucose files
- Participant metadata
- Preprocessing programs
- Machine-learning examples
- Case studies
- Feature-calculation tools

Its collection covers participants with:

- Type 1 diabetes
- Type 2 diabetes
- Prediabetes
- No diabetes

### Why it is useful

Without harmonisation, we would need to write every data converter from the beginning.

Glucose-ML can show us how other researchers:

- Read original files
- Rename fields
- Standardise timestamps
- Standardise glucose units
- Calculate CGM features
- Divide participants for machine learning
- Prepare data for models

### Where we will use it

We will use Glucose-ML as a technical reference and may reuse suitable harmonisation code.

It can help us produce a common format for Shanghai, CGMacros, BIG IDEAs, and Colás.

### Important limitation

The MIT software licence applies to the Glucose-ML repository code. It does not replace the licences of the underlying datasets. Every dataset must continue to follow its original licence.

---

## 9. How the datasets fit together

No single dataset contains everything needed by the Virtual Patient Model. Their roles are complementary:

```text
ShanghaiT2DM
  Main glucose, meals, medication, and clinical data
          ↓
CGMacros
  Detailed meal nutrients, activity, and heart-rate relationships
          ↓
Indian Food Composition Tables
  Convert Indian food descriptions into nutrient estimates
          ↓
BIG IDEAs
  Additional meal and CGM examples from prediabetes
          ↓
Colás 2019
  Glucose variability and future-risk research
          ↓
Synthea
  Safe application and database demonstrations
          ↓
Glucose-ML
  Common formatting and preprocessing tools
```

### Possible model inputs

Information provided to a model is called a **feature**. Possible features include:

- Recent glucose readings
- Meal time
- Carbohydrate amount
- Protein
- Fat
- Fibre
- Recent activity
- Heart rate
- BMI
- HbA1c
- Age
- Diabetes duration
- Medication
- Insulin dose
- Time of day

### Possible model outputs

The value the model tries to predict is called the **target** or **label**.

The first target could be:

> Predict glucose 120 minutes after a meal.

Other possible targets include:

- Change from pre-meal glucose after 120 minutes
- Maximum glucose after the meal
- Time until the glucose peak
- The complete post-meal glucose curve
- Incremental area under the glucose curve

### Area under the curve

**Area Under the Curve (AUC)** summarises the total glucose response over a period.

A short, high glucose spike and a longer, moderate increase may have different AUC values.

**Incremental Area Under the Curve (iAUC)** measures the glucose response above the starting or baseline glucose level.

### Suggested common data structure

After harmonisation, records from different datasets could use fields such as:

| Field | Meaning |
| --- | --- |
| `source` | Name of the original dataset |
| `participant_id` | Identifier for the person within that dataset |
| `episode_id` | Identifier for a particular recording period |
| `timestamp` | Date and time of the observation |
| `glucose_mg_dl` | Glucose measurement in mg/dL |
| `meal_timestamp` | Time at which the meal was recorded |
| `carbohydrate_g` | Estimated carbohydrate in grams |
| `protein_g` | Estimated protein in grams |
| `fat_g` | Estimated fat in grams |
| `fibre_g` | Estimated fibre in grams |
| `activity` | Physical-activity measurement or category |
| `heart_rate_bpm` | Heart rate in beats per minute |
| `medication` | Recorded medication information |
| `insulin_dose` | Recorded insulin amount, with units and route |
| `age` | Participant age |
| `bmi` | Body Mass Index |
| `hba1c_percent` | HbA1c in percent |

Not every dataset supplies every field. Missing information must remain explicitly missing rather than being silently replaced with zero.

---

## 10. Recommended first implementation

The safest first implementation is to start only with ShanghaiT2DM.

### Step 1: Read the source files

Load every Type 2 diabetes recording and preserve the original files unchanged.

### Step 2: Create a common table

Convert each file into consistent fields such as participant, timestamp, glucose, meal, insulin, and medication.

### Step 3: Identify unique patients

Extract the base participant identifier so multiple recordings from one person are recognised as belonging to the same person.

### Step 4: Split by patient

Create three groups:

- **Training set:** Data used to teach the model.
- **Validation set:** Data used to select settings and compare model versions.
- **Test set:** Data kept untouched until the final evaluation.

The same person must never appear in more than one group.

### Step 5: Find valid glucose sequences

Identify periods with enough consecutive glucose measurements and document any missing readings.

### Step 6: Identify meal events

Extract meal times and descriptions. Preserve the original text even after creating cleaned or estimated nutrition fields.

### Step 7: Define the first target

The simplest useful first target is:

> Predict glucose 120 minutes after a recorded meal.

### Step 8: Build a baseline model

A **baseline model** is a simple method that more advanced models must outperform.

Possible baselines include:

- Predict that glucose will remain equal to the current glucose.
- Predict the participant's average two-hour change.
- Use a simple linear model based on current glucose and meal information.

### Step 9: Measure prediction error

**Prediction error** is the difference between the predicted glucose and the actual measured glucose.

Useful measurements may include:

- **MAE:** Mean Absolute Error, the average absolute difference between predicted and actual glucose.
- **RMSE:** Root Mean Squared Error, which gives greater importance to large mistakes.

### Step 10: Add complexity gradually

Once the basic Shanghai model works:

1. Use IFCT to convert food descriptions into approximate nutrients.
2. Use CGMacros to add macronutrients, activity, and heart rate.
3. Use BIG IDEAs for additional robustness testing in prediabetes.
4. Use Colás for a separate risk and progression component.
5. Use Synthea to demonstrate the application safely.

### Generalisation

**Generalisation** means whether the model performs well for people it did not see during training.

A useful Virtual Patient Model must generalise to unseen participants. Memorising the people in the training data is not sufficient.

---

## 11. Beginner glossary

| Term | Simple meaning |
| --- | --- |
| Basal insulin | Background insulin used between meals and overnight |
| Baseline model | A simple first model that later models must outperform |
| BMI | Body Mass Index, a rough measurement based on height and weight |
| Bolus insulin | Insulin commonly taken around a meal |
| CBG | Finger-prick capillary blood glucose measurement |
| CGM | A wearable sensor that repeatedly measures glucose |
| Clinical variable | Health-related information such as age, BMI, or laboratory results |
| Comorbidity | Another health condition present alongside the main condition |
| Data leakage | Information from validation or testing accidentally helping train the model |
| EHR | Electronic Health Record |
| Feature | A piece of information supplied to a model |
| Generalisation | Ability of a model to work for previously unseen people or data |
| HbA1c | Blood test estimating average glucose over roughly two to three months |
| Insulin resistance | When the body does not respond effectively to insulin |
| Interpolation | Estimating a value between measured observations |
| Label or target | The value a model is trained to predict |
| Macronutrients | Carbohydrate, protein, and fat |
| MET | Measurement of physical-activity intensity |
| Postprandial | After eating a meal |
| Prediabetes | Glucose regulation worse than normal but below the diabetes diagnostic level |
| Preprocessing | Preparing and cleaning data before modelling |
| Synthetic data | Artificially generated data that does not represent real people |
| Time series | Measurements arranged in time order |
| Validation set | Data used to compare model versions and settings |
| Test set | Unseen data used for final performance evaluation |
| Training set | Data used to teach the model |
| Wearable | An electronic sensor worn on the body |

---

## Final dataset roles at a glance

| Dataset | Main contribution | Where it will be used | Must not be treated as |
| --- | --- | --- | --- |
| ShanghaiT2DM/T1DM | Real diabetes CGM, meals, medication, and clinical data | Main glucose-prediction model | A perfectly measured nutrition dataset |
| CGMacros | Detailed meal nutrients, activity, heart rate, and CGM | Meal-response and activity features | A large Type 2 diabetes cohort |
| IFCT 2017 | Nutrient composition of Indian foods | Indian meal-to-nutrient mapping | Patient or glucose data |
| BIG IDEAs | CGM and food data from high-normal/prediabetes participants | Pretraining, pipeline tests, and robustness checks | Type 2 diabetes validation data |
| Colás 2019 | Short CGM recordings with later diabetes outcomes | Risk and progression research | A detailed meal-response dataset |
| Synthea | Artificial medical records | Application, database, and dashboard testing | Evidence of real glucose physiology |
| Glucose-ML | Harmonisation and preprocessing resources | Common data format and technical reference | One dataset with one universal licence |

## Local research inventory

Detailed download paths, integrity checks, licences, and exclusions are documented in [`data/external/README.md`](data/external/README.md). File hashes and source links are recorded in [`data/external/MANIFEST.csv`](data/external/MANIFEST.csv).
