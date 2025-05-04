from app import create_app  # Importe la fonction create_app de ton application Flask
app = create_app()
if __name__ == '__main__':
    app.run(debug=True)