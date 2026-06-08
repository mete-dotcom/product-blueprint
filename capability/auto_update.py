"""
capability.auto_update — Automatic PyPI package update check.

Shared by all mete-dotcom products:
  - deepstrain
  - code-atlas
  - adauto

Design:
  - Checks PyPI JSON API once per day (cached in ~/.<product>/update_cache)
  - Respects pip's installed package metadata
  - Never blocks startup: background thread, maximum 3s timeout
  - Silent on success, warns on available update
  - Supports opt-out via env var <PRODUCT>_NO_UPDATE or config

Usage:
    from capability.auto_update import check_for_updates

    # In CLI startup:
    check_for_updates("deepstrain", __version__)

    # Or with custom interval / pip args:
    check_for_updates("deepstrain", "0.8.0", interval_hours=24, pip_args="--upgrade --quiet")
"""

from __future__ import annotations

import json
import os
import platform
import subprocess
import sys
import threading
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable
from urllib.request import Request, urlopen


# ── Config ───────────────────────────────────────────────────────────────────

PYPI_JSON_URL = "https://pypi.org/pypi/{package}/json"
DEFAULT_INTERVAL_HOURS = 24
UPDATE_TIMEOUT = 3  # seconds — never block startup


# ── Data ─────────────────────────────────────────────────────────────────────

@dataclass
class UpdateInfo:
    """Result of an update check."""

    current_version: str
    latest_version: str
    update_available: bool
    release_url: str = ""
    error: str | None = None

    @property
    def should_update(self) -> bool:
        return self.update_available and not self.error


# ── Cache ────────────────────────────────────────────────────────────────────

def _cache_dir(product: str) -> Path:
    """Return ~/.<product> directory, creating it if needed."""
    cache = Path.home() / f".{product}"
    cache.mkdir(parents=True, exist_ok=True)
    return cache


def _update_cache_path(product: str) -> Path:
    return _cache_dir(product) / "update_cache.json"


def _read_cache(product: str) -> dict | None:
    """Read cached update check, or None if stale/missing."""
    path = _update_cache_path(product)
    if not path.exists():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        # Check freshness
        checked_at = data.get("checked_at", 0)
        age_hours = (time.time() - checked_at) / 3600
        if age_hours < DEFAULT_INTERVAL_HOURS:
            return data
    except (json.JSONDecodeError, OSError, ValueError):
        pass
    return None


def _write_cache(product: str, data: dict) -> None:
    """Write update check result to cache."""
    try:
        data["checked_at"] = time.time()
        _update_cache_path(product).write_text(
            json.dumps(data, indent=2), encoding="utf-8"
        )
    except OSError:
        pass  # Non-fatal: cache is optional


# ── Version comparison ───────────────────────────────────────────────────────

def _parse_version(version: str) -> tuple:
    """Parse a semver string into a comparable tuple.

    "0.8.0" → (0, 8, 0)
    "0.8.0.dev1" → (0, 8, 0, "dev", 1)
    "1.0.0rc2" → (1, 0, 0, "rc", 2)
    """
    import re
    parts = re.split(r"[._-]", version.strip().lstrip("vV"))
    result: list[int | str] = []
    for p in parts:
        try:
            result.append(int(p))
        except ValueError:
            # For "dev", "rc", "a", "b" etc. — sort after release
            result.append(p)
    return tuple(result)


def _is_newer(latest: str, current: str) -> bool:
    """Compare two version strings: is latest > current?"""
    try:
        return _parse_version(latest) > _parse_version(current)
    except Exception:
        return False


# ── PyPI check ───────────────────────────────────────────────────────────────

def _check_pypi(package: str) -> tuple[str | None, str | None]:
    """Query PyPI JSON API for the latest version.

    Returns:
        (latest_version, release_url_or_None)
        On error: (None, error_message)
    """
    url = PYPI_JSON_URL.format(package=package)
    req = Request(url, headers={"User-Agent": f"{package}-auto-update/1.0"})
    try:
        with urlopen(req, timeout=UPDATE_TIMEOUT) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        info = data.get("info", {})
        latest = info.get("version")
        release_url = info.get("release_url", info.get("home_page", ""))
        if not latest:
            return None, "PyPI response missing version field"
        return latest, release_url
    except Exception as exc:
        return None, f"PyPI check failed: {type(exc).__name__}: {exc}"


