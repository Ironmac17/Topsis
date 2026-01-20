import { useState, useRef } from "react";
import api from "../services/api";
import ResultTable from "./ResultTable";

export default function TopsisForm() {
  const formRef = useRef();

  const [weightsValue, setWeightsValue] = useState("");
  const [impactsValue, setImpactsValue] = useState("");
  const [expectedCount, setExpectedCount] = useState(null);

  const [sendMail, setSendMail] = useState(false);
  const [result, setResult] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  const [emailSent, setEmailSent] = useState(false);
  const [emailFailed, setEmailFailed] = useState(false);

  /* ---------- Helpers ---------- */
 
  const countCriteria = (value) =>
    value ? value.split(",").filter(Boolean).length : 0;

  const countsMatch =
    expectedCount !== null &&
    countCriteria(weightsValue) === expectedCount &&
    countCriteria(impactsValue) === expectedCount;

  /* ---------- CSV Reader ---------- */

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;
      const headers = text.trim().split("\n")[0].split(",");
      setExpectedCount(headers.length - 1);

      setWeightsValue("");
      setImpactsValue("");
    };

    reader.readAsText(file);
  };

  /* ---------- Input Handlers ---------- */

  const handleWeightsChange = (e) => {
    let value = e.target.value;

    if (!/^[0-9.,]*$/.test(value)) return;

    value = value.replace(/,+/g, ",").replace(/^,/, "");

    if (expectedCount !== null && countCriteria(value) > expectedCount) return;

    setWeightsValue(value);
  };

  const handleImpactsChange = (e) => {
    let value = e.target.value;

    if (!/^[+\-,]*$/.test(value)) return;

    value = value.replace(/,+/g, ",").replace(/^,/, "");

    if (expectedCount !== null && countCriteria(value) > expectedCount) return;

    setImpactsValue(value);
  };

  /* ---------- Submit ---------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult([]);
    setEmailSent(false);
    setEmailFailed(false);

    if (!countsMatch) {
      setError(`Exactly ${expectedCount} weights and impacts are required`);
      return;
    }

    const formData = new FormData(e.target);
    setLoading(true);

    try {
      const res = await api.post("/topsis", formData);
      setResult(res.data.table);
      setDownloadUrl(res.data.download);

      if (res.data.emailSent) setEmailSent(true);
      if (res.data.emailError) setEmailFailed(true);
    } catch (err) {
      setError(err.response?.data?.error || "Server error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Reset ---------- */

  const handleReset = () => {
    formRef.current.reset();
    setWeightsValue("");
    setImpactsValue("");
    setExpectedCount(null);
    setSendMail(false);
    setResult([]);
    setError("");
    setEmailSent(false);
    setEmailFailed(false);
  };

  /* ---------- UI ---------- */

  return (
    <>
      <form
        ref={formRef}
        className="card p-4 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="mb-3">
          <label className="form-label">Upload CSV</label>
          <input
            type="file"
            name="file"
            className="form-control"
            required
            onChange={handleFileChange}
          />
        </div>

        {expectedCount !== null && (
          <div className="alert alert-info py-2">
            Detected <strong className="form-label">{expectedCount}</strong>{" "}
            criteria from CSV
          </div>
        )}

        <div className="mb-3">
          <label className="form-label">Weights</label>
          <input
            name="weights"
            className="form-control"
            placeholder="1,1,1,1"
            value={weightsValue}
            onChange={handleWeightsChange}
            required
          />
          <small
            className={
              expectedCount === null
                ? "criteria-neutral"
                : countsMatch
                  ? "criteria-valid"
                  : "criteria-invalid"
            }
          >
            {countCriteria(weightsValue)} / {expectedCount ?? "?"} criteria
            {countsMatch && " ✅"}
          </small>
        </div>

        <div className="mb-3">
          <label className="form-label">Impacts</label>
          <input
            name="impacts"
            className="form-control"
            placeholder="+,+,+,-"
            value={impactsValue}
            onChange={handleImpactsChange}
            required
          />
          <small
            className={
              expectedCount === null
                ? "criteria-neutral"
                : countsMatch
                  ? "criteria-valid"
                  : "criteria-invalid"
            }
          >
            {countCriteria(impactsValue)} / {expectedCount ?? "?"} criteria
            {countsMatch && " ✅"}
          </small>
        </div>

        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            id="sendMail"
            name="send_mail"
            onChange={(e) => setSendMail(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="sendMail">
            Send result to email
          </label>
        </div>

        {sendMail && (
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              required
            />
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="d-flex gap-2">
          <button
            className="btn btn-primary w-100"
            disabled={!countsMatch || loading}
          >
            {loading ? "Processing..." : "Submit"}
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary w-100"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>

        <div className="text-center mt-3">
          <a href="/sample_input.csv" download>
            Download Sample CSV
          </a>
        </div>
      </form>

      {/* ---------- TOASTS (TOP-CENTER) ---------- */}

      {emailSent && (
        <div className="toast show position-fixed top-0 start-50 translate-middle-x mt-3">
          <div className="toast-header bg-success text-white">
            <strong className="me-auto">Success</strong>
            <button className="btn-close" onClick={() => setEmailSent(false)} />
          </div>
          <div className="toast-body">Result sent to email successfully.</div>
        </div>
      )}

      {emailFailed && (
        <div className="toast show position-fixed top-0 start-50 translate-middle-x mt-3">
          <div className="toast-header bg-danger text-white">
            <strong className="me-auto">Error</strong>
            <button
              className="btn-close"
              onClick={() => setEmailFailed(false)}
            />
          </div>
          <div className="toast-body">
            Email sending failed. Please try again.
          </div>
        </div>
      )}

      {result.length > 0 && (
        <>
          <hr />
          <h4>Result</h4>
          <ResultTable data={result} />
          <a
            href={`https://topsis-3s7c.vercel.app${downloadUrl}`}
            className="btn btn-success mt-3"
          >
            Download output.csv
          </a>
        </>
      )}
    </>
  );
}
