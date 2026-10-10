# Model Card: Shanghai Logistic Baseline v1

## Purpose

This model scores a research event that occurs when, within 120 minutes after a
recorded meal, glucose either reaches at least **180 mg/dL** or rises by at least
**40 mg/dL** above the meal-time baseline. It exists to demonstrate static EHR and
dynamic CGM fusion for the HappyHealth prototype. It is not a medical device.

## Inputs

The 43 numeric inputs combine recent CGM history, time and meal text signals,
recorded medication events, and static patient values such as age, BMI, diabetes
duration, HbA1c, and fasting glucose. The exact definitions are in
[`FEATURE_DICTIONARY.md`](../docs/FEATURE_DICTIONARY.md) and are enforced by a schema
parity test.

## Training and evaluation

The baseline is Logistic Regression with median imputation, missingness indicators,
and standard scaling. Patients—not rows—were divided between train, validation, and
test sets to reduce information leakage.

| Split | ROC AUC | F1 |
| --- | ---: | ---: |
| Validation | 0.701 | 0.779 |
| Test | 0.757 | 0.742 |

The always-positive majority baseline has F1 scores of 0.824 on validation and 0.757
on test. The Logistic Regression model ranks cases better than random and has a
better Brier score, but its F1 at the fixed 0.5 threshold is lower than the majority
baseline. These are technical prototype metrics, not evidence of clinical safety or
benefit.

The API returns `modelScore`, the model's numeric output from 0 to 1. It must not be
read as “this patient has an X% clinical chance.” No low, moderate, or high clinical
risk bands are assigned.

## Data and privacy

Training uses the openly shared ShanghaiT2DM research dataset under its source
terms. Raw data is excluded from Git. The repository contains only the small
derived model bundle and aggregate metrics. The public application demonstrates a
fully synthetic patient and simulated CGM events.

## Limitations and prohibited use

- Not clinically validated and not calibrated for an individual patient.
- Evaluation contains only 15 validation patients and 15 test patients; there are no
  confidence intervals, external validation cohort, or subgroup fairness results.
- The training population may not represent other countries or care settings.
- Meal text and medication recording can be incomplete.
- Explanatory factors are model contributions, not medical causes.
- Do not use the result for diagnosis, treatment, dosing, or emergency decisions.
