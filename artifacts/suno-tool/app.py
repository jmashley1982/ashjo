import hmac
import os
import sys

from dotenv import load_dotenv

load_dotenv()

import anthropic
from flask import Blueprint, Flask, redirect, render_template, request, session, url_for

import db

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
APP_PASSWORD = os.environ.get("APP_PASSWORD") or os.environ.get("SUNO_TOOL_PASS")
FLASK_SECRET_KEY = os.environ.get("FLASK_SECRET_KEY") or os.environ.get("SESSION_SECRET")
PORT = int(os.environ.get("PORT", 8082))
BASE_PATH = os.environ.get("BASE_PATH", "/suno-tool")

missing = [
    name
    for name, value in [
        ("ANTHROPIC_API_KEY", ANTHROPIC_API_KEY),
        ("APP_PASSWORD", APP_PASSWORD),
        ("FLASK_SECRET_KEY", FLASK_SECRET_KEY),
    ]
    if not value
]
if missing:
    print(
        f"Missing required environment variable(s): {', '.join(missing)}. "
        "Copy .env.example to .env and fill them in.",
        file=sys.stderr,
    )
    sys.exit(1)

MODEL_CHOICES = {
    "haiku": "claude-haiku-4-5",
    "sonnet": "claude-sonnet-5",
}
DEFAULT_MODEL_CHOICE = os.environ.get("DEFAULT_MODEL_CHOICE", "haiku")
if DEFAULT_MODEL_CHOICE not in MODEL_CHOICES:
    DEFAULT_MODEL_CHOICE = "haiku"

EXAMPLE_PROMPT = (
    "Atmospheric sludge-pop with post-hardcore angst and math-rock dissonance at "
    "85–95 BPM: downtuned 7-string guitars in syrupy distortion, fat 5-string bass "
    "in sub-heavy rumble, precise polyrhythmic drums, and ethereal ambient beds under a "
    "dense wall of sound. Haunting female soprano gets robotic glitch vibrato, cavernous "
    "reverb, stark dynamics, abrasive noise, and hooky pop tension."
)

SYSTEM_PROMPT = (
    "You are an expert Suno AI prompt engineer. Your job is to translate musical ideas "
    "into a single, dense, adjective-rich paragraph that Suno can use as a style prompt. "
    "You must NEVER just repeat an artist's name. Instead, you MUST translate the artist "
    "into their sonic characteristics (instruments, production techniques, vocal textures, "
    "and rhythmic feels). If a user mentions 'Nirvana', write 'grunge guitar sludge, "
    "quiet-loud dynamics, raspy anguished vocals' instead of the artist's name.\n\n"
    "Write in exactly this style — one flowing paragraph, not a list of labeled fields, "
    "strictly under 1000 characters total:\n\n"
    f'"{EXAMPLE_PROMPT}"\n\n'
    "Structure: open with genre/mood descriptors and a BPM range, then a colon introducing "
    "a clause that names each instrument together with its production texture, then a "
    "second sentence describing the vocal style and its production treatment. Output ONLY "
    "the finished paragraph — no preamble, no labels, no quotation marks, no bracketed fields."
)

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

bp = Blueprint("suno_tool", __name__, url_prefix=BASE_PATH)


def split_freetext(value):
    """Split a comma-separated free-text field into trimmed, non-empty items."""
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


def combine_checked_and_freetext(checked_values, freetext_value):
    """Merge checked preset texts with newly typed free-text items, preserving order, deduped."""
    combined = []
    seen = set()
    for value in list(checked_values) + split_freetext(freetext_value):
        key = value.lower()
        if key not in seen:
            seen.add(key)
            combined.append(value)
    return ", ".join(combined)


def build_user_prompt(artist_influences, instruments, music_styles, tempo_mood, vocal_style):
    lines = [f"Artist/band influences to translate: {artist_influences}"]
    if instruments:
        lines.append(f"Instruments requested: {instruments}")
    if music_styles:
        lines.append(f"Music styles/genres requested: {music_styles}")
    if tempo_mood:
        lines.append(f"Tempo/mood requested: {tempo_mood}")
    lines.append(
        "Vocal style (incorporate these vocal characteristics into the final paragraph, "
        f"rephrased as needed to fit naturally): {vocal_style}"
    )
    lines.append(
        "Write the final prompt as a single flowing paragraph in the exact style shown in "
        "your instructions. Do not use bracketed or labeled fields. Keep the entire "
        "paragraph strictly under 1000 characters."
    )
    return "\n".join(lines)


