function AuthCard({
  eyebrow,
  title,
  description,
  feedback,
  onSubmit,
  children,
}) {
  return (
    <form className="AuthCard" onSubmit={onSubmit}>
      <p className="AuthEyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="AuthDescription">{description}</p>

      {feedback?.message && (
        <p className={`AuthFeedback ${feedback.type}`}>{feedback.message}</p>
      )}

      {children}
    </form>
  );
}

export default AuthCard;
