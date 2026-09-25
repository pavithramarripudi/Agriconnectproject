import React from "react";

export function RoleSelection({ onSelectRole, onBack, t }) {
  const roles = [
    {
      id: "farmer",
      title: t.farmer,
      desc: t.farmerText,
      icon: "👨‍🌾",
    },
    {
      id: "buyer",
      title: t.buyer,
      desc: t.buyerText,
      icon: "🏪",
    },
    {
      id: "delivery",
      title: t.delivery,
      desc: t.deliveryText,
      icon: "🚚",
    },
    {
      id: "admin",
      title: t.admin,
      desc: t.adminText,
      icon: "🛡️",
    },
  ];

  return (
    <div className="page">
      <div className="card role-card shadow-lg">
        <button className="back-btn" onClick={onBack} title={t.back}>
          ← {t.back}
        </button>

        <div className="small-logo">🌿</div>

        <h1>{t.whoAreYou}</h1>
        <p className="subtitle">{t.chooseRole}</p>

        <div className="role-list">
          {roles.map((role) => (
            <button
              key={role.id}
              className="role-btn"
              onClick={() => onSelectRole(role.id)}
            >
              <span className="role-icon">{role.icon}</span>

              <div>
                <strong>{role.title}</strong>
                <small>{role.desc}</small>
              </div>

              <span className="role-arrow">›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;
