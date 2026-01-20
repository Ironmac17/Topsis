from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import re
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

# ---------------- ENV ----------------
load_dotenv()
GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")
BASE_URL = os.getenv("BASE_URL")

# ---------------- APP ----------------
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

UPLOADS = "/tmp/uploads"
OUTPUTS = "/tmp/outputs"
os.makedirs(UPLOADS, exist_ok=True)
os.makedirs(OUTPUTS, exist_ok=True)

EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"

@app.route("/")
def health():
    return {"status": "backend running"}
# ---------------- TOPSIS ----------------
def topsis(df, weights, impacts):
    data = df.iloc[:, 1:].values.astype(float)
    weights = np.array(weights)

    norm = np.sqrt((data ** 2).sum(axis=0))
    normalized = data / norm
    weighted = normalized * weights

    ideal_best, ideal_worst = [], []

    for i, impact in enumerate(impacts):
        if impact == "+":
            ideal_best.append(weighted[:, i].max())
            ideal_worst.append(weighted[:, i].min())
        else:
            ideal_best.append(weighted[:, i].min())
            ideal_worst.append(weighted[:, i].max())

    d_best = np.sqrt(((weighted - ideal_best) ** 2).sum(axis=1))
    d_worst = np.sqrt(((weighted - ideal_worst) ** 2).sum(axis=1))

    df["Topsis Score"] = d_worst / (d_best + d_worst)
    df["Rank"] = df["Topsis Score"].rank(ascending=False).astype(int)

    return df

# ---------------- EMAIL (GMAIL SMTP) ----------------
def send_email(receiver, file_path):
    if not GMAIL_USER or not GMAIL_APP_PASSWORD:
        raise Exception("Gmail credentials missing")

    msg = EmailMessage()
    msg["From"] = GMAIL_USER
    msg["To"] = receiver
    msg["Subject"] = "TOPSIS Result"
    msg.set_content("Your TOPSIS result is attached.")

    with open(file_path, "rb") as f:
        msg.add_attachment(
            f.read(),
            maintype="text",
            subtype="csv",
            filename="topsis_result.csv"
        )

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        server.send_message(msg)

# ---------------- API ----------------
@app.route("/api/topsis", methods=["POST"])
def run_topsis():
    file = request.files.get("file")
    weights = request.form.get("weights")
    impacts = request.form.get("impacts")
    email = request.form.get("email")

    send_mail = str(request.form.get("send_mail")).lower() in ["on", "true", "1"]

    if not file:
        return jsonify({"error": "CSV file required"}), 400

    if send_mail:
        if not email or not re.match(EMAIL_REGEX, email):
            return jsonify({"error": "Invalid email format"}), 400

    weights = list(map(float, weights.split(",")))
    impacts = impacts.split(",")

    if not all(i in ["+", "-"] for i in impacts):
        return jsonify({"error": "Impacts must be + or -"}), 400

    file_path = os.path.join(UPLOADS, secure_filename(file.filename))
    file.save(file_path)

    df = pd.read_csv(file_path)

    if len(weights) != len(impacts) or len(weights) != df.shape[1] - 1:
        return jsonify({"error": "Weights and impacts count mismatch"}), 400

    result_df = topsis(df, weights, impacts)

    output_filename = f"output_{os.getpid()}.csv"
    output_path = os.path.join(OUTPUTS, output_filename)
    result_df.to_csv(output_path, index=False)

    email_sent = False
    email_error = None

    if send_mail:
        try:
            send_email(email, output_path)
            email_sent = True
        except Exception as e:
            print("EMAIL ERROR:", e)
            email_error = "Email sending failed"

    return jsonify({
        "table": result_df.to_dict(orient="records"),
        "download": f"/api/download/{output_filename}",
        "emailSent": email_sent,
        "emailError": email_error
    })

@app.route("/api/download/<filename>")
def download(filename):
    return send_file(os.path.join(OUTPUTS, filename), as_attachment=True)

