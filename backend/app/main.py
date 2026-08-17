import os
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware


APP_NAME = os.getenv("APP_NAME", "Football Club Manager")
APP_VERSION = os.getenv("APP_VERSION", "0.2.0")

FIELD_DEFINITIONS: list[dict[str, Any]] =     [{'name': 'name', 'label': 'Player name', 'type': 'text', 'required': True},
     {'name': 'position', 'label': 'Position', 'type': 'text', 'required': True},
     {'name': 'age', 'label': 'Age', 'type': 'number', 'required': True, 'min': 15},
     {'name': 'contract_until',
      'label': 'Contract until',
      'type': 'number',
      'required': True,
      'min': 2024},
     {'name': 'salary_kchf', 'label': 'Salary (kCHF)', 'type': 'number', 'required': False, 'min': 0}]

ACTION_DEFINITIONS: list[dict[str, Any]] =     [{'id': 'extend_contract',
      'label': 'Extend contract',
      'type': 'increment',
      'field': 'contract_until',
      'amount': 1},
     {'id': 'increase_salary',
      'label': 'Raise salary',
      'type': 'increment',
      'field': 'salary_kchf',
      'amount': 10}]

SEED_ITEMS: list[dict[str, Any]] =     [{'name': 'Noah Keller',
      'position': 'Goalkeeper',
      'age': 24,
      'contract_until': 2027,
      'salary_kchf': 120},
     {'name': 'Luca Moretti',
      'position': 'Midfielder',
      'age': 21,
      'contract_until': 2026,
      'salary_kchf': 95},
     {'name': 'Elias Baumann',
      'position': 'Forward',
      'age': 27,
      'contract_until': 2028,
      'salary_kchf': 180}]

ITEMS: list[dict[str, Any]] = [
    {"id": index + 1, **item}
    for index, item in enumerate(SEED_ITEMS)
]

app = FastAPI(title=APP_NAME, version=APP_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _next_id() -> int:
    if not ITEMS:
        return 1
    return max(item["id"] for item in ITEMS) + 1


def _find_item(item_id: int) -> dict[str, Any]:
    for item in ITEMS:
        if item["id"] == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")


def _find_action(action_id: str) -> dict[str, Any]:
    for action in ACTION_DEFINITIONS:
        if action["id"] == action_id:
            return action
    raise HTTPException(status_code=404, detail="Action not found")


def _validate_payload(payload: dict[str, Any]) -> dict[str, Any]:
    cleaned: dict[str, Any] = {}

    for field in FIELD_DEFINITIONS:
        name = field["name"]
        value = payload.get(name)

        if field.get("required") and (value is None or str(value).strip() == ""):
            raise HTTPException(status_code=422, detail=f"Missing required field: {name}")

        if value is None or value == "":
            cleaned[name] = None
            continue

        if field["type"] == "number":
            try:
                number = float(value)
            except (TypeError, ValueError) as exc:
                raise HTTPException(status_code=422, detail=f"Field {name} must be numeric") from exc

            minimum = field.get("min")
            maximum = field.get("max")

            if minimum is not None and number < minimum:
                raise HTTPException(
                    status_code=422,
                    detail=f"Field {name} must be greater than or equal to {minimum}",
                )

            if maximum is not None and number > maximum:
                raise HTTPException(
                    status_code=422,
                    detail=f"Field {name} must be lower than or equal to {maximum}",
                )

            cleaned[name] = int(number) if number.is_integer() else round(number, 2)
        else:
            cleaned[name] = str(value).strip()

    return cleaned


def _apply_action(item: dict[str, Any], action: dict[str, Any]) -> dict[str, Any]:
    field = action["field"]
    current_value = item.get(field) or 0

    if action["type"] == "increment":
        new_value = float(current_value) + float(action["amount"])
        if "min" in action:
            new_value = max(new_value, float(action["min"]))
        if "max" in action:
            new_value = min(new_value, float(action["max"]))
        item[field] = int(new_value) if new_value.is_integer() else round(new_value, 2)

    elif action["type"] == "multiply":
        new_value = float(current_value) * float(action["factor"])
        if "min" in action:
            new_value = max(new_value, float(action["min"]))
        if "max" in action:
            new_value = min(new_value, float(action["max"]))
        item[field] = round(new_value, 2)

    elif action["type"] == "set":
        item[field] = action["value"]

    else:
        raise HTTPException(status_code=400, detail="Unsupported action type")

    return item


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "application": APP_NAME, "version": APP_VERSION}


@app.get("/meta")
def metadata() -> dict[str, Any]:
    return {
        "application": APP_NAME,
        "version": APP_VERSION,
        "entity": "player",
        "plural": "players",
        "fields": FIELD_DEFINITIONS,
        "actions": ACTION_DEFINITIONS,
    }


@app.get("/summary")
def summary() -> dict[str, Any]:
    return {
        "total": len(ITEMS),
        "first_field": FIELD_DEFINITIONS[0]["name"],
        "theme": "Football Club Manager",
    }


@app.get("/items")
def list_items() -> list[dict[str, Any]]:
    return ITEMS


@app.get("/items/{item_id}")
def get_item(item_id: int) -> dict[str, Any]:
    return _find_item(item_id)


@app.post("/items", status_code=201)
def create_item(payload: dict[str, Any]) -> dict[str, Any]:
    item = {"id": _next_id(), **_validate_payload(payload)}
    ITEMS.append(item)
    return item


@app.put("/items/{item_id}")
def update_item(item_id: int, payload: dict[str, Any]) -> dict[str, Any]:
    item = _find_item(item_id)
    item.update(_validate_payload(payload))
    return item


@app.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int) -> None:
    item = _find_item(item_id)
    ITEMS.remove(item)


@app.post("/items/{item_id}/actions/{action_id}")
def run_action(item_id: int, action_id: str) -> dict[str, Any]:
    item = _find_item(item_id)
    action = _find_action(action_id)
    return _apply_action(item, action)
