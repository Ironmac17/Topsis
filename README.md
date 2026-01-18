# TOPSIS Web Service

A full-stack web application that implements the **TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution)** method for solving **Multi-Criteria Decision Making (MCDM)** problems.

The application allows users to upload a CSV file, validates inputs, computes TOPSIS scores and ranks, displays results instantly on the same page, enables downloading the output file, and optionally sends the result to the user via email.

---

## Deployed Link

Live Application:  
https://topsis-six.vercel.app/

---

## Features

- Upload CSV file for decision analysis
- Automatic detection of number of criteria from CSV
- Validation of weights and impacts
- Weights must be numeric and comma-separated
- Impacts must be `+` or `-` and comma-separated
- Prevents incorrect number of weights or impacts
- Live criteria count indicator
- Accurate TOPSIS score and rank calculation
- Results displayed instantly on the same page
- Downloadable result file (`output.csv`)
- Optional email delivery of the result file
- Email sending handled via secure API-based service
- Secure handling of sensitive credentials using environment variables
- Responsive, dark-themed user interface

---

## Tech Stack

### Frontend
- React (Vite)
- Bootstrap
- Axios

### Backend
- Python
- Flask
- Pandas
- NumPy
- API-based Email Service (Resend)

### Deployment
- Frontend: Vercel
- Backend: Railway

---

## How It Works

1. User uploads a CSV file containing alternatives and criteria values
2. User provides weights and impacts for each criterion
3. Backend validates the inputs
4. TOPSIS algorithm is applied using normalization and distance measures
5. TOPSIS scores and ranks are calculated
6. Results are displayed instantly on the frontend
7. User can download the output file or receive it via email

---

## Author

Nimish Agrawal  
Roll No: 102483077
