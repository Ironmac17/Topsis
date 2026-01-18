# TOPSIS Web Service

A full-stack web application that implements the **TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution)** method for multi-criteria decision making.

The application allows users to upload a CSV file, automatically detects the required number of criteria, validates inputs, computes TOPSIS scores and ranks, displays results on the same page, allows downloading the output file, and optionally sends the result via email.

---

## Deployed Link

Live Application:  
https://your-deployed-link-here

---

## Features

- Upload CSV file for decision analysis
- Automatic detection of number of criteria from CSV
- Validation of weights and impacts
- Weights must be numeric and comma-separated
- Impacts must be `+` or `-` and comma-separated
- Prevents incorrect number of weights or impacts
- Live criteria count indicator
- TOPSIS score and rank calculation
- Results displayed on the same page
- Downloadable `output.csv`
- Optional email delivery of result
- Secure handling of email credentials using environment variables
- Responsive dark-themed user interface

---

## Tech Stack

Frontend:
- React (Vite)
- Bootstrap
- Axios

Backend:
- Python
- Flask
- Pandas
- NumPy
- SMTP (Gmail App Password)

---

## Author

Nimish Agrawal  
Roll No: 102483077

---