# ── Update execution ─────────────────────────────────────────────────────────

def _run_update(
    package: str,
    pip_args: str = "",
    progress_callback: Callable[[str], None] | None = None,
) -> tuple[bool, str]:
    """Run pip install --upgrade for the given package.

    Returns:
        (success, message)
    """
    cmd = [
        sys.executable, "-m", "pip", "install", "--upgrade",
        *pip_args.split(),
        package,
    ]
    try:
        if progress_callback:
            progress_callback(f"Updating {package}...")
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120,
        )
        if result.returncode == 0:
            return True, f"{package} updated successfully"
        else:
            return False, f"pip install failed:\n{result.stderr.strip()}"
    except subprocess.TimeoutExpired:
        return False, "Update timed out after 120s"
    except Exception as exc:
        return False, f"Update failed: {type(exc).__name__}: {exc}"


# ── Public API ───────────────────────────────────────────────────────────────

def check_for_updates(
    package: str,
    current_version: str,
    interval_hours: int = DEFAULT_INTERVAL_HOURS,
    pip_args: str = "",
    on_update: Callable[[UpdateInfo], None] | None = None,
    background: bool = True,
) -> UpdateInfo:
    """Check for available updates on PyPI.

    Args:
        package: PyPI package name (e.g. "deepstrain")
        current_version: Currently installed version (e.g. __version__)
        interval_hours: How often to check (default 24). 0 = always check.
        pip_args: Extra args for pip install --upgrade (e.g. "--quiet")
        on_update: Optional callback when update is available.
                   If None, prints a warning to stderr.
        background: If True, runs PyPI check in a background thread.
                    Returns cached result immediately.

    Returns:
        UpdateInfo with check results.
    """
    env_var = f"{package.upper().replace('-', '_')}_NO_UPDATE"
    if os.environ.get(env_var, "").lower() in ("1", "true", "yes"):
        return UpdateInfo(
            current_version=current_version,
            latest_version=current_version,
            update_available=False,
            error="Disabled by environment",
        )

    # Check cache first
    cached = _read_cache(package)
    if cached:
        latest = cached.get("latest_version", current_version)
        avail = _is_newer(latest, current_version)
        info = UpdateInfo(
            current_version=current_version,
            latest_version=latest,
            update_available=avail,
            release_url=cached.get("release_url", ""),
        )
        if avail and on_update:
            on_update(info)
        return info

    if background:
        # Return a placeholder immediately, check in background
        thread = threading.Thread(
            target=_background_check,
            args=(package, current_version, pip_args, on_update),
            daemon=True,
            name=f"{package}-update-check",
        )
        thread.start()
        return UpdateInfo(
            current_version=current_version,
            latest_version=current_version,
            update_available=False,
            note="Checking in background",
        )

    # Synchronous check
    latest, release_url = _check_pypi(package)
    if latest is None:
        return UpdateInfo(
            current_version=current_version,
            latest_version=current_version,
            update_available=False,
            error=release_url,  # contains error message
        )

    avail = _is_newer(latest, current_version)
    info = UpdateInfo(
        current_version=current_version,
        latest_version=latest,
        update_available=avail,
        release_url=release_url or "",
    )

    # Cache result
    _write_cache(package, {
        "latest_version": latest,
        "release_url": release_url,
        "package": package,
    })

    if avail and on_update:
        on_update(info)
    elif avail and not on_update:
        _default_on_update(info)

    return info


def _background_check(
    package: str,
    current_version: str,
    pip_args: str,
    on_update: Callable[[UpdateInfo], None] | None,
) -> None:
    """Background thread target: check PyPI and optionally update."""
    latest, release_url = _check_pypi(package)
    if latest is None:
        return

    avail = _is_newer(latest, current_version)
    info = UpdateInfo(
        current_version=current_version,
        latest_version=latest,
        update_available=avail,
        release_url=release_url or "",
    )

    _write_cache(package, {
        "latest_version": latest,
        "release_url": release_url,
        "package": package,
    })

    if avail:
        if on_update:
            on_update(info)
        else:
            _default_on_update(info)


