import { useEffect, useMemo, useState } from "react";
import PageShell from "../../components/common/PageShell";
import { useAuth } from "../../context/AuthContext";
import { getRoomsApi, getMyFeeApi, payMyFeeApi } from "../../services/hostelApi";

const QR_PLACEHOLDER = `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <rect width="180" height="180" fill="#ffffff"/>
  <rect x="10" y="10" width="40" height="40" fill="#000000"/>
  <rect x="130" y="10" width="40" height="40" fill="#000000"/>
  <rect x="10" y="130" width="40" height="40" fill="#000000"/>
</svg>
`;

const qrDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(QR_PLACEHOLDER)}`;

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

const StudentFeesPage = () => {
  const { user, refreshUser } = useAuth();
  const [localUser, setLocalUser] = useState(user || null);
  const [rooms, setRooms] = useState([]);
  const [currentFee, setCurrentFee] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    amount: "",
    paymentMethod: "UPI",
    upiId: "",
    cardNumber: "",
    cardHolderName: "",
    cvv: "",
  });

  const loadLatestData = async () => {
    try {
      const latestUser = await refreshUser();
      setLocalUser(latestUser || user || null);

      const [roomsData, feeData] = await Promise.all([
        getRoomsApi(),
        getMyFeeApi(),
      ]);

      setRooms(Array.isArray(roomsData) ? roomsData : []);
      setCurrentFee(feeData || null);
    } catch (error) {
      console.error("Fee sync failed:", error);
    }
  };

  useEffect(() => {
    loadLatestData();
  }, []);

  const allottedRoom = rooms.find((room) => room.roomNo === localUser?.room);

  const totalFee =
    Number(currentFee?.amount) ||
    Number(allottedRoom?.monthlyFee) ||
    0;

  const paidAmount = Number(currentFee?.paidAmount || 0);

  const remainingAmount = useMemo(() => {
    return Math.max(0, totalFee - paidAmount);
  }, [totalFee, paidAmount]);

  const remainingDisplay = remainingAmount === 0 ? "No Due" : `₹${remainingAmount}`;
  const latestPayment = currentFee?.paymentHistory?.[0] || null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentFee) return;

    try {
      setSubmitting(true);

      let paymentDetails = {};

      if (form.paymentMethod === "UPI") {
        paymentDetails = { upiId: form.upiId };
      } else if (
        form.paymentMethod === "Credit Card" ||
        form.paymentMethod === "Debit Card"
      ) {
        paymentDetails = {
          cardNumber: form.cardNumber,
          cardHolderName: form.cardHolderName,
          cvv: form.cvv,
        };
      } else {
        paymentDetails = { mode: "QR Scanner" };
      }

      const updatedFee = await payMyFeeApi({
        amount: Number(form.amount),
        paymentMethod: form.paymentMethod,
        paymentDetails,
      });

      setCurrentFee(updatedFee);

      setForm({
        amount: "",
        paymentMethod: "UPI",
        upiId: "",
        cardNumber: "",
        cardHolderName: "",
        cvv: "",
      });
    } catch (error) {
      alert(error.response?.data?.message || "Fee payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell
      title="Fee Payment"
      subtitle="View your allotted room fee and make payments."
    >
      {totalFee ? (
        <>
          <div className="glass mb-6 rounded-3xl p-5 shadow-2xl">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-slate-400">Room</p>
                <h3 className="mt-2 text-xl font-bold text-white">
                  {localUser?.room || "Not Allotted"}
                </h3>
              </div>

              <div>
                <p className="text-sm text-slate-400">Total Fee</p>
                <h3 className="mt-2 text-2xl font-bold text-white">
                  ₹{totalFee}
                </h3>
              </div>

              <div>
                <p className="text-sm text-slate-400">Paid Amount</p>
                <h3 className="mt-2 text-2xl font-bold text-emerald-300">
                  ₹{paidAmount}
                </h3>
              </div>

              <div>
                <p className="text-sm text-slate-400">Remaining</p>
                <h3 className="mt-2 text-2xl font-bold text-amber-300">
                  {remainingDisplay}
                </h3>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="badge">
                Due Date: {currentFee?.dueDate || "2026-04-10"}
              </span>
              <span className="badge">
                Status: {remainingAmount === 0 ? "Paid" : currentFee?.status || "Pending"}
              </span>
            </div>
          </div>

          {currentFee ? (
            <>
              <form
                onSubmit={handleSubmit}
                className="glass rounded-3xl p-5 shadow-2xl space-y-4"
              >
                <input
                  className="input"
                  type="number"
                  min="1"
                  max={remainingAmount || undefined}
                  placeholder="Enter amount"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />

                <select
                  className="input"
                  value={form.paymentMethod}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      paymentMethod: e.target.value,
                      upiId: "",
                      cardNumber: "",
                      cardHolderName: "",
                      cvv: "",
                    })
                  }
                  required
                >
                  <option value="UPI">UPI</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Net Banking">Net Banking</option>
                </select>

                {form.paymentMethod === "UPI" && (
                  <input
                    className="input"
                    placeholder="Add your UPI ID"
                    value={form.upiId}
                    onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                    required
                  />
                )}

                {(form.paymentMethod === "Credit Card" ||
                  form.paymentMethod === "Debit Card") && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      className="input md:col-span-2"
                      placeholder="Card Number"
                      value={form.cardNumber}
                      onChange={(e) =>
                        setForm({ ...form, cardNumber: e.target.value })
                      }
                      required
                    />
                    <input
                      className="input"
                      placeholder="Card Holder Name"
                      value={form.cardHolderName}
                      onChange={(e) =>
                        setForm({ ...form, cardHolderName: e.target.value })
                      }
                      required
                    />
                    <input
                      className="input"
                      placeholder="CVV"
                      value={form.cvv}
                      onChange={(e) => setForm({ ...form, cvv: e.target.value })}
                      required
                    />
                  </div>
                )}

                {form.paymentMethod === "Net Banking" && (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center">
                    <p className="mb-4 text-sm text-slate-300">
                      Scan this QR code to continue payment
                    </p>
                    <div className="mx-auto flex h-52.5 w-52.5 items-center justify-center rounded-3xl bg-white p-4">
                      <img
                        src={qrDataUri}
                        alt="Payment QR Code"
                        className="h-45 w-45"
                      />
                    </div>
                  </div>
                )}

                <button className="btn-primary w-full" type="submit" disabled={submitting}>
                  {submitting ? "Processing..." : "Pay Now"}
                </button>
              </form>

              <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="glass rounded-3xl p-5 shadow-2xl">
                  <h3 className="text-lg font-semibold text-white">
                    Latest Payment
                  </h3>

                  {latestPayment ? (
                    <div className="mt-4 space-y-3 text-sm text-slate-300">
                      <p>
                        <span className="font-semibold text-white">Amount:</span>{" "}
                        ₹{latestPayment.amount}
                      </p>
                      <p>
                        <span className="font-semibold text-white">Method:</span>{" "}
                        {latestPayment.method}
                      </p>
                      <p>
                        <span className="font-semibold text-white">Date:</span>{" "}
                        {formatDateTime(latestPayment.date)}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                      No payment made yet.
                    </div>
                  )}
                </div>

                <div className="glass rounded-3xl p-5 shadow-2xl">
                  <h3 className="text-lg font-semibold text-white">
                    Payment History
                  </h3>

                  {currentFee.paymentHistory?.length > 0 ? (
                    <div className="mt-4 overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-white/10 text-slate-400">
                          <tr>
                            <th className="px-3 py-3">Date</th>
                            <th className="px-3 py-3">Amount</th>
                            <th className="px-3 py-3">Method</th>
                            <th className="px-3 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentFee.paymentHistory.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-white/5 text-slate-300"
                            >
                              <td className="px-3 py-3">
                                {formatDateTime(item.date)}
                              </td>
                              <td className="px-3 py-3 font-semibold text-white">
                                ₹{item.amount}
                              </td>
                              <td className="px-3 py-3">{item.method}</td>
                              <td className="px-3 py-3">
                                <span className="badge">Success</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                      Payment history will appear here after transactions.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="glass rounded-3xl p-8 text-center text-slate-400 shadow-2xl">
              Fee record is being prepared. Room fee is already visible above.
            </div>
          )}
        </>
      ) : (
        <div className="glass rounded-3xl p-8 text-center text-slate-400 shadow-2xl">
          Room not allotted yet. Fee will appear after room allotment.
        </div>
      )}
    </PageShell>
  );
};

export default StudentFeesPage;