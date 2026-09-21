window.APP_CONFIG = {
  title: "Football Club Manager",
  subtitle: "Track players, contracts and squad information.",
  entity: "player",
  plural: "players",
  accent: "#1d7a46",
  apiBaseUrl: "/api",
  fields: [
  {
    "name": "name",
    "label": "Player name",
    "type": "text",
    "required": true
  },
  {
    "name": "position",
    "label": "Position",
    "type": "text",
    "required": true
  },
  {
    "name": "age",
    "label": "Age",
    "type": "number",
    "required": true,
    "min": 15,
    "max": 120
  },
  {
    "name": "contract_until",
    "label": "Contract until",
    "type": "number",
    "required": true,
    "min": 2024
  },
  {
    "name": "salary_kchf",
    "label": "Salary (kCHF)",
    "type": "number",
    "required": false,
    "min": 0
  }
],
  actions: [
  {
    "id": "extend_contract",
    "label": "Extend contract",
    "type": "increment",
    "field": "contract_until",
    "amount": 1
  },
  {
    "id": "increase_salary",
    "label": "Raise salary",
    "type": "increment",
    "field": "salary_kchf",
    "amount": 10
  }
]
};
