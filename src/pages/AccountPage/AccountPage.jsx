import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackBtn from "../../components/BackBtn/BackBtn";
import { useSession } from "../../hooks/useSession";
import {
  getFamilyStatus,
  getLinkedChildPots,
  getLinkedChildTransactions,
  getPendingApprovals,
  getScheduledTransactions,
  linkChildAccount,
  reviewApproval,
  unlinkFamilyAccount,
} from "../../services/api/client";
import appConfig from "../../config/appConfig";
import { clearStoredSession } from "../../utils/authStorage";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { getTransactionStatusLabel } from "../../utils/transactionStatus";
import "./AccountPage.css";

function AccountPage() {
  const navigate = useNavigate();
  const session = useSession();
  const [familyData, setFamilyData] = useState({
    linkedParent: null,
    linkedChild: null,
  });
  const [childEmail, setChildEmail] = useState("");
  const [familyFeedback, setFamilyFeedback] = useState({ type: "", message: "" });
  const [isFamilyLoading, setIsFamilyLoading] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [linkedChildPots, setLinkedChildPots] = useState([]);
  const [linkedChildTransactions, setLinkedChildTransactions] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [isChildOverviewLoading, setIsChildOverviewLoading] = useState(false);
  const [isReviewingApproval, setIsReviewingApproval] = useState("");
  const [scheduledTotal, setScheduledTotal] = useState(0);

  const roleLabel =
    session?.role === "parent"
      ? "Ouder"
      : session?.role === "child"
        ? "Kind"
        : "Nog niet ingesteld";

  const initials = session?.fullName
    ? session.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const loadScheduledTransactions = useCallback(async () => {
    if (!session?.id) return;

    try {
      const response = await getScheduledTransactions(session.id);
      const schedules = response.scheduledTransactions || [];
      
      const total = schedules.reduce((acc, s) => {
        if (!s.isActive) return acc;
        
        let monthlyAmount = s.amount;
        if (s.recurrence === "daily") {
          monthlyAmount = s.amount * 30; // Approximation for daily
        }
        
        return s.type === "expense" ? acc + monthlyAmount : acc - monthlyAmount;
      }, 0);
      
      setScheduledTotal(total);
    } catch (error) {
      console.error("Failed to load scheduled transactions:", error);
    }
  }, [session?.id]);

  useEffect(() => {
    loadScheduledTransactions();
  }, [loadScheduledTransactions]);

  const loadFamilyData = useCallback(async () => {
    if (!session?.id) {
      return;
    }

    setIsFamilyLoading(true);
    setFamilyFeedback({ type: "", message: "" });

    try {
      const response = await getFamilyStatus(session.id);

      setFamilyData({
        linkedParent: response.linkedParent || null,
        linkedChild: response.linkedChild || null,
      });
    } catch (error) {
      setFamilyFeedback({
        type: "error",
        message: error.message || "De koppeling kon niet geladen worden.",
      });
    } finally {
      setIsFamilyLoading(false);
    }
  }, [session?.id]);

  useEffect(() => {
    loadFamilyData();
  }, [loadFamilyData]);

  const loadLinkedChildOverview = useCallback(async () => {
    if (
      !session?.id ||
      session.role !== "parent" ||
      !familyData.linkedChild?.id
    ) {
      setLinkedChildPots([]);
      setLinkedChildTransactions([]);
      setPendingApprovals([]);
      setIsChildOverviewLoading(false);
      return;
    }

    setIsChildOverviewLoading(true);

    try {
      const [potsResponse, transactionsResponse, approvalsResponse] = await Promise.all([
        getLinkedChildPots(session.id),
        getLinkedChildTransactions(session.id),
        getPendingApprovals(session.id),
      ]);

      setLinkedChildPots(potsResponse.pots || []);
      setLinkedChildTransactions((transactionsResponse.transactions || []).slice(0, 4));
      setPendingApprovals(approvalsResponse.approvals || []);
    } catch (error) {
      setFamilyFeedback({
        type: "error",
        message: error.message || "De gekoppelde kindgegevens konden niet geladen worden.",
      });
    } finally {
      setIsChildOverviewLoading(false);
    }
  }, [familyData.linkedChild?.id, session?.id, session?.role]);

  useEffect(() => {
    loadLinkedChildOverview();
  }, [loadLinkedChildOverview]);

  function handleLogout() {
    clearStoredSession();
    navigate("/login");
  }

  async function handleLinkSubmit(event) {
    event.preventDefault();

    if (!session?.id || !childEmail.trim()) {
      return;
    }

    setIsLinking(true);
    setFamilyFeedback({ type: "", message: "" });

    try {
      const response = await linkChildAccount({
        userId: session.id,
        childEmail: childEmail.trim(),
      });

      setFamilyData({
        linkedParent: response.linkedParent || null,
        linkedChild: response.linkedChild || null,
      });
      setChildEmail("");
      setFamilyFeedback({
        type: "success",
        message: response.message || "Het kindaccount is gekoppeld.",
      });
    } catch (error) {
      setFamilyFeedback({
        type: "error",
        message: error.message || "Koppelen is niet gelukt.",
      });
    } finally {
      setIsLinking(false);
    }
  }

  async function handleUnlink() {
    if (!session?.id) {
      return;
    }

    setIsUnlinking(true);
    setFamilyFeedback({ type: "", message: "" });

    try {
      const response = await unlinkFamilyAccount(session.id);

      setFamilyData({
        linkedParent: response.linkedParent || null,
        linkedChild: response.linkedChild || null,
      });
      setLinkedChildPots([]);
      setLinkedChildTransactions([]);
      setPendingApprovals([]);
      setFamilyFeedback({
        type: "success",
        message: response.message || "De koppeling is verwijderd.",
      });
    } catch (error) {
      setFamilyFeedback({
        type: "error",
        message: error.message || "Loskoppelen is niet gelukt.",
      });
    } finally {
      setIsUnlinking(false);
    }
  }

  async function handleApprovalAction(approvalId, action) {
    if (!session?.id) {
      return;
    }

    setIsReviewingApproval(approvalId);
    setFamilyFeedback({ type: "", message: "" });

    try {
      const response = await reviewApproval({
        approvalId,
        userId: session.id,
        action,
      });

      setFamilyFeedback({
        type: "success",
        message: response.message || "Het opnameverzoek is verwerkt.",
      });

      await loadLinkedChildOverview();
    } catch (error) {
      setFamilyFeedback({
        type: "error",
        message: error.message || "De goedkeuring kon niet verwerkt worden.",
      });
    } finally {
      setIsReviewingApproval("");
    }
  }

  return (
    <main className="AccountPage">
      <div className="AccountPage__bg" aria-hidden="true">
        <div className="AccountPage__blob AccountPage__blob--1" />
        <div className="AccountPage__blob AccountPage__blob--2" />
      </div>

      <div className="AccountPage__content">
        <div className="AccountPage__topbar">
          <BackBtn />
        </div>

        <section className="AccountCard">
          {session ? (
            <>
              <div className="AccountCard__hero">
                <div className="AccountAvatar">
                  <span className="AccountAvatar__initials">{initials}</span>
                  <div className="AccountAvatar__ring" aria-hidden="true" />
                </div>
                <div className="AccountCard__heroText">
                  <p className="AccountCard__eyebrow">Jouw profiel</p>
                  <h1 className="AccountCard__name">
                    {session.fullName || "Nog niet ingesteld"}
                  </h1>
                  <span className="AccountRoleBadge">{roleLabel}</span>
                </div>
              </div>

              <div className="AccountDivider" aria-hidden="true" />

              <ul className="AccountInfo" role="list">
                <li className="AccountInfo__row">
                  <span className="AccountInfo__icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <div className="AccountInfo__content">
                    <span className="AccountInfo__label">Naam</span>
                    <span className="AccountInfo__value">{session.fullName || "Nog niet ingesteld"}</span>
                  </div>
                </li>

                <li className="AccountInfo__row">
                  <span className="AccountInfo__icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </span>
                  <div className="AccountInfo__content">
                    <span className="AccountInfo__label">E-mailadres</span>
                    <span className="AccountInfo__value">{session.email}</span>
                  </div>
                </li>

                <li className="AccountInfo__row">
                  <span className="AccountInfo__icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 1-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </span>
                  <div className="AccountInfo__content">
                    <span className="AccountInfo__label">Rol</span>
                    <span className="AccountInfo__value">{roleLabel}</span>
                  </div>
                </li>

                <li className="AccountInfo__row">
                  <span className="AccountInfo__icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </span>
                  <div className="AccountInfo__content">
                    <span className="AccountInfo__label">Maandelijkse geplande uitgaven</span>
                    <span className={`AccountInfo__value ${scheduledTotal > 0 ? 'is-expense' : 'is-deposit'}`}>
                      +{formatCurrency(Math.abs(scheduledTotal))}
                    </span>
                  </div>
                </li>
              </ul>

              <div className="AccountDivider" aria-hidden="true" />

              <section className="AccountLinkSection">
                <div className="AccountLinkSection__header">
                  <div>
                    <p className="AccountCard__eyebrow">Koppeling</p>
                    <h2 className="AccountLinkSection__title">
                      {session.role === "parent"
                        ? "Koppel een kindaccount"
                        : "Jouw ouderaccount"}
                    </h2>
                  </div>
                </div>

                {familyFeedback.message ? (
                  <p
                    className={`AccountLinkFeedback ${
                      familyFeedback.type === "error"
                        ? "is-error"
                        : "is-success"
                    }`}
                  >
                    {familyFeedback.message}
                  </p>
                ) : null}

                {isFamilyLoading ? (
                  <p className="AccountLinkHint">Koppeling laden...</p>
                ) : null}

                {session.role === "parent" && familyData.linkedChild ? (
                  <div className="AccountLinkedCard">
                    <span className="AccountLinkedCard__label">Gekoppeld kind</span>
                    <strong className="AccountLinkedCard__name">
                      {familyData.linkedChild.fullName}
                    </strong>
                    <span className="AccountLinkedCard__meta">
                      {familyData.linkedChild.email}
                    </span>
                    <button
                      className="AccountUnlinkButton"
                      type="button"
                      onClick={handleUnlink}
                      disabled={isUnlinking}
                    >
                      {isUnlinking ? "Bezig met loskoppelen..." : "Kind loskoppelen"}
                    </button>
                  </div>
                ) : null}

                {session.role === "child" && familyData.linkedParent ? (
                  <div className="AccountLinkedCard">
                    <span className="AccountLinkedCard__label">Gekoppelde ouder</span>
                    <strong className="AccountLinkedCard__name">
                      {familyData.linkedParent.fullName}
                    </strong>
                    <span className="AccountLinkedCard__meta">
                      {familyData.linkedParent.email}
                    </span>
                    <button
                      className="AccountUnlinkButton"
                      type="button"
                      onClick={handleUnlink}
                      disabled={isUnlinking}
                    >
                      {isUnlinking ? "Bezig met loskoppelen..." : "Ouder loskoppelen"}
                    </button>
                  </div>
                ) : null}

                {session.role === "parent" && !familyData.linkedChild && !isFamilyLoading ? (
                  <form className="AccountLinkForm" onSubmit={handleLinkSubmit}>
                    <p className="AccountLinkHint">
                      Vul het e-mailadres van het kind in om de accounts aan elkaar
                      te koppelen.
                    </p>

                    <label className="AccountLinkField">
                      <span>E-mail van het kind</span>
                      <input
                        type="email"
                        placeholder="kind@email.nl"
                        value={childEmail}
                        onChange={(event) => setChildEmail(event.target.value)}
                        required
                      />
                    </label>

                    <button
                      className="AccountLinkButton"
                      type="submit"
                      disabled={isLinking}
                    >
                      {isLinking ? "Bezig met koppelen..." : "Kind koppelen"}
                    </button>
                  </form>
                ) : null}

                {session.role === "child" && !familyData.linkedParent && !isFamilyLoading ? (
                  <p className="AccountLinkHint">
                    Je bent nog niet gekoppeld aan een ouderaccount. Laat een ouder
                    jouw e-mailadres gebruiken op zijn of haar profielpagina.
                  </p>
                ) : null}

                {session.role === "parent" && familyData.linkedChild ? (
                  <div className="AccountChildOverview">
                    <div className="AccountChildSection">
                      <div className="AccountChildSection__header">
                        <h3 className="AccountChildSection__title">Potjes van je kind</h3>
                        <span className="AccountChildSection__count">
                          {linkedChildPots.length}
                        </span>
                      </div>

                      {isChildOverviewLoading ? (
                        <p className="AccountLinkHint">Kindpotjes laden...</p>
                      ) : linkedChildPots.length === 0 ? (
                        <p className="AccountLinkHint">
                          Je gekoppelde kind heeft nog geen doelpotjes aangemaakt.
                        </p>
                      ) : (
                        <div className="AccountMiniList">
                          {linkedChildPots.slice(0, 4).map((pot) => (
                            <div className="AccountMiniRow" key={pot.id}>
                              <div className="AccountMiniRow__content">
                                <strong>{pot.name}</strong>
                                <span>
                                  Gespaard {formatCurrency(pot.currentBalance)} van{" "}
                                  {formatCurrency(pot.targetAmount)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="AccountChildSection">
                      <div className="AccountChildSection__header">
                        <h3 className="AccountChildSection__title">
                          Recente transacties van je kind
                        </h3>
                      </div>

                      {isChildOverviewLoading ? (
                        <p className="AccountLinkHint">Kindtransacties laden...</p>
                      ) : linkedChildTransactions.length === 0 ? (
                        <p className="AccountLinkHint">
                          Er zijn nog geen transacties van je gekoppelde kind.
                        </p>
                      ) : (
                        <div className="AccountMiniList">
                          {linkedChildTransactions.map((transaction) => (
                            <div className="AccountMiniRow" key={transaction.id}>
                              <div className="AccountMiniRow__content">
                                <strong>{transaction.description}</strong>
                                <span>
                                  {transaction.potName || "Zonder potje"} ·{" "}
                                  {formatDate(transaction.createdAt)}
                                </span>
                              </div>
                              <div className="AccountMiniRow__side">
                                <span
                                  className={`AccountMiniAmount ${
                                    transaction.type === "expense"
                                      ? "is-expense"
                                      : "is-deposit"
                                  }`}
                                >
                                  {transaction.type === "expense" ? "-" : "+"}
                                  {formatCurrency(transaction.amount)}
                                </span>
                                <span className="AccountMiniStatus">
                                  {getTransactionStatusLabel(transaction.status)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="AccountChildSection">
                      <div className="AccountChildSection__header">
                        <h3 className="AccountChildSection__title">Open goedkeuringen</h3>
                        <span className="AccountChildSection__count">
                          {pendingApprovals.length}
                        </span>
                      </div>

                      {isChildOverviewLoading ? (
                        <p className="AccountLinkHint">Goedkeuringen laden...</p>
                      ) : pendingApprovals.length === 0 ? (
                        <p className="AccountLinkHint">
                          Er staan nu geen opnameverzoeken open boven €
                          {appConfig.approvalLimit}.
                        </p>
                      ) : (
                        <div className="AccountApprovalList">
                          {pendingApprovals.map((approval) => (
                            <div className="AccountApprovalCard" key={approval.id}>
                              <div className="AccountApprovalCard__top">
                                <div>
                                  <strong>{approval.description}</strong>
                                  <p>
                                    {approval.potName} · {approval.childName}
                                  </p>
                                </div>
                                <span className="AccountApprovalCard__amount">
                                  {formatCurrency(approval.amount)}
                                </span>
                              </div>

                              <div className="AccountApprovalCard__actions">
                                <button
                                  className="AccountApprovalButton is-approve"
                                  type="button"
                                  disabled={isReviewingApproval === approval.id}
                                  onClick={() =>
                                    handleApprovalAction(approval.id, "approve")
                                  }
                                >
                                  Goedkeuren
                                </button>
                                <button
                                  className="AccountApprovalButton is-reject"
                                  type="button"
                                  disabled={isReviewingApproval === approval.id}
                                  onClick={() =>
                                    handleApprovalAction(approval.id, "reject")
                                  }
                                >
                                  Afwijzen
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </section>

              <button className="AccountLogoutButton" type="button" onClick={handleLogout}>
                Uitloggen
              </button>
            </>
          ) : (
            <div className="AccountEmpty">
              <div className="AccountEmpty__icon" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5"/>
                  <path d="M3 21a9 9 0 0 1 18 0"/>
                </svg>
              </div>
              <p>Je bent nog niet ingelogd.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default AccountPage;
