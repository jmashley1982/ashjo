import hmac
import os
import sys

from dotenv import load_dotenv

load_dotenv()

import anthropic
from flask import Blueprint, Flask, redirect, render_template, request, session, url_for

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
APP_PASSWORD = os.environ.get("APP_PASSWORD") or os.environ.get("SUNO_TOOL_PASS")
FLASK_SECRET_KEY = os.environ.get("FLASK_SECRET_KEY") or os.environ.get("SESSION_SECRET")
PORT = int(os.environ.get("PORT", 8082))
BASE_PATH = os.environ.get("BASE_PATH", "/suno-tool")
CLAUDE_MODEL = os.environ.get("CLAUDE_MODEL", "claude-haiku-4-5")

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

LOCKED_VOCAL_STYLE = (
    "A haunting female soprano with a robotic, glitchy vibrato, "
    "reminiscent of a broken music box."
)

SYSTEM_PROMPT = (
    "You are an expert Suno AI prompt engineer. Your job is to translate musical "
    "ideas into dense, adjective-rich prompts. You must NEVER just repeat an "
    "artist's name. Instead, you MUST translate the artist into their sonic "
    "characteristics (instruments, production techniques, vocal textures, and "
    "rhythmic feels). If a user mentions 'Nirvana', you write 'grunge guitar "
    "sludge, quiet-loud dynamics, raspy anguished vocals'."
)

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

bp = Blueprint("suno_tool", __name__, url_prefix=BASE_PATH)


def build_user_prompt(artist_influences, instruments, music_styles, tempo_mood):
    lines = [f"Artist/band influences to translate: {artist_influences}"]
    if instruments:
        lines.append(f"Instruments requested: {instruments}")
    if music_styles:
        lines.append(f"Music styles/genres requested: {music_styles}")
    if tempo_mood:
        lines.append(f"Tempo/mood requested: {tempo_mood}")
    lines.append(f"Locked vocal style (always include this exactly): {LOCKED_VOCAL_STYLE}")
    lines.append(
        "Output strictly in this bracket format, in this order, and nothing else: "
        "[Genre: ...] [Tempo: ...] [Instruments: ...] [Vocals: ...] [Mood: ...]. "
        "Keep the final prompt under 200 words and heavily descriptive."
    )
    return "\n".join(lines)


def generate_prompt(artist_influences, instruments, music_styles, tempo_mood):
    user_prompt = build_user_prompt(artist_influences, instruments, music_styles, tempo_mood)
    response = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )
    return response.content[0].text.strip()


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

    if request.method == "POST":
        artist_influences = request.form.get("artist_influences", "").strip()
        instruments = request.form.get("instruments", "").strip()
        music_styles = request.form.get("music_styles", "").strip()
        tempo_mood = request.form.get("tempo_mood", "").strip()

        if not artist_influences:
            return render_template(
                "index.html",
                state="form",
                error="Artist/band influences is required.",
            )

        try:
            result = generate_prompt(artist_influences, instruments, music_styles, tempo_mood)
        except anthropic.AuthenticationError:
            return render_template(
                "index.html",
                state="form",
                error="The Anthropic API key is missing or invalid.",
            )
        except anthropic.RateLimitError:
            return render_template(
                "index.html",
                state="form",
                error="Rate limited by the Anthropic API — please wait a moment and try again.",
            )
        except anthropic.APIConnectionError:
            return render_template(
                "index.html",
                state="form",
                error="Couldn't reach the Anthropic API — check your network connection.",
            )
        except anthropic.APIStatusError as e:
            return render_template(
                "index.html",
                state="form",
                error=f"Anthropic API error ({e.status_code}): {e.message}",
            )

        return render_template("index.html", state="result", result=result)

    return render_template("index.html", state="form")


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
