try:
    from .app import main
except ImportError:  # PyInstaller script entry fallback
    from app import main

main()
