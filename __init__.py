"""Enchanted Composer unified Hermes plugin."""

__all__ = ["__version__", "register"]

__version__ = "0.2.0"


def register(_ctx: object) -> None:
    """Expose the native Hermes plugin entry point; dashboard routes load separately."""