def generate_prompt(model_id, artist_influences, instruments, music_styles, tempo_mood, vocal_style):
    user_prompt = build_user_prompt(artist_influences, instruments, music_styles, tempo_mood, vocal_style)
    response = client.messages.create(
        model=model_id,
        max_tokens=500,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )
    return response.content[0].text.strip()


def _preset_lists(conn):
    return {
        "vocal_styles": db.list_presets(conn, "vocal_style"),
        "instruments": db.list_presets(conn, "instrument"),
        "moods": db.list_presets(conn, "mood"),
        "influences": db.list_presets(conn, "influence"),
    }


@bp.route("/", methods=["GET", "POST"])
def index():
    if not session.get("authenticated"):
        error = None
        if request.method == "POST":
            submitted = request.form.get("password", "")
            if hmac.compare_digest(submitted, APP_PASSWORD):
                session["authenticated"] = True
                return redirect(url_for("suno_tool.index"))
            error = "Incorrect password."
        return render_template("index.html", state="login", error=error)

    conn = db.get_db()

    if request.method == "POST":
        artist_influences_text = request.form.get("artist_influences", "").strip()
        influence_checked = request.form.getlist("influence_checked")
        instruments_text = request.form.get("instruments", "").strip()
        instrument_checked = request.form.getlist("instrument_checked")
        music_styles = request.form.get("music_styles", "").strip()
        tempo_mood_text = request.form.get("tempo_mood", "").strip()
        mood_checked = request.form.getlist("mood_checked")
        vocal_style_text = request.form.get("vocal_style_text", "").strip()
        model_choice = request.form.get("model_choice", DEFAULT_MODEL_CHOICE)
        if model_choice not in MODEL_CHOICES:
            model_choice = DEFAULT_MODEL_CHOICE

        db.set_setting(conn, "model_choice", model_choice)

        vocal_style_save_as = request.form.get("vocal_style_save_as", "").strip()
        if vocal_style_save_as and vocal_style_text:
            preset_id = db.save_preset(conn, "vocal_style", vocal_style_save_as, vocal_style_text)
            db.set_setting(conn, "active_vocal_style_id", str(preset_id))
        else:
            match = conn.execute(
                "SELECT id FROM presets WHERE category = 'vocal_style' AND text = ?",
                (vocal_style_text,),
            ).fetchone()
            if match:
                db.set_setting(conn, "active_vocal_style_id", str(match["id"]))

        if request.form.get("remember_influences") and artist_influences_text:
            for item in split_freetext(artist_influences_text):
                db.add_preset_if_missing(conn, "influence", item, item)
        if request.form.get("remember_instruments") and instruments_text:
            for item in split_freetext(instruments_text):
                db.add_preset_if_missing(conn, "instrument", item, item)
        if request.form.get("remember_moods") and tempo_mood_text:
            for item in split_freetext(tempo_mood_text):
                db.add_preset_if_missing(conn, "mood", item, item)

        artist_influences = combine_checked_and_freetext(influence_checked, artist_influences_text)
        instruments = combine_checked_and_freetext(instrument_checked, instruments_text)
        tempo_mood = combine_checked_and_freetext(mood_checked, tempo_mood_text)

        if not artist_influences:
            return render_template(
                "index.html",
                state="form",
                error="Artist/band influences is required.",
                presets=_preset_lists(conn),
                model_choices=MODEL_CHOICES,
                selected_model=model_choice,
                vocal_style_text=vocal_style_text,
                active_vocal_style_id=db.get_setting(conn, "active_vocal_style_id"),
            )

        try:
            result = generate_prompt(
                MODEL_CHOICES[model_choice],
                artist_influences,
                instruments,
                music_styles,
                tempo_mood,
                vocal_style_text,
            )
        except anthropic.AuthenticationError:
            return render_template(
                "index.html",
                state="form",
                error="The Anthropic API key is missing or invalid.",
                presets=_preset_lists(conn),
                model_choices=MODEL_CHOICES,
                selected_model=model_choice,
                vocal_style_text=vocal_style_text,
                active_vocal_style_id=db.get_setting(conn, "active_vocal_style_id"),
            )
        except anthropic.RateLimitError:
            return render_template(
                "index.html",
                state="form",
                error="Rate limited by the Anthropic API — please wait a moment and try again.",
                presets=_preset_lists(conn),
                model_choices=MODEL_CHOICES,
                selected_model=model_choice,
                vocal_style_text=vocal_style_text,
                active_vocal_style_id=db.get_setting(conn, "active_vocal_style_id"),
            )
        except anthropic.APIConnectionError:
            return render_template(
                "index.html",
                state="form",
                error="Couldn't reach the Anthropic API — check your network connection.",
                presets=_preset_lists(conn),
                model_choices=MODEL_CHOICES,
                selected_model=model_choice,
                vocal_style_text=vocal_style_text,
                active_vocal_style_id=db.get_setting(conn, "active_vocal_style_id"),
            )
        except anthropic.APIStatusError as e:
            return render_template(
                "index.html",
                state="form",
                error=f"Anthropic API error ({e.status_code}): {e.message}",
                presets=_preset_lists(conn),
                model_choices=MODEL_CHOICES,
                selected_model=model_choice,
                vocal_style_text=vocal_style_text,
                active_vocal_style_id=db.get_setting(conn, "active_vocal_style_id"),
            )

        return render_template("index.html", state="result", result=result)

    model_choice = db.get_setting(conn, "model_choice", DEFAULT_MODEL_CHOICE)
    if model_choice not in MODEL_CHOICES:
        model_choice = DEFAULT_MODEL_CHOICE

    active_vocal_style_id = db.get_setting(conn, "active_vocal_style_id")
    vocal_style_text = db.SEED_VOCAL_STYLE_TEXT
    if active_vocal_style_id:
        active = db.get_preset(conn, int(active_vocal_style_id))
        if active:
            vocal_style_text = active["text"]

    return render_template(
        "index.html",
        state="form",
        presets=_preset_lists(conn),
        model_choices=MODEL_CHOICES,
        selected_model=model_choice,
        vocal_style_text=vocal_style_text,
        active_vocal_style_id=active_vocal_style_id,
    )


