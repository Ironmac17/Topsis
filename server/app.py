from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import numpy as np
import os, re, smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOADS = "uploads"
OUTPUTS = "outputs"
os.makedirs(UPLOADS, exist_ok=True)
os.makedirs(OUTPUTS, exist_ok=True)

EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"

# ---------- TOPSIS LOGIC ----------
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

    ideal_best = np.array(ideal_best)
    ideal_worst = np.array(ideal_worst)

    d_best = np.sqrt(((weighted - ideal_best) ** 2).sum(axis=1))
    d_worst = np.sqrt(((weighted - ideal_worst) ** 2).sum(axis=1))

    score = d_worst / (d_best + d_worst)
    df["Topsis Score"] = score
    df["Rank"] = df["Topsis Score"].rank(ascending=False).astype(int)

    return df

# ---------- EMAIL ----------
def send_email(receiver, file_path):
    msg = EmailMessage()
    msg["Subject"] = "TOPSIS Result"
    msg["From"] = "EMAIL_ADDRESS"
    msg["To"] = receiver
    msg.set_content("Attached is your TOPSIS result file.")

    with open(file_path, "rb") as f:
        msg.add_attachment(
            f.read(),
            maintype="application",
            subtype="octet-stream",
            filename="output.csv"
        )

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login("EMAIL_ADDRESS", "EMAIL_APP_PASSWORD")
        server.send_message(msg)

# ---------- API ----------
@app.route("/api/topsis", methods=["POST"])
def run_topsis():
    file = request.files.get("file")
    weights = request.form.get("weights")
    impacts = request.form.get("impacts")
    email = request.form.get("email")
    send_mail = request.form.get("send_mail")

    if not file:
        return jsonify({"error": "CSV file required"}), 400

    if send_mail:
        if not email or not re.match(EMAIL_REGEX, email):
            return jsonify({"error": "Invalid email format"}), 400

    weights = list(map(float, weights.split(",")))
    impacts = impacts.split(",")

    if not all(i in ["+", "-"] for i in impacts):
        return jsonify({"error": "Impacts must be + or -"}), 400

    file_path = os.path.join(UPLOADS, file.filename)
    file.save(file_path)

    df = pd.read_csv(file_path)

    if len(weights) != len(impacts) or len(weights) != df.shape[1] - 1:
        return jsonify({"error": "Weights and impacts count mismatch"}), 400

    result_df = topsis(df, weights, impacts)

    output_path = os.path.join(OUTPUTS, "output.csv")
    result_df.to_csv(output_path, index=False)

    email_sent = False
    email_error = None

    if send_mail:
        try:
            send_email(email, output_path)
            email_sent = True
        except Exception as e:
            email_error = "Email sending failed"

    return jsonify({
        "table": result_df.to_dict(orient="records"),
        "download": "/api/download",
        "emailSent": email_sent,
        "emailError": email_error
    })

@app.route("/api/download")
def download():
    return send_file("outputs/output.csv", as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True)