def _default_on_update(info: UpdateInfo) -> None:
    """Default handler: print warning to stderr."""
    print(
        f"\n  ╭─{'─' * 50}─╮"
        f"\n  │  📦  Update available: {info.current_version} → {info.latest_version}"
        f"\n  │  {' ' * 50}  │"
        f"\n  │     pip install --upgrade deepstrain"
        f"\n  │     or set DEEPSTRAIN_NO_UPDATE=1 to disable"
        f"\n  ╰─{'─' * 50}─╯"
        f"\n",
        file=sys.stderr,
        flush=True,
    )


# ── Auto-update (with automatic execution) ───────────────────────────────────

def auto_update(
    package: str,
    current_version: str,
    interval_hours: int = DEFAULT_INTERVAL_HOURS,
    pip_args: str = "--quiet",
    interactive: bool = False,
) -> UpdateInfo:
    """Check for update AND install it automatically.

    Args:
        package: PyPI package name
        current_version: Current installed version
        interval_hours: Check interval
        pip_args: Extra pip args
        interactive: If True, ask user before updating.
                     If False, update silently in background.

    Returns:
        UpdateInfo after the update attempt.
    """
    info = check_for_updates(
        package=package,
        current_version=current_version,
        interval_hours=interval_hours,
        background=False,  # need result to decide
    )

    if not info.should_update:
        return info  # Already up to date

    if interactive:
        try:
            response = input(
                f"\n  📦 Update available: {info.current_version} → {info.latest_version}\n"
                f"     Update now? [Y/n] "
            ).strip().lower()
            if response not in ("", "y", "yes"):
                print("  Skipping update.")
                return info
        except (EOFError, KeyboardInterrupt):
            return info

    success, msg = _run_update(package, pip_args)
    if success:
        info.update_available = False  # Already updated
    info.error = msg if not success else None
    return info


# ── CLI helper ───────────────────────────────────────────────────────────────

def add_update_parser(subparsers, package: str = "deepstrain") -> None:
    """Add 'update' subcommand to an argparse subparser group.

    Usage in cli.py:
        parser = argparse.ArgumentParser()
        sub = parser.add_subparsers()
        from capability.auto_update import add_update_parser
        add_update_parser(sub)
    """
    update_parser = subparsers.add_parser(
        "update", help="Check and install updates from PyPI"
    )
    update_parser.add_argument(
        "--check", action="store_true",
        help="Only check, don't install"
    )
    update_parser.add_argument(
        "--force", action="store_true",
        help="Force re-check (ignore cache)"
    )
    update_parser.set_defaults(func=lambda args: _cmd_update(args, package))


def _cmd_update(args, package: str) -> None:
    """Handle 'deepstrain update' CLI command."""
    from importlib.metadata import version as _ver
    try:
        cur = _ver(package)
    except Exception:
        cur = "0.0.0"

    if args.force:
        # Clear cache by touching cache with old timestamp
        from pathlib import Path
        cache = Path.home() / f".{package}" / "update_cache.json"
        if cache.exists():
            cache.unlink()

    if args.check:
        info = check_for_updates(package, cur, background=False)
        if info.update_available:
            print(f"📦 Update available: {cur} → {info.latest_version}")
            if info.release_url:
                print(f"   {info.release_url}")
        elif info.error:
            print(f"⚠  {info.error}")
        else:
            print(f"✓  Already up to date ({cur})")
    else:
        info = auto_update(package, cur, interactive=True)
        if info.update_available is False and not info.error:
            print(f"✓  Already up to date ({cur})")
        elif info.update_available and info.error:
            print(f"⚠  Update failed: {info.error}")
        elif not info.update_available and not info.error:
            print(f"✓  Updated to {info.latest_version}")
        elif info.error and "already up to date" in info.error.lower():
            print(f"✓  Already up to date ({cur})")
        else:
            print(f"✓  {info.latest_version}")