@bp.route("/presets")
def presets():
    if not session.get("authenticated"):
        return redirect(url_for("suno_tool.index"))
    conn = db.get_db()
    return render_template("presets.html", presets=_preset_lists(conn))


@bp.route("/presets/save", methods=["POST"])
def presets_save():
    if not session.get("authenticated"):
        return redirect(url_for("suno_tool.index"))
    conn = db.get_db()
    category = request.form.get("category", "")
    label = request.form.get("label", "").strip()
    text = request.form.get("text", "").strip()
    if category in db.CATEGORIES and label and text:
        db.save_preset(conn, category, label, text)
    next_url = request.form.get("next") or url_for("suno_tool.presets")
    return redirect(next_url)


@bp.route("/presets/<int:preset_id>/delete", methods=["POST"])
def presets_delete(preset_id):
    if not session.get("authenticated"):
        return redirect(url_for("suno_tool.index"))
    conn = db.get_db()
    preset = db.get_preset(conn, preset_id)
    db.delete_preset(conn, preset_id)
    if preset and str(db.get_setting(conn, "active_vocal_style_id")) == str(preset_id):
        db.set_setting(conn, "active_vocal_style_id", "")
    next_url = request.form.get("next") or url_for("suno_tool.presets")
    return redirect(next_url)


@bp.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("suno_tool.index"))


app = Flask(__name__)
app.secret_key = FLASK_SECRET_KEY
app.config.update(
    SESSION_COOKIE_NAME="suno_tool_session",
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=os.environ.get("FLASK_ENV") == "production",
    SESSION_COOKIE_PATH=BASE_PATH,
)
app.register_blueprint(bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
